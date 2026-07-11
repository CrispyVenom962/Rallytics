// api/stripe-webhook.js — Receives Stripe subscription events and records
// Pro status in Airtable so analyze.js can grant the higher allowance.
//
// Manual signature verification via node:crypto, no Stripe SDK — same
// no-dependency pattern as the rest of this codebase. This is the one place
// that MUST see the raw, unparsed request body: Stripe signs the exact bytes
// it sent, and re-serializing a parsed JSON object won't produce the same
// bytes, so body parsing is disabled below and the raw body is read manually.
//
// REQUIRED SETUP — do this before events will do anything:
// 1. Airtable "Analysis" table needs three new fields (mirrors VideoHashes
//    setup from earlier): StripeCustomerId (text), SubscriptionStatus (text),
//    ProSince (text or date).
// 2. In Stripe Dashboard → Developers → Webhooks, add an endpoint pointing to
//    https://www.fortyfifteen.app/api/stripe-webhook, subscribed to at least:
//    checkout.session.completed, customer.subscription.updated,
//    customer.subscription.deleted.
// 3. Stripe will show a signing secret (whsec_...) once that endpoint exists —
//    add it as STRIPE_WEBHOOK_SECRET in Vercel env vars.

import { createHmac, timingSafeEqual } from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = "Analysis";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const TOLERANCE_SECONDS = 300; // reject events with timestamps older than 5 minutes — replay protection

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > TOLERANCE_SECONDS) return false;

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;

  return timingSafeEqual(expectedBuf, signatureBuf);
}

async function findAirtableRecordByEmail(email) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
  const data = await r.json();
  return data.records?.[0] || null;
}

async function upsertSubscriptionStatus(email, fields) {
  const existing = await findAirtableRecordByEmail(email);
  if (existing) {
    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}/${existing.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
  } else {
    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { Email: email, ...fields } }),
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!STRIPE_WEBHOOK_SECRET || !AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    console.error("stripe-webhook error: missing required env vars");
    return res.status(500).json({ error: "CONFIG_ERROR" });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error("stripe-webhook: failed reading raw body:", e.message);
    return res.status(400).json({ error: "BAD_REQUEST" });
  }

  const signatureHeader = req.headers["stripe-signature"];
  if (!verifyStripeSignature(rawBody, signatureHeader, STRIPE_WEBHOOK_SECRET)) {
    console.error("stripe-webhook: signature verification failed");
    return res.status(400).json({ error: "INVALID_SIGNATURE" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    console.error("stripe-webhook: failed parsing event JSON:", e.message);
    return res.status(400).json({ error: "BAD_REQUEST" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = (session.customer_email || session.metadata?.email || "").toLowerCase().trim();
        if (email) {
          await upsertSubscriptionStatus(email, {
            StripeCustomerId: session.customer || "",
            SubscriptionStatus: "active",
            ProSince: new Date().toISOString().slice(0, 10),
          });
        } else {
          console.error("checkout.session.completed: no email found on session", session.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        // Look up by Stripe customer ID isn't directly supported by our simple
        // Airtable lookup (which is email-keyed), so this relies on the email
        // already being present from the checkout.session.completed event.
        // Stripe includes customer email on the subscription's related
        // invoice/customer object in most cases; falling back to metadata.
        const email = (sub.metadata?.email || "").toLowerCase().trim();
        if (email) {
          await upsertSubscriptionStatus(email, {
            SubscriptionStatus: sub.status, // active | past_due | canceled | unpaid, etc.
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const email = (sub.metadata?.email || "").toLowerCase().trim();
        if (email) {
          await upsertSubscriptionStatus(email, {
            SubscriptionStatus: "canceled",
          });
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore — Stripe sends many more
        // event types than we currently act on.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("stripe-webhook handler error:", e.message);
    // Return 200 anyway once signature is verified — Stripe retries on non-2xx,
    // and a transient Airtable error shouldn't trigger a retry storm. Errors
    // are logged above for manual follow-up instead.
    return res.status(200).json({ received: true, warning: "processing_error" });
  }
}
