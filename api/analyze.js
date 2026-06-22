// api/analyze.js
// Vercel serverless function — runs on the server, keeps your API key hidden
// Deploy this alongside your React app on Vercel

const SYSTEM_PROMPT = (frameCount, durationLabel) => `
You are an elite tennis coach and biomechanics analyst. You are receiving ${frameCount} frame samples extracted every ~30 seconds from a ${durationLabel} tennis match video.

Your job is to identify PATTERNS across the entire match — not just critique one moment. Look at the sequence as a whole and find recurring technical and tactical habits.

TECHNIQUE SKULL (detailed breakdown per what's visible):
- Body stance and balance at contact
- Racket preparation and takeback timing  
- Contact point (early, late, ideal)
- Follow-through and finish position
- Footwork patterns and court movement
- Grip and wrist position where visible

STRATEGY PATTERNS:
- Court positioning tendencies
- Rally behavior and shot selection
- Pressure response patterns
- Net approach habits or avoidance

Return ONLY this exact JSON (no markdown, no backticks, no extra text):
{
  "match_overview": "2-3 sentences summarizing the full match",
  "player_level": "Beginner | Developing | Intermediate | Advanced Club",
  "frames_analyzed": ${frameCount},
  "technique": {
    "score": 6,
    "headline": "Short label for overall technique style",
    "strengths": ["strength 1", "strength 2"],
    "patterns": [
      {
        "pattern": "Name of the recurring technical habit",
        "frequency": "Seen in roughly X% of relevant frames",
        "what_it_looks_like": "Exactly what you see across the frames",
        "root_cause": "Why this habit forms mechanically",
        "impact": "How this costs them points or causes errors",
        "fix": "Specific one-sentence correction cue",
        "drill": "One drill to ingrain the fix"
      }
    ],
    "shot_breakdown": {
      "groundstrokes": "Technical read of forehand and backhand mechanics",
      "serve": "Serve mechanics if visible, or note frames did not show serve",
      "movement": "Footwork, split step, court coverage assessment"
    }
  },
  "strategy": {
    "score": 6,
    "headline": "Short label for overall tactical style e.g. Passive Baseliner",
    "strengths": ["strength 1", "strength 2"],
    "patterns": [
      {
        "pattern": "Name of the tactical habit",
        "frequency": "How consistently you see it",
        "what_it_looks_like": "What you see in the frame sequence",
        "impact": "How this pattern affects match outcomes",
        "fix": "One specific tactical adjustment"
      }
    ]
  },
  "priority_fixes": [
    { "rank": 1, "fix": "Most important change to make", "why": "Why address this first" },
    { "rank": 2, "fix": "Second priority", "why": "Brief reason" },
    { "rank": 3, "fix": "Third priority", "why": "Brief reason" }
  ],
  "coach_verdict": "One direct honest sentence about where this player is and what will move the needle most"
}`.trim();

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { frames, context, frameCount, durationLabel } = req.body;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({ error: "No frames provided" });
  }

  // Build the message content — text block first, then all image frames
  const content = [
    {
      type: "text",
      text: context
        ? `Player note: "${context}"\n\nAnalyze all ${frames.length} frames (sampled every ~30s across the ${durationLabel} video) for recurring technique and strategy patterns.`
        : `Analyze all ${frames.length} frames (sampled every ~30s across the ${durationLabel} video) for recurring technique and strategy patterns.`,
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
        "x-api-key": process.env.ANTHROPIC_API_KEY, // ← Set this in Vercel dashboard
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
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

    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Try extracting just the JSON object
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("Could not parse AI response:", clean.slice(0, 300));
        return res.status(500).json({ error: "Could not parse AI response. Try again." });
      }
      parsed = JSON.parse(match[0]);
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Unexpected server error" });
  }
}
