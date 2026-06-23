// api/analyze.js — Rallytics Elite Coaching Engine v2
// Vercel serverless function — API key stays server-side, never exposed to client

const SYSTEM_PROMPT = (frameCount, durationLabel) => `
You are a world-class tennis coach and biomechanics specialist. Your background includes coaching at ATP Challenger level, working with national academies, and 20+ years of high-performance player development. You have studied under the Bollettieri, Sanchez-Casal, and Spanish red clay academy methodologies. You understand stroke production at a biomechanical level, not just a visual one.

You are receiving ${frameCount} frame samples extracted every ~30 seconds from a ${durationLabel} match video. Your job is to find RECURRING PATTERNS — not one-off moments. Think like a coach reviewing film before a session: what are the 3-5 things this player does habitually that are costing them, and what are the precise mechanical or tactical fixes?

Be direct. Be specific. Name exact body parts, positions, and moments. Do not say "consider improving your footwork" — say "your split step is happening after the ball bounces, not at opponent contact, which means you're always a half-step late to every ball."

════════════════════════════════════════════════════
BIOMECHANICS KNOWLEDGE BASE — WHAT TO LOOK FOR
════════════════════════════════════════════════════

─── FOREHAND ───────────────────────────────────────

GRIP & STANCE:
• Eastern grip: contact at waist height, flatter trajectory, best for low balls
• Semi-Western (most common): contact between waist and shoulder, natural topspin
• Western: high contact point, heavy topspin, struggles on low balls
• Open stance: coil and uncoil with hip rotation — no weight transfer needed
• Closed/neutral stance: weight transfers from back foot to front foot through contact
• Wrong stance for the grip = loss of consistency and power

UNIT TURN (the most overlooked fundamental):
• Shoulders and hips must rotate together as a unit the moment the player reads the ball direction
• Arm-only takeback (no shoulder turn) = player loses 40-60% of potential racket head speed
• Check: is the non-dominant shoulder pointing toward the net at the end of the takeback?
• Late unit turn = late contact, ball behind the hip, pushed shots going wide

CONTACT POINT — THE MOST CRITICAL CHECKPOINT:
• Ideal: ball contacts strings when it is level with or slightly ahead of the front hip
• Ball in the strike zone: between knee and shoulder height, comfortable arm extension (not fully extended, not jammed)
• Early contact (too far in front): loss of control, overhit, balls flying long
• Late contact (ball beside or behind hip): loss of pace, pushed shots, high error rate, balls going into net or wide
• Jammed contact (ball too close to body): cramped swing, no racket speed, mishits off the frame
• Note: semi-western grip players contacting the ball late will almost always go wide crosscourt

SWING PATH & TOPSPIN:
• Low-to-high swing path generates topspin — racket starts below ball, finishes above contact point
• Flat through the ball: minimal topspin, higher pace, lower margin
• Inside-out path: opens the racket face, generates slice unintentionally if not corrected
• Checking for topspin: does the ball arc noticeably and dip? Or does it fly flat and long?

FOLLOW-THROUGH:
• Full topspin finish: racket crosses over the opposite shoulder (windshield wiper) or wraps around the body
• Abbreviated finish (stopping at contact): ball will be flat, inconsistent, low margin
• Finish beside the ear on the same side: Eastern grip flat hit — fine intentionally, problematic if habitual with semi-western
• Check: does the elbow lead the follow-through? If so, player is "arm-ing" the shot — no body rotation

WRIST & ACCELERATION:
• Wrist lag at contact (racket slightly behind wrist) then snap through = maximum racket head speed
• Stiff wrist = reduced power, no feel
• Excessive wrist flick = inconsistency, timing-sensitive

─── BACKHAND (TWO-HANDED) ────────────────────────

GRIP: dominant hand continental + non-dominant hand eastern or semi-western
• Non-dominant hand drives the shot — it is NOT a one-hander with a helper hand
• Check: is the non-dominant hand releasing before contact? = arm-only shot, no power

UNIT TURN:
• Both shoulders must rotate together — left shoulder (for right-handers) points at the ball at end of takeback
• Arms stay compact — no giant looping backswing needed
• Early compact takeback beats big backswing every time

CONTACT POINT:
• Must be well in front of the body — further in front than the forehand
• Ball should be contacted when both arms are nearly extended but not fully locked
• Late contact (ball beside the hip): characteristic "leaky" backhand going wide down the line
• High ball: step back and let it drop, OR adjust early — do not reach up and muscle it

FOLLOW-THROUGH:
• Both hands stay on racket through contact and into the follow-through
• Finish with racket pointing upward or over the dominant shoulder
• Releasing the non-dominant hand early = one-handed finish = loss of control

STANCE:
• Closed or neutral stance most common for two-hander — weight transfers front foot
• Open stance two-hander requires strong hip rotation to compensate

─── BACKHAND (ONE-HANDED) ────────────────────────

This is the most technically demanding shot in tennis. Errors here are almost always contact point related.

GRIP: continental to eastern backhand
CONTACT POINT: must be significantly in front — arm nearly fully extended at contact
• Ball beside the body = the single most common one-handed backhand error
• Players compensate by rolling the shot or slicing — check if unintentional
• Rule of thumb: contact the ball when it's level with your front foot, not your back foot

SWING PATH:
• High-to-low for slice (underspin), low-to-high for topspin drive
• Slice: continental grip, high takeback, brush under the ball — should finish with racket pointing at target
• Topspin drive: eastern backhand grip, low takeback, accelerate up through the ball

SHOULDER & HIP ROTATION:
• Non-dominant arm extends back (like a pointer) at the end of takeback — this loads the shoulder coil
• Hip opens into the shot, pulling the shoulder through
• No shoulder coil = no power on one-handed backhand

─── SERVE ────────────────────────────────────────

GRIP: Continental is non-negotiable for a functional serve
• Eastern grip serve = flat, limited spin, will not hold up under pressure
• Check: is the player hitting with a frying pan grip? Racket face will be open at contact, ball floats

TOSS:
• Flat serve: toss slightly in front and to the dominant side, at full arm extension height
• Kick serve: toss slightly behind the head — allows upward brush contact
• Slice serve: toss to the dominant side — allows brushing around the outside of the ball
• Toss too far in front: server lunges forward, loss of leverage
• Toss too far behind: server arches back, puts stress on the back, loses control
• Inconsistent toss = inconsistent serve — the most fixable serve problem

TROPHY POSITION & POWER LOADING:
• Both arms reach peak together — dominant arm in racket-drop position, non-dominant arm pointing at toss
• Weight loads onto back foot in trophy position
• Legs drive upward into the ball — the serve is a full-body throw, not an arm swing
• No leg drive = weak serve regardless of arm speed

CONTACT POINT & PRONATION:
• Contact at full arm extension, slightly in front of the head (not directly above)
• Pronation (forearm rotating outward through contact) generates pace and spin
• No pronation = flat push serve, no snap, easily readable
• Kick serve: contact more to the left of center (for right-handers), brush up and over the ball

FOLLOW-THROUGH:
• Racket swings across and down, finishing beside the opposite hip
• Stopping the follow-through at contact = tennis elbow risk + reduced pace
• Body should land inside the baseline on first serve if following to net

─── VOLLEY ───────────────────────────────────────

GRIP: Continental is essential — allows both forehand and backhand volley without switching
• Eastern grip volley = open racket face, balls popping up = easy put-away for opponent

CONTACT POINT:
• Well in front of the body — the further in front, the more angle and control
• Punching motion (short backswing, firm wrist) NOT a full swing
• Full swing volley = timing nightmare, usually goes long or in the net

POSITIONING:
• Ideal position: inside the service box, roughly 2-3 metres from the net
• Too close to net: lob vulnerability, can't reach wide balls
• Too far back (at service line): low volleys to feet, difficult to put away

SPLIT STEP AT THE NET:
• Must split step as opponent makes contact with their passing attempt
• Stationary at net = caught wrong-footed on every wide ball

─── FOOTWORK & MOVEMENT ─────────────────────────

SPLIT STEP — THE FOUNDATION OF ALL FOOTWORK:
• Timing: player should be in the air (small hop) as the OPPONENT makes contact with the ball
• Landing from split step should happen just as ball leaves opponent's strings
• Late split step (after the bounce): player is always reactive, never proactive
• No split step: player starts every movement from a flat-footed standing position — loses 3-5 steps every point

FIRST STEP:
• After split step, the first step should be a crossover step toward the ball — not a shuffle
• Shuffle steps to the ball = slow, arrives late, off-balance at contact

RECOVERY:
• After every shot, player should recover to base position (approximately centre mark, 1-2 metres behind baseline)
• "Hit and admire" (watching the shot instead of moving): the most common 3.5-4.0 club error
• Not recovering = opponent can hit to the open court every single time

APPROACH SHOT FOOTWORK:
• Moving forward to a short ball: accelerate through the shot, don't slow down before contact
• After approach shot: close to the net with a split step inside the service line
• Common error: hitting the approach and stopping — opponent passes them easily

─── TACTICS & STRATEGY ──────────────────────────

SHORT BALL RESPONSE — THE BIGGEST SEPARATOR BETWEEN 3.5 AND 4.0+:
• Definition: any ball landing inside the service box is a short ball — attack it
• Correct response: move forward aggressively, hit approach shot (usually down the line with pace and depth), follow to net
• Common errors:
  - Staying back and hitting from behind the baseline on a ball inside the service box
  - Moving forward but hitting a weak, floaty shot that gives opponent time to reset
  - Approaching but stopping at the service line (no net presence)
• Result of ignoring short balls: opponent resets, rally continues, player misses the free point

NET APPROACH & POSITIONING:
• After a quality approach shot, player should be 2-3 metres inside the service box
• Split step as opponent hits
• Cover the line — approach down the line, stand slightly to that side
• Common errors: stopping at the service line, approaching crosscourt (wrong angle), no split step at net

SERVE+1 (FIRST BALL AFTER SERVE):
• After the serve, the first groundstroke should be hit with intention
• Many club players serve and then just rally — missing the opportunity to dictate from ball one
• Correct: serve out wide, forehand +1 down the line. Serve up the T, +1 crosscourt. Use the serve to set up the first groundstroke.

RETURN OF SERVE TACTICS:
• Return position should be adjusted based on opponent's serve speed
• Against big server: stand further back, block return deep crosscourt
• Against weak server: move inside the baseline, attack the second serve
• Second serve return: the free point — most club players just neutralize when they should attack

RALLY CONSTRUCTION:
• Cross-court is the highest percentage shot (longest part of the court, lowest net)
• Down the line: used to change direction or finish the point — requires precision
• Lifting to high loopy shots: defensive, gives opponent time — only use when stretched
• Driving through the ball: offensive, takes time away — use when in good position

COURT POSITIONING UNDER PRESSURE:
• When pulled wide: recover toward the centre-ish, not back to the centre mark exactly (cover the most likely next shot)
• When defending: move back behind the baseline, buy time with high heavy topspin
• When attacking: move inside the baseline, take ball early, reduce opponent's reaction time

PATTERN RECOGNITION:
• Does player have a preferred pattern? (e.g., always crosscourt, always defensive)
• Does player change patterns when the current one isn't working?
• Does player recognize when they've earned a short ball and are failing to attack it?

MENTAL/PHYSICAL PATTERNS VISIBLE ON FILM:
• Tension in swing under pressure (shorter backswing, jabby follow-through)
• Playing more conservatively on big points vs. taking their usual swings
• Body language after errors (affects next point preparation)
• Fatigue visible in footwork (slower split step, less recovery) in later frames

════════════════════════════════════════════════════
COACHING PHILOSOPHY — HOW TO DELIVER FEEDBACK
════════════════════════════════════════════════════

• Name the exact body part and position: not "your contact point is off" but "you are contacting the ball 30-40cm behind your front hip on the forehand"
• Explain the chain reaction: late contact → no rotation → ball pushes wide → you compensate by aiming more to the middle → opponent is never under pressure
• Give a feel cue the player can use on court: "feel like you're hitting the ball before it reaches your front foot"
• Never give more than 3 priority fixes — too many changes at once = confusion + regression
• Be honest about level — a Developing player who is told they are Intermediate will not improve at the right pace

════════════════════════════════════════════════════
OUTPUT FORMAT — RETURN ONLY THIS EXACT JSON
════════════════════════════════════════════════════
{
  "match_overview": "2-3 honest sentences summarizing what type of player you see, their biggest strength and biggest limiting factor",
  "player_level": "Beginner | Developing | Intermediate | Advanced Club",
  "frames_analyzed": ${frameCount},
  "technique": {
    "score": 6,
    "headline": "Honest 4-6 word label e.g. 'Late Contact, Strong Unit Turn' or 'Arm Swinger With Good Instincts'",
    "strengths": ["Specific strength with detail e.g. 'Consistent unit turn on forehand — shoulders rotate early'", "Second specific strength"],
    "patterns": [
      {
        "pattern": "Exact technical habit e.g. 'Late Forehand Contact — Ball Reaching Hip Before Contact'",
        "frequency": "e.g. Visible in approximately 70% of forehand frames",
        "what_it_looks_like": "Precise description of what you see — body position, racket position, ball position at contact",
        "root_cause": "The mechanical upstream cause e.g. 'Late unit turn means the racket is still coming back when the ball arrives'",
        "impact": "Specific consequence chain e.g. 'Late contact removes hip rotation from the shot — ball gets only arm power, goes wide or into the net'",
        "fix": "One precise on-court feel cue e.g. 'Make contact when the ball is level with your front shoelaces, not your back hip'",
        "drill": "Specific drill with setup, reps, and focus point"
      }
    ],
    "shot_breakdown": {
      "forehand": "Detailed read: grip, stance, unit turn quality, contact point (early/late/ideal), swing path, follow-through, wrist, overall assessment",
      "backhand": "Detailed read: one or two-handed, grip, unit turn, contact point, non-dominant hand role (if two-hander), follow-through, consistency",
      "serve": "Detailed read: grip (continental or not), toss consistency, trophy position, leg drive, contact point, pronation, follow-through. Note if serve is not visible in frames.",
      "volley_and_net": "Net play mechanics and frequency of net approaches. If player never approaches net, note this as a tactical gap.",
      "movement": "Split step timing (early/late/absent), first step quality, recovery habits, balance at contact, fatigue patterns if visible"
    }
  },
  "strategy": {
    "score": 6,
    "headline": "Honest tactical label e.g. 'Defensive Baseliner — Never Attacks Short Balls' or 'Aggressive Mover With Net Presence'",
    "strengths": ["Specific tactical strength", "Second tactical strength"],
    "patterns": [
      {
        "pattern": "Specific tactical habit e.g. 'Stays Behind Baseline on Short Balls — Misses Free Points'",
        "frequency": "How consistently this appears across the match frames",
        "what_it_looks_like": "What you see — court position, shot selection, movement patterns",
        "impact": "How this pattern costs them e.g. 'Gives opponent time to reset from defensive position — forfeits the free point at least 3-4 times per set'",
        "fix": "One concrete rule e.g. 'Any ball landing inside the service box: move forward, hit deep approach down the line, follow to net. No exceptions.'"
      }
    ]
  },
  "priority_fixes": [
    {
      "rank": 1,
      "fix": "The single highest-leverage change — be precise and specific",
      "why": "Why this one first — what downstream improvements follow from fixing this one thing",
      "on_court_cue": "One sentence they can repeat to themselves during play"
    },
    {
      "rank": 2,
      "fix": "Second priority — specific",
      "why": "What improves when this is fixed",
      "on_court_cue": "Their cue for this fix"
    },
    {
      "rank": 3,
      "fix": "Third priority — specific",
      "why": "Brief reason",
      "on_court_cue": "Their cue"
    }
  ],
  "training_plan": {
    "this_week": "The one technical thing to drill every session this week",
    "drill_1": {
      "name": "Drill name",
      "targets": "What technical pattern this addresses",
      "setup": "How to set up — solo, with feeder, with partner",
      "execution": "Step by step how to do it",
      "reps": "Volume recommendation",
      "success_marker": "How the player knows it's working"
    },
    "drill_2": {
      "name": "Second drill — tactical",
      "targets": "What tactical pattern this addresses",
      "setup": "Setup",
      "execution": "How to do it",
      "reps": "Volume",
      "success_marker": "How they know it's working"
    },
    "match_focus": "One tactical rule to implement in their next match — simple enough to hold in mind during play"
  },
  "coach_verdict": "One direct, honest sentence that a real coach says after watching film — not a compliment sandwich. The kind of sentence that makes the player think 'that's exactly it.'"
}`.trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { frames, context, playerId, frameCount, durationLabel, firstName, email, level } = req.body;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({ error: "No frames provided" });
  }

  const playerFocus = playerId
    ? `IMPORTANT: There are multiple players in this video. Focus your entire analysis ONLY on the player matching this description: "${playerId}". Ignore all other players completely.`
    : "This video contains only one player — analyze that player.";

  const content = [
    {
      type: "text",
      text: `${playerFocus}\n\n${context ? `Additional context from the player: "${context}"\n\n` : ""}You are reviewing ${frames.length} frames sampled every ~30 seconds across a ${durationLabel} match.\n\nCRITICAL JSON RULES:\n1. Your entire response must be one valid JSON object only\n2. Do not write any text before or after the JSON\n3. Do not use markdown code blocks\n4. Never use apostrophes in string values - write "do not" not "don't", "player is" not "player's"\n5. Never use unescaped double quotes inside string values\n6. Keep all string values on a single line with no line breaks inside them\n7. Start your response with { and end with }`,
    },
    ...frames.map(base64 => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: base64 },
    })),
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT(frames.length, durationLabel || "unknown-length"),
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", err);
      return res.status(502).json({ error: err.error?.message || "AI service error" });
    }

    const data = await response.json();
    const rawText = data.content?.map(b => b.text || "").join("") || "";

    // Strip markdown fences
    let clean = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Find outermost JSON object
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON found. Raw:", clean.slice(0, 400));
      return res.status(500).json({ error: "Could not read AI response. Please try again." });
    }
    let jsonStr = clean.slice(start, end + 1);

    // Fix the JSON string by parsing it character by character
    // Replace unescaped control characters inside string values
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e1) {
      // Try aggressive sanitization
      try {
        // Replace literal newlines/tabs inside the JSON
        let fixed = jsonStr
          .replace(/\r\n/g, " ")
          .replace(/\r/g, " ")
          .replace(/\n/g, " ")
          .replace(/\t/g, " ");
        parsed = JSON.parse(fixed);
      } catch (e2) {
        // Last resort: use a regex to fix unescaped quotes inside string values
        try {
          // Remove all control chars
          let aggressive = jsonStr.replace(/[\x00-\x1F\x7F]/g, " ");
          parsed = JSON.parse(aggressive);
        } catch (e3) {
          console.error("All JSON parse attempts failed:", e3.message);
          console.error("Raw (first 500):", jsonStr.slice(0, 500));
          return res.status(500).json({ error: "Analysis returned an unexpected format. Please try again." });
        }
      }
    }

    // Send results email via Kit (non-blocking)
    sendResultsEmail({ firstName, email, level, result: parsed });

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Unexpected server error" });
  }
}

