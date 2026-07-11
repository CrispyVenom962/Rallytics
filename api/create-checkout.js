// api/create-checkout.js — Creates a Stripe Checkout Session for Forty Fifteen Pro
//
// Uses Stripe's REST API directly via fetch, matching how the rest of this
// codebase talks to Airtable/Resend/Kit — no SDK dependency to install or manage.
//
// NOT yet linked from pricing.html — this is backend infrastructure to test
// privately first. Wire it up once the full loop (checkout → webhook →
// Airtable → analyze.js Pro-tier gate) has been verified end-to-end, and
// once Stripe is switched from test mode to live mode.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRO_PRICE_ID = "price_1TrKCpDcPZS8t29G186lhExa"; // Forty Fifteen Pro — $12.00 CAD/month
const SITE_URL = "https://www.fortyfifteen.app";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!STRIPE_SECRET_KEY) {
    console.error("create-checkout error: STRIPE_SECRET_KEY not configured");
    return res.status(500).json({ error: "CONFIG_ERROR", message: "Checkout is temporarily unavailable." });
  }

  const { email } = req.body || {};
  const emailNorm = (email || "").trim().toLowerCase();

  if (!emailNorm || !EMAIL_RE.test(emailNorm)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "Please enter a valid email address." });
  }

  // Stripe's REST API takes application/x-www-form-urlencoded, not JSON —
  // nested params use bracket notation (line_items[0][price], etc.)
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("line_items[0][price]", PRO_PRICE_ID);
  params.append("line_items[0][quantity]", "1");
  params.append("customer_email", emailNorm);
  // client_reference_id and metadata both carry the email through to the
  // webhook, so we can match the completed subscription back to the right
  // Airtable record even before Customer objects are fully set up.
  params.append("client_reference_id", emailNorm);
  params.append("metadata[email]", emailNorm);
  params.append("metadata[source]", "pricing_page");
  // Session-level metadata does NOT automatically carry over to the resulting
  // Subscription object — subscription.updated/.deleted webhook events only
  // include the subscription, not the checkout session, so without this the
  // webhook would have no email to look up on cancellation events.
  params.append("subscription_data[metadata][email]", emailNorm);
  params.append("success_url", `${SITE_URL}/?pro=success`);
  params.append("cancel_url", `${SITE_URL}/pricing.html`);

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe checkout session error:", data);
      return res.status(502).json({ error: "CHECKOUT_FAILED", message: "Could not start checkout. Please try again." });
    }

    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error("create-checkout handler error:", e.message);
    return res.status(500).json({ error: "CHECKOUT_FAILED", message: "Could not start checkout. Please try again." });
  }
}
