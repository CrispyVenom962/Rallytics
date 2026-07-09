// api/waitlist.js — Pro waitlist email capture
// Zero AI cost — this only talks to ConvertKit (Kit), same pattern already
// proven working in analyze.js's sendResultsEmail. Kept as its own tiny
// endpoint so the pricing page can capture emails directly instead of
// routing everyone through the external Tally form.

const KIT_API_KEY_ENV = "KIT_API_KEY";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, firstName } = req.body || {};
  const emailNorm = (email || "").trim().toLowerCase();

  if (!emailNorm || !EMAIL_RE.test(emailNorm)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "Please enter a valid email address." });
  }

  const KIT_API_KEY = process.env[KIT_API_KEY_ENV];
  if (!KIT_API_KEY) {
    console.error("Waitlist error: KIT_API_KEY not configured");
    return res.status(500).json({ error: "CONFIG_ERROR", message: "Signup is temporarily unavailable. Please try again shortly." });
  }

  try {
    const kitRes = await fetch("https://api.convertkit.com/v3/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        email: emailNorm,
        first_name: firstName?.trim() || undefined,
        // "source" is a custom field used to segment this list for the launch
        // announcement email — confirm it appears under the subscriber's
        // custom fields in Kit after a test signup; ConvertKit's v3 API
        // creates unfamiliar custom field keys automatically on first use,
        // but this is worth verifying once rather than assuming.
        fields: { source: "pro_waitlist_pricing" },
      }),
    });

    if (!kitRes.ok) {
      const err = await kitRes.json().catch(() => ({}));
      console.error("Kit waitlist error:", err);
      return res.status(502).json({ error: "SIGNUP_FAILED", message: "Could not join the waitlist right now. Please try again." });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Waitlist handler error:", e.message);
    return res.status(500).json({ error: "SIGNUP_FAILED", message: "Could not join the waitlist right now. Please try again." });
  }
}