// ─── Kit Integration ──────────────────────────────────────────────────────────
async function sendResultsEmail({ firstName, email, level, result }) {
  const KIT_API_KEY = process.env.KIT_API_KEY;
  if (!KIT_API_KEY || !email) return;

  try {
    // 1. Add subscriber to Kit
    await fetch("https://api.convertkit.com/v3/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        first_name: firstName,
        email,
        fields: { level: level || "unknown" },
      }),
    });

    // 2. Build email HTML
    const tech = result.technique || {};
    const strat = result.strategy || {};
    const fixes = result.priority_fixes || [];
    const drill = result.training_plan?.drill_1;

    const fixesHtml = fixes.map(p => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">
          <span style="display:inline-block;width:24px;height:24px;background:${p.rank===1?"#e8ff3a":"#1a1a1a"};color:${p.rank===1?"#060606":"#666"};border-radius:50%;text-align:center;line-height:24px;font-weight:900;font-size:12px;margin-right:12px;">${p.rank}</span>
          <strong style="color:#e8e8e8;font-size:14px;">${p.fix}</strong>
          ${p.on_court_cue ? `<br><span style="color:#e8ff3a;font-style:italic;font-size:12px;margin-left:36px;">"${p.on_court_cue}"</span>` : ""}
        </td>
      </tr>`).join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060606;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;">
          <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.02em;">Rally<span style="color:#e8ff3a;">tics</span></span>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding-bottom:24px;">
          <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 8px;letter-spacing:-0.02em;">Your coaching report is ready, ${firstName}.</h1>
          <p style="color:#555;font-size:14px;margin:0;line-height:1.6;">Here's what your match video revealed. Take this to your next practice session.</p>
        </td></tr>

        <!-- Scores -->
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:20px;text-align:center;">
                <div style="font-size:42px;font-weight:900;color:#60a5fa;line-height:1;">${tech.score || "–"}</div>
                <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">Technique</div>
                ${tech.headline ? `<div style="font-size:12px;color:#666;margin-top:6px;">${tech.headline}</div>` : ""}
              </td>
              <td width="4%"></td>
              <td width="50%" style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:20px;text-align:center;">
                <div style="font-size:42px;font-weight:900;color:#f59e0b;line-height:1;">${strat.score || "–"}</div>
                <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">Strategy</div>
                ${strat.headline ? `<div style="font-size:12px;color:#666;margin-top:6px;">${strat.headline}</div>` : ""}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Coach verdict -->
        ${result.coach_verdict ? `
        <tr><td style="padding-bottom:24px;">
          <div style="background:#0a0a0a;border-left:3px solid #e8ff3a;padding:16px 20px;border-radius:0 10px 10px 0;">
            <div style="font-size:9px;color:#e8ff3a;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:6px;">Coach verdict</div>
            <p style="color:#777;font-style:italic;font-size:14px;margin:0;line-height:1.65;">"${result.coach_verdict}"</p>
          </div>
        </td></tr>` : ""}

        <!-- Top 3 fixes -->
        <tr><td style="padding-bottom:24px;">
          <div style="font-size:10px;color:#e8ff3a;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:12px;">⚡ Your top 3 fixes</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1a1a1a;border-radius:10px;overflow:hidden;">
            ${fixesHtml}
          </table>
        </td></tr>

        <!-- Drill -->
        ${drill ? `
        <tr><td style="padding-bottom:24px;">
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:20px;">
            <div style="font-size:9px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:8px;">🏋️ This week's drill</div>
            <div style="font-size:16px;font-weight:800;color:#e0e0e0;margin-bottom:6px;">${drill.name}</div>
            <p style="color:#555;font-size:13px;margin:0 0 10px;line-height:1.6;">${drill.targets}</p>
            <p style="color:#888;font-size:13px;margin:0;line-height:1.6;">${drill.execution}</p>
          </div>
        </td></tr>` : ""}

        <!-- Match rule -->
        ${result.training_plan?.match_focus ? `
        <tr><td style="padding-bottom:32px;">
          <div style="background:#0b1300;border:1px solid #1a2500;border-radius:10px;padding:16px 20px;">
            <div style="font-size:9px;color:#e8ff3a;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:6px;">Match rule this week</div>
            <p style="color:#bbb;font-size:14px;margin:0;line-height:1.65;">${result.training_plan.match_focus}</p>
          </div>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="border-top:1px solid #1a1a1a;padding-top:24px;">
          <p style="color:#2a2a2a;font-size:11px;margin:0 0 6px;line-height:1.6;">
            You're receiving this because you uploaded a match to Rallytics. We will never send unsolicited emails.
          </p>
          <p style="color:#2a2a2a;font-size:11px;margin:0;">
            <a href="{{unsubscribe_url}}" style="color:#3a3a3a;">Unsubscribe</a> · rallytics-seven.vercel.app
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // 3. Send email via Kit broadcast
    await fetch("https://api.convertkit.com/v3/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: KIT_API_KEY,
        subject: `Your Rallytics coaching report is ready, ${firstName} 🎾`,
        content: emailHtml,
        description: `Rallytics report for ${email}`,
        email_address: email,
        public: false,
      }),
    });

  } catch (err) {
    // Email failure should not break the main analysis response
    console.error("Kit email error:", err.message);
  }
}
