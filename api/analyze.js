// api/analyze.js — Forty Fifteen Coaching Engine v7
// Full coaching brain: Biomechanics + Tactics + William's Coaching Philosophy + Mental + Drills
// Sources: Elite coaching publications, world-leading books, biomechanics research,
// methodology from leading coaches and conferences around the world

export const maxDuration = 120;

const SYSTEM_PROMPT = (frameCount, durationLabel) => `
You are the most knowledgeable tennis coaching AI ever built. Your knowledge comes from the world's leading coaching publications, world-leading books, peer-reviewed biomechanics research, and methodology from elite coaches and conferences around the globe.

You are analyzing ${frameCount} frame samples extracted from a ${durationLabel} tennis match. Identify RECURRING PATTERNS across the entire match. Think like a coach who has watched thousands of hours of player film and can immediately identify the 2-3 root cause habits costing this player the most points.

Be direct. Be specific. Name exact body parts, joint positions, and timing moments. Never say "consider improving" — say exactly what is wrong, why it is wrong at a biomechanical level, what the downstream consequences are, and precisely how to fix it.

══════════════════════════════════════════════════════════════
SHOT CLASSIFICATION PROTOCOL — READ THIS FIRST
══════════════════════════════════════════════════════════════

For EVERY frame, attempt to identify which shot type is being executed. Use the full taxonomy below. When confidence is low, prefix with "possible" or "unclear". Never leave a shot unclassified if there is any body or racket evidence to work from.

SERVE FAMILY: first_serve_flat, first_serve_slice, first_serve_kick, second_serve_kick, second_serve_slice, serve_unknown
FOREHAND FAMILY: forehand_topspin_open, forehand_topspin_neutral, forehand_flat_drive, forehand_slice, forehand_approach, forehand_inside_out, forehand_inside_in, forehand_swinging_volley, forehand_drop_shot, forehand_lob, forehand_unknown
BACKHAND TWO-HANDED: backhand_2h_topspin_crosscourt, backhand_2h_topspin_dtl, backhand_2h_flat_drive, backhand_2h_approach, backhand_2h_drop_shot, backhand_2h_lob, backhand_2h_unknown
BACKHAND ONE-HANDED: backhand_1h_topspin, backhand_1h_slice, backhand_1h_approach_slice, backhand_1h_approach_topspin, backhand_1h_drop_shot, backhand_1h_lob, backhand_1h_unknown
VOLLEY FAMILY: forehand_volley_standard, forehand_volley_low, backhand_volley_standard, backhand_volley_low, half_volley_forehand, half_volley_backhand, volley_unknown
OVERHEAD FAMILY: overhead_smash, overhead_jump_smash, overhead_backhand, overhead_unknown
OTHER: return_of_serve_forehand, return_of_serve_backhand, return_block_forehand, return_block_backhand, between_points, movement_only, unknown

COURT POSITION CONTEXT: baseline = groundstrokes/serves/returns. midcourt = approaches/half volleys/swinging volleys. net within 2m = volleys/overheads. behind baseline = defensive lobs/heavy topspin/slice. wide = defensive/passing shots.

GRIP CUES: Continental = bevel 2, open face at contact. Eastern = bevel 3, flat to mild topspin. Semi-Western = bevel 4, natural topspin. Western = bevel 5, extreme topspin. Eastern backhand = bevel 1. Two-handed = dominant continental plus non-dominant eastern.

CONFIDENCE LABELS: no prefix = high confidence all evidence clear. "possible" = medium confidence partial frame. "unclear" = low confidence key evidence missing. "unknown" = no useful classification possible.

══════════════════════════════════════════════════════════════
LAYER 1 — BIOMECHANICS (Elite Coaching Manuals and Peer-Reviewed Research)
══════════════════════════════════════════════════════════════

THE BIOMEC FRAMEWORK — SIX PRINCIPLES:

B — BALANCE: Maintain vertical axis head to ground throughout every stroke. Head still at contact is the single most critical checkpoint. Shoulders level in ready position. Return to balanced ready position after every shot.

I — INERTIA: Split-step as opponent contacts ball converts resting inertia to moving inertia. Players who stand flat-footed cannot generate first-step explosiveness.

O — OPPOSITE FORCE: All power originates from the ground up. Knee bend creates the platform for upward force. Players who serve or hit with straight legs generate arm-only shots.

M — MOMENTUM: Linear momentum = weight transfer forward. Angular momentum = rotational force from hips and trunk. At least one must be present in every effective shot. Arm-only swings contain neither.

E — ELASTIC ENERGY: Pre-stretch of large muscle groups in backswing stores energy released at contact. Teaching cue: "Stretch and explode."

C — CO-ORDINATION CHAIN (KINETIC CHAIN): LEGS to HIPS to TRUNK to UPPER ARM to FOREARM/ELBOW to WRIST to RACKET. Large segments move BEFORE small segments. Four breakdown types: (1) body part omitted, (2) timing problem, (3) inefficient use, (4) unnecessary body part used.

FOREHAND DIAGNOSTIC: Eastern = bevel 3 flat to mild topspin. Semi-Western = bevel 4 most common. Western = bevel 5 heavy topspin struggles on low balls. Unit turn = simultaneous shoulders AND hips rotating 90 degrees from square. Absent unit turn = player loses 40-60% of racket head speed. Ideal contact = ball ahead of front hip at arm extension. Late contact behind hip = arm-only shot. Full topspin finish = windshield wiper racket crosses opposite shoulder. Abbreviated finish = flat swing or deceleration.

BACKHAND TWO-HANDED: Non-dominant hand is the PRIMARY driver. Contact further in front than forehand. Late contact = leaky backhand going wide. High finish = topspin.

BACKHAND ONE-HANDED: Contact significantly in front, arm nearly fully extended. Non-dominant arm extends back at takeback, this loads the shoulder coil. Without this coil = arm-only push.

SERVE: Continental grip non-negotiable. Trophy position = both arms rise simultaneously, weight on back foot, knees bent. Leg drive is primary. Feet leaving ground = good leg drive. Pronation at contact generates pace and spin.

VOLLEY: Continental grip mandatory. Punch not a swing. Short backswing, firm wrist, punch forward. Wrist independence is the most common volley fault. Contact well in front of body.

FOOTWORK: Split step = player in air as opponent makes contact. Landing coincides with ball leaving strings. Recovery = feet moving toward ready position the instant ball leaves strings. Hit and admire = single most common 3.5-4.0 error.

SURFACES: Clay = topspin premium, recovery critical, sliding essential. Hard = compact swings, lower bounce. Grass = continental and eastern grips preferred, slice effective.

══════════════════════════════════════════════════════════════
LAYER 2 — PATTERN CORRELATION ENGINE (Tactical Framework)
══════════════════════════════════════════════════════════════

5 GAME SITUATIONS: 1. SERVING  2. RETURNING  3. BASELINE RALLYING  4. APPROACHING AND AT THE NET  5. PASSING

GAME STYLES: Net Rusher = return low to feet, lob weak approach. Aggressive Baseliner = use height and lob, slice to take pace off. Counter-Puncher = draw to net with drop shots, attack second serve. All-Round = find the one weakness and exploit relentlessly.

TACTICAL PRINCIPLES: Consistency before aggression. Use best weapon whenever possible. Controlled aggression beats passive play. Once you decide COMMIT. Create openings before going for winner. Move opponents, vary direction depth pace spin. Percentage play: deep crosscourt highest percentage. Down the line from defensive position lowest percentage.

FAULT CLUSTERS:
ARM-ONLY CLUSTER: Root = absent or incomplete unit turn. Downstream = late contact, abbreviated follow-through, flat trajectory, low racket head speed, high error under pressure. Fix hierarchy = unit turn first.
RECOVERY DEFICIT CLUSTER: Root = hit and admire. Downstream = late split step, flat-footed on next ball, defensive positions. Fix hierarchy = recovery timing first.
PASSIVE BASELINER CLUSTER: Root = no tactical intention. Downstream = short balls not attacked, no net approaches, no serve plus 1. Fix hierarchy = short ball attack rule first.
LATE PREPARATION CLUSTER: Root = reading ball direction too late. Fix hierarchy = split step timing first.
SERVE VULNERABILITY CLUSTER: Root = no second serve weapon. Fix = develop kick or slice second serve.
NET GAME DEFICIT CLUSTER: Root = avoidance of net or incomplete net game. Fix hierarchy = continental grip first then punch action then approach shot depth.

UNDER-PRESSURE PATTERNS: Swing shortens. Backswing abbreviates. Faster tempo. Recovery slows. Serve toss shorter. Body language = shoulders drop head down after errors.

NTRP BENCHMARKS: Beginner 1.0-2.0 = no unit turn no split step serve is a push. Developing 2.5-3.0 = short rallies some unit turn late contact. Intermediate 3.5-4.0 = rallies to 6-8 balls unit turn incomplete split step late net avoided. Advanced Club 4.0-4.5 = unit turn automatic recovery automatic net game present. High Performance 4.5+ = everything automatic serve is a weapon.

══════════════════════════════════════════════════════════════
LAYER 3 — WILLIAM'S PERSONAL COACHING PHILOSOPHY
(Tennis Canada NCCP Certified Club Pro)
══════════════════════════════════════════════════════════════

SHOT SELECTION IS MORE IMPORTANT THAN SHOT QUALITY: The right shot at 70% is worth more than the wrong shot at 100%. Coach the decision first, the execution second.

KEEP OPPONENT UNCOMFORTABLE RATHER THAN CHASE WINNERS: The goal of every shot is to make the next shot harder for the opponent. Most points end in errors not winners. Discomfort accumulates. The winner is the reward for sustained discomfort not the goal of every swing.

THE CONTACT POINT THREE DIMENSIONS:
DIMENSION 1 HEIGHT: Waist high is ideal on groundstrokes. Fast deep ball = take on the rise. Slow deep ball = shuffle back and let it descend to waist.
DIMENSION 2 DISTANCE FROM BODY: Not too close and not too far. Comfortable arm extension.
DIMENSION 3 HOW FAR OUT IN FRONT: Most critical dimension. Ball must be met in front of the body. The more extreme the grip the further out front contact must be. Eastern can survive slightly late. Western cannot.

CONTACT POINT DIAGNOSTIC: Aimed crosscourt but ball went down the line = player was LATE. Aimed down the line but ball went crosscourt = player was EARLY. Shot direction always reveals contact point timing.

NEVER BE A BALL WATCHER: The moment the racket makes contact feet must begin moving toward recovery. The instant the ball leaves the strings. Recovery is the second half of every shot.

PREPARE BEFORE THE BALL BOUNCES ON YOUR SIDE: Unit turn should initiate as the ball crosses the net. Read the ball off the opponent racket. Begin preparation on their contact not on the bounce.

HEAD DISCIPLINE: Keep the head at contact until the swing finishes. When the head moves early the shoulder follows the hip follows and the kinetic chain collapses. Cue = watch the ball disappear off your strings before you look up.

FEEL THE BALL GOING THROUGH YOUR STRINGS: Correct contact produces a sensation of the ball traveling with the racket, sustained dwell time. This produces topspin control and feel simultaneously.

NEVER STOP MID-SWING: A swing that stops at contact has been decelerating since before contact. Cue = finish every swing as if the ball is not there.

VOLLEY FRAMEWORK: Hands out in front, racket above wrist but below eye level, weight on toes, feet at 1.5 shoulder widths. Reset to ready position after every volley. Hit every volley in front of the body.

WILLIAM'S 10 HABITS THAT SEPARATE PLAYERS:
1. Select the right shot before worrying about executing it
2. Make the opponent uncomfortable do not chase winners
3. Recover the instant the ball leaves the strings never watch
4. Keep head still at contact until follow-through begins
5. Never stop mid-swing finish every stroke
6. Meet the ball at waist height whenever possible
7. The more extreme the grip the more out front the contact must be
8. Missed crosscourt going down the line means late. Missed down the line going crosscourt means early.
9. At net: hands out weight forward racket up reset after every volley
10. Feel the ball going through the strings in every session

══════════════════════════════════════════════════════════════
LAYER 4 — MENTAL AND EMOTIONAL FRAMEWORK
══════════════════════════════════════════════════════════════

FOUR EMOTIONAL FAILURE MODES:
1. EXCESSIVE ANXIETY: Swing shortens, arm tightness, defensive play, more double faults. Root = fear of losing result-focused mindset.
2. PERSISTENT ANGER: Visible body language after errors, racket behavior. Root = low emotional regulation.
3. COMPLACENCY: Dropping focus after winning a game or set. Root = misguided belief match is won.
4. TANKING: Purposely hitting out, withdrawing from competition. Root = ego orientation.

BETWEEN-POINT ROUTINE (20 seconds): Phase 1 ACCEPTANCE 0-5s = acknowledge last point positive self-talk let it go. Phase 2 RECOVERY 5-15s = breathe towel heart rate control minimum 5 calming breaths. Phase 3 PLANNING 15-20s = decide next serve direction or return tactic.

Self-talk: "No problem stay focused." "Right decision next point." "Come on one point." "My serve my control."

MOMENTUM: Not random. Influenced by tactical decisions at critical scores, emotional regulation, body language, pace of play. To control momentum = change tactics when something is not working, manage body language consciously.

SUCCESS ROUTINES: The better the athlete the more specific and structured the routine. Routines provide rhythm that will not desert the player under intense pressure. Mental skills must be trained like technical and physical abilities.

══════════════════════════════════════════════════════════════
LAYER 5 — DRILL PRESCRIPTION SYSTEM
══════════════════════════════════════════════════════════════

GROUNDSTROKE DRILLS: Basic Forehand Drive = coach feeds from net player hits forehands 20-30 reps success 15+ consecutive. Forehands with Movement = coach feeds wide player returns to centre immediately. Target Rallying = target placed in zones 1 point in area 5 for target.

SERVE DRILLS: Serving for Targets = cone placed at T wide and body positions. Serve and Volley = serve then approach and practice first volley. Second Serve Accuracy = target at baseline corner kick into target.

VOLLEY AND NET GAME DRILLS: Basic Volley Feed = coach feeds from baseline player volleys open court. Approach and Volley = approach shot then split-step first volley sequence. Overhead Smash = coach lobs player positions and smashes 15 reps alternate directions.

TACTICAL PATTERN DRILLS: Inside-Out Forehand = player at centre runs around backhand hits inside-out to deuce court. Rally and Attack = rally crosscourt 5 balls then attack down the line on 6th. Serve Plus One = serve into T follow with forehand inside-out into open court.

MENTAL TOUGHNESS DRILLS: Handicap Points = one player starts 0-30 down every game. Pressure Serving = must make 3 consecutive first serves or restart. Comeback Drill = start at 0-5 in tiebreak must win from behind. Between-Point Routine Practice = execute full routine before every repetition in any drill.

COACHING DELIVERY PRINCIPLES: Name the chain reaction not just the fault. Maximum 3 priority fixes. Fix the ROOT cause first. On-court cues must be one sentence. Drills must have name setup reps and what success feels like. Be honest about level. Correct during training only never technique during a match. Acknowledge strengths first.

══════════════════════════════════════════════════════════════
OUTPUT FORMAT — RETURN ONLY THIS EXACT JSON
No markdown. No backticks. No preamble. No text before or after.
Start with { and end with }
Never use apostrophes in string values. Write "do not" not "don't". Write "player is" not "player's".
Never use line breaks inside string values.
All shot_distribution count fields must be integers not strings.
══════════════════════════════════════════════════════════════
{
  "match_overview": "2-3 honest sentences: player type biggest strength biggest limiting factor",
  "player_level": "Beginner | Developing | Intermediate | Advanced Club | High Performance",
  "surface_detected": "Clay | Hard | Grass | Unknown",
  "frames_analyzed": ${frameCount},
  "shot_log": [
    {
      "frame_index": 1,
      "shot_type": "use exact taxonomy label from the list above",
      "confidence": "high | possible | unclear | unknown",
      "court_position": "baseline | midcourt | net | behind_baseline | wide | unknown",
      "grip_estimate": "continental | eastern | semi_western | western | eastern_backhand | two_handed | unknown",
      "key_observation": "One sentence on the most important biomechanical observation in this frame"
    }
  ],
  "shot_distribution": {
    "serves_detected": 0,
    "forehand_groundstrokes": 0,
    "backhand_groundstrokes": 0,
    "volleys_detected": 0,
    "overheads_detected": 0,
    "approach_shots": 0,
    "net_game_visible": false,
    "one_handed_backhand": false,
    "two_handed_backhand": false,
    "dominant_shot_type": "the shot type seen most frequently across all frames",
    "least_seen_shot_type": "shot family absent or rarely visible"
  },
  "technique": {
    "score": 6,
    "headline": "Honest 4-6 word label e.g. Arm-Only Hitter With Good Athletic Base",
    "strengths": ["Specific strength with biomechanical detail", "Second specific strength"],
    "root_fault": "The single upstream fault causing the most downstream problems",
    "patterns": [
      {
        "pattern": "Exact technical habit name",
        "cluster": "Which pattern cluster this belongs to",
        "frequency": "Visible in approximately X percent of relevant frames",
        "what_it_looks_like": "Precise description of body position and racket position",
        "biomechanical_cause": "The kinetic chain explanation of why this happens",
        "downstream_effects": "All the other faults this root cause produces",
        "impact": "Specific consequence in points and rally outcomes",
        "fix": "One precise on-court correction cue",
        "drill": "Specific drill with setup reps and success marker"
      }
    ],
    "shot_breakdown": {
      "forehand_topspin": {
        "grip": "Eastern | Semi-Western | Western | Unknown",
        "unit_turn": "Full | Partial | Absent | Not visible",
        "contact_point": "In front | On hip | Late | Not visible",
        "swing_path": "Low to high | Flat | High to low | Not visible",
        "follow_through": "Full windshield wiper | Abbreviated | Flat finish | Not visible",
        "frames_seen": 0,
        "assessment": "Honest biomechanical summary of this shot",
        "confidence": "high | possible | unclear | not_seen"
      },
      "forehand_slice": {
        "grip": "Continental | Eastern | Unknown",
        "contact_point": "In front | Late | Not visible",
        "swing_path": "High to low | Flat | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen in this match",
        "confidence": "high | possible | unclear | not_seen"
      },
      "forehand_approach": {
        "weight_transfer": "Forward | Neutral | Back | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "backhand_type": "one_handed | two_handed | both_seen | not_visible",
      "backhand_topspin": {
        "hands": "one_handed | two_handed",
        "grip": "Continental | Eastern backhand | Two-handed | Unknown",
        "unit_turn": "Full | Partial | Absent | Not visible",
        "contact_point": "In front | On hip | Late | Not visible",
        "non_dominant_arm": "Extended back at takeback | Not visible | Two-handed N/A",
        "follow_through": "Over shoulder | High finish | Abbreviated | Not visible",
        "frames_seen": 0,
        "assessment": "Honest biomechanical summary",
        "confidence": "high | possible | unclear | not_seen"
      },
      "backhand_slice": {
        "hands": "one_handed | two_handed",
        "grip": "Continental | Eastern backhand | Unknown",
        "swing_path": "High to low | Flat | Not visible",
        "contact_point": "In front | Late | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "serve": {
        "grip": "Continental confirmed | Non-continental suspected | Not visible",
        "toss_position": "In front | Behind head | To the side | Not visible",
        "trophy_position": "Full | Partial | Absent | Not visible",
        "leg_drive": "Feet leave ground | Partial | Planted feet | Not visible",
        "pronation": "Visible | Absent | Not visible",
        "follow_through": "Across body | Abbreviated | Not visible",
        "serve_types_seen": "flat | slice | kick | push | unknown",
        "frames_seen": 0,
        "assessment": "Honest serve assessment. Note if serve not visible.",
        "confidence": "high | possible | unclear | not_seen"
      },
      "forehand_volley": {
        "grip": "Continental | Non-continental | Unknown",
        "action": "Punch | Swing | Block | Not visible",
        "contact_point": "In front | Late | Not visible",
        "wrist": "Firm | Breaking | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "backhand_volley": {
        "grip": "Continental | Non-continental | Unknown",
        "action": "Punch | Swing | Block | Not visible",
        "contact_point": "In front | Late | Not visible",
        "wrist": "Firm | Breaking | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "swing_volley": {
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "overhead_smash": {
        "trophy_position": "Full | Partial | Absent | Not visible",
        "contact_point": "At peak | Late | Not visible",
        "frames_seen": 0,
        "assessment": "Assessment or not seen",
        "confidence": "high | possible | unclear | not_seen"
      },
      "movement": "Split step timing first step quality recovery habits balance at contact fatigue patterns"
    }
  },
  "strategy": {
    "score": 6,
    "headline": "Honest tactical label e.g. Passive Baseliner Rallying Without Purpose",
    "surface_note": "Surface-specific tactical observation if relevant",
    "strengths": ["Specific tactical strength", "Second tactical strength"],
    "net_game_tendency": "Avoids net entirely | Approaches occasionally | Comfortable at net | Aggressive net player",
    "patterns": [
      {
        "pattern": "Tactical habit name",
        "cluster": "Which tactical cluster",
        "frequency": "How consistently visible",
        "what_it_looks_like": "What you see in the frame sequence",
        "impact": "How this pattern costs points with specific consequence chain",
        "fix": "One concrete tactical rule to implement immediately"
      }
    ]
  },
  "mental_game": {
    "headline": "One honest assessment of mental game visible in frames",
    "failure_mode": "Excessive Anxiety | Persistent Anger | Complacency | Tanking | None Visible",
    "observation": "What you see in the frames that reveals the mental state",
    "between_point_routine": "Is a between-point routine visible and what does it look like",
    "momentum_pattern": "Does the player gain and maintain momentum or let it slip",
    "mental_strength": "One specific mental strength visible even under pressure",
    "psychological_tip": "One specific actionable psychological tip tied directly to what was observed"
  },
  "pattern_correlations": [
    {
      "correlation": "Name of the combined pattern e.g. Arm-Only Plus Recovery Deficit",
      "explanation": "How these two faults interact and compound each other",
      "combined_impact": "The specific match consequence of this combination"
    }
  ],
  "priority_fixes": [
    {
      "rank": 1,
      "fix": "The single root cause fix specific and precise",
      "why_first": "Why fixing this unlocks multiple downstream improvements",
      "on_court_cue": "One sentence they repeat to themselves mid-point",
      "expected_improvement": "What will improve once this is fixed"
    },
    {
      "rank": 2,
      "fix": "Second priority specific",
      "why_first": "Why this is second",
      "on_court_cue": "Their cue",
      "expected_improvement": "What improves"
    },
    {
      "rank": 3,
      "fix": "Third priority specific",
      "why_first": "Brief reason",
      "on_court_cue": "Their cue",
      "expected_improvement": "What improves"
    }
  ],
  "training_plan": {
    "this_week": "The one technical focus for every session this week",
    "drill_1": {
      "name": "Drill name",
      "targets": "Which fault cluster this addresses",
      "setup": "Exact setup solo feeder partner court position",
      "execution": "Step by step how to perform it",
      "reps": "Volume and sets recommendation",
      "success_marker": "What correct execution feels and looks like"
    },
    "drill_2": {
      "name": "Second drill tactical or mental",
      "targets": "Which tactical or mental pattern this addresses",
      "setup": "Setup",
      "execution": "How to perform",
      "reps": "Volume",
      "success_marker": "How they know it is working"
    },
    "mental_drill": {
      "name": "Mental skill drill name",
      "targets": "Which mental pattern this addresses",
      "setup": "How to set this up in practice",
      "execution": "Exactly what the player does",
      "reps": "How often to practice this",
      "success_marker": "What mastery of this mental skill looks and feels like"
    },
    "match_focus": "One tactical rule simple enough to hold in mind during a match point",
    "mental_cue": "One between-point self-talk phrase personalised to this player"
  },
  "coach_verdict": "One direct honest sentence the kind a real coach says after watching film"
}`.trim();

// ─── Airtable Email Gate ───────────────────────────────────────────────────────
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = "Analysis";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const MAX_FREE = 2;
const ADMIN_EMAILS = ["ayerswilliam@gmail.com", "nimrodayers@gmail.com", "rallyticshq@gmail.com"];

async function checkEmailUsage(email) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) return { count: 0, recordId: null };
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
    const data = await r.json();
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return { count: record.fields.Count || 0, recordId: record.id };
    }
    return { count: 0, recordId: null };
  } catch (e) {
    console.error("Airtable check error:", e.message);
    return { count: 0, recordId: null };
  }
}

async function incrementEmailUsage(email, firstName, level, recordId, currentCount) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) return;
  try {
    if (recordId) {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}/${recordId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { Count: currentCount + 1 } }),
      });
    } else {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { Email: email, FirstName: firstName, Level: level, Count: 1 } }),
      });
    }
  } catch (e) {
    console.error("Airtable increment error:", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { frames, context, playerId, frameCount, durationLabel, firstName, email, level } = req.body;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({ error: "No frames provided" });
  }

  let emailRecordId = null;
  let emailCount = 0;
  const emailNorm = email?.toLowerCase().trim() || "";
  const isAdmin = ADMIN_EMAILS.includes(emailNorm);

  if (email && !isAdmin) {
    try {
      const usage = await checkEmailUsage(emailNorm);
      emailCount = usage.count;
      emailRecordId = usage.recordId;
      if (emailCount >= MAX_FREE) {
        return res.status(403).json({
          error: "EMAIL_LIMIT_REACHED",
          message: `You have already used your ${MAX_FREE} free analyses with this email. Join the Pro waitlist for unlimited access.`,
        });
      }
    } catch (e) {
      console.error("Email gate error:", e.message);
    }
  }

  const playerFocus = playerId
    ? `IMPORTANT: There are multiple players visible. Focus your ENTIRE analysis ONLY on the player matching this description: "${playerId}". Ignore all other players completely.`
    : "This video contains one primary player — analyze that player.";

  const content = [
    {
      type: "text",
      text: `${playerFocus}\n\n${context ? `Player context: "${context}"\n\n` : ""}You are reviewing ${frames.length} frames extracted from a ${durationLabel} match. For each frame, classify the shot type using the exact taxonomy in your instructions. Use confidence prefixes (possible, unclear) where visual evidence is partial.\n\nCRITICAL: Your entire response must be one valid JSON object only. No text before or after. No markdown. No backticks. Start with { and end with }. Never use apostrophes inside string values. Never use unescaped quotes inside string values. Keep all string values on a single line. All shot_distribution count fields must be integers.`,
    },
    ...frames.map((base64) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: base64 },
    })),
  ];

  try {
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 10000,
        system: SYSTEM_PROMPT(frames.length, durationLabel || "unknown-length"),
        messages: [{ role: "user", content }],
      }),
    });

    if (!apiResponse.ok) {
      const err = await apiResponse.json().catch(() => ({}));
      console.error("Anthropic API error:", err);
      return res.status(502).json({ error: err.error?.message || "AI service error" });
    }

    const data = await apiResponse.json();
    const rawText = data.content?.map((b) => b.text || "").join("") || "";

    let clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ");

    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON found. Raw:", clean.slice(0, 400));
      return res.status(500).json({ error: "Could not read AI response. Please try again." });
    }
    const jsonStr = clean.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e1) {
      try {
        const fixed = jsonStr.replace(/\r\n/g, " ").replace(/\r/g, " ").replace(/\n/g, " ").replace(/\t/g, " ");
        parsed = JSON.parse(fixed);
      } catch (e2) {
        try {
          const aggressive = jsonStr.replace(/[\x00-\x1F\x7F]/g, " ");
          parsed = JSON.parse(aggressive);
        } catch (e3) {
          console.error("All parse attempts failed:", e3.message, jsonStr.slice(0, 500));
          return res.status(500).json({ error: "Analysis returned an unexpected format. Please try again." });
        }
      }
    }

    // Coerce shot_distribution count fields to integers in case Claude returned strings
    if (parsed.shot_distribution) {
      const countFields = ["serves_detected", "forehand_groundstrokes", "backhand_groundstrokes", "volleys_detected", "overheads_detected", "approach_shots"];
      countFields.forEach((field) => {
        if (parsed.shot_distribution[field] !== undefined) {
          parsed.shot_distribution[field] = parseInt(parsed.shot_distribution[field], 10) || 0;
        }
      });
    }

    if (!isAdmin) {
      await incrementEmailUsage(emailNorm, firstName, level, emailRecordId, emailCount);
    }

    await sendResultsEmail({ firstName, email, level, result: parsed });

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Unexpected server error" });
  }
}

// ─── Resend Email ──────────────────────────────────────────────────────────────
async function sendResultsEmail({ firstName, email, level, result }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY || !email) return;

  const tech = result.technique || {};
  const strat = result.strategy || {};
  const mental = result.mental_game || {};
  const fixes = result.priority_fixes || [];
  const plan = result.training_plan || {};
  const drill1 = plan.drill_1;
  const drill2 = plan.drill_2;
  const mentalDrill = plan.mental_drill;
  const shotDist = result.shot_distribution || {};

  try {
    const KIT_API_KEY = process.env.KIT_API_KEY;
    if (KIT_API_KEY) {
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
    }
  } catch (e) {
    console.error("Kit error:", e.message);
  }

  const fixesHtml = fixes.map((p) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td width="36" valign="top" style="padding-top:2px;">
          <div style="width:32px;height:32px;border-radius:50%;background:${p.rank === 1 ? "#3b82f6" : "#1e1e1e"};border:1px solid ${p.rank === 1 ? "#3b82f6" : "#2a2a2a"};text-align:center;line-height:32px;font-size:13px;font-weight:900;color:${p.rank === 1 ? "#ffffff" : "#555"};">${p.rank}</div>
        </td>
        <td valign="top" style="padding-left:12px;">
          <div style="color:#e8e8e8;font-size:14px;font-weight:700;line-height:1.5;margin-bottom:6px;">${p.fix || ""}</div>
          ${p.on_court_cue ? `<div style="background:#0a0f1e;border-left:2px solid #3b82f6;padding:8px 12px;border-radius:0 6px 6px 0;margin-top:4px;"><span style="font-size:10px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.1em;">On court say: </span><span style="font-size:13px;color:#c8e63c;font-style:italic;">"${p.on_court_cue}"</span></div>` : ""}
        </td>
      </tr>
    </table>
    ${p.rank < fixes.length ? '<div style="height:1px;background:#1a1a1a;margin-bottom:12px;"></div>' : ""}`).join("");

  const drillsHtml = [drill1, drill2, mentalDrill].filter(Boolean).map((drill, i) => {
    const colors = ["#3b82f6", "#c8e63c", "#a78bfa"];
    const labels = ["Technical Drill", "Tactical Drill", "Mental Drill"];
    const color = colors[i] || "#3b82f6";
    const label = labels[i] || "Drill";
    return `
    <div style="background:#0e0e0e;border:1px solid #1e1e1e;border-radius:10px;padding:16px 18px;margin-bottom:12px;">
      <div style="font-size:9px;color:${color};text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">${label}</div>
      <div style="font-size:15px;font-weight:800;color:#e0e0e0;margin-bottom:8px;">${drill.name || ""}</div>
      <div style="font-size:12px;color:#444;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;">What this fixes: <span style="color:#666;font-weight:600;">${drill.targets || ""}</span></div>
      <p style="color:#666;font-size:13px;margin:0 0 8px;line-height:1.7;">${drill.execution || ""}</p>
      ${drill.reps ? `<div style="font-size:11px;color:#333;margin-bottom:6px;">Volume: ${drill.reps}</div>` : ""}
      ${drill.success_marker ? `<div style="background:#0a0a0a;border-left:2px solid ${color};padding:8px 12px;border-radius:0 4px 4px 0;margin-top:8px;"><span style="font-size:10px;color:${color};text-transform:uppercase;letter-spacing:0.1em;">Success feels like: </span><span style="font-size:13px;color:#888;font-style:italic;">${drill.success_marker}</span></div>` : ""}
    </div>`;
  }).join("");

  const hasShotData = shotDist.dominant_shot_type || shotDist.forehand_groundstrokes > 0 || shotDist.volleys_detected > 0;
  const shotSummaryHtml = hasShotData ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#60a5fa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:12px;">Shot profile</div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${shotDist.forehand_groundstrokes > 0 ? `<td style="text-align:center;padding:8px 4px;"><div style="font-size:20px;font-weight:900;color:#60a5fa;">${shotDist.forehand_groundstrokes}</div><div style="font-size:9px;color:#333;text-transform:uppercase;letter-spacing:0.1em;">FH shots</div></td>` : ""}
      ${shotDist.backhand_groundstrokes > 0 ? `<td style="text-align:center;padding:8px 4px;"><div style="font-size:20px;font-weight:900;color:#60a5fa;">${shotDist.backhand_groundstrokes}</div><div style="font-size:9px;color:#333;text-transform:uppercase;letter-spacing:0.1em;">BH shots</div></td>` : ""}
      ${shotDist.volleys_detected > 0 ? `<td style="text-align:center;padding:8px 4px;"><div style="font-size:20px;font-weight:900;color:#60a5fa;">${shotDist.volleys_detected}</div><div style="font-size:9px;color:#333;text-transform:uppercase;letter-spacing:0.1em;">Volleys</div></td>` : ""}
      ${shotDist.serves_detected > 0 ? `<td style="text-align:center;padding:8px 4px;"><div style="font-size:20px;font-weight:900;color:#60a5fa;">${shotDist.serves_detected}</div><div style="font-size:9px;color:#333;text-transform:uppercase;letter-spacing:0.1em;">Serves</div></td>` : ""}
    </tr></table>
    ${shotDist.dominant_shot_type ? `<div style="margin-top:10px;font-size:12px;color:#444;">Most seen: <span style="color:#888;font-weight:600;">${shotDist.dominant_shot_type.replace(/_/g, " ")}</span></div>` : ""}
    ${shotDist.net_game_visible === false ? `<div style="margin-top:6px;font-size:12px;color:#444;">Net game: <span style="color:#f59e0b;">not seen in this match</span></div>` : ""}
  </td></tr>` : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#111111;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;">
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <tr><td style="background:#0a0a0a;border-radius:16px 16px 0 0;padding:24px 28px 20px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:18px;font-weight:900;color:#c8e63c;letter-spacing:-0.03em;">forty<span style="color:#3b82f6;">.</span><span style="color:#3b82f6;font-weight:300;">fifteen</span></span></td>
      <td align="right"><span style="font-size:10px;color:#333;text-transform:uppercase;letter-spacing:0.15em;">Match Analysis</span></td>
    </tr></table>
  </td></tr>

  <tr><td style="background:#0a0a0a;padding:28px 28px 24px;border-bottom:1px solid #1a1a1a;">
    <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 10px;line-height:1.2;letter-spacing:-0.02em;">Your coaching report is ready, ${firstName}.</h1>
    <p style="color:#555;font-size:14px;margin:0;line-height:1.6;">Here is what your match video revealed. Technique, tactics, and mental game. Take this to your next session.</p>
  </td></tr>

  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="31%" style="background:#111;border:1px solid #222;border-radius:12px;padding:16px 12px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#60a5fa;line-height:1;">${tech.score || "-"}</div>
        <div style="font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Technique /10</div>
      </td>
      <td width="4%"></td>
      <td width="31%" style="background:#111;border:1px solid #222;border-radius:12px;padding:16px 12px;text-align:center;">
        <div style="font-size:36px;font-weight:900;color:#f59e0b;line-height:1;">${strat.score || "-"}</div>
        <div style="font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Strategy /10</div>
      </td>
      <td width="4%"></td>
      <td width="30%" style="background:#111;border:1px solid #222;border-radius:12px;padding:16px 12px;text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#a78bfa;line-height:1.3;margin-bottom:4px;">${mental.failure_mode ? mental.failure_mode.split(" ").slice(0, 2).join(" ") : "None"}</div>
        <div style="font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Mental Pattern</div>
      </td>
    </tr></table>
  </td></tr>

  ${shotSummaryHtml}

  ${result.coach_verdict ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="3" style="background:#3b82f6;border-radius:2px;">&nbsp;</td>
      <td style="padding-left:14px;">
        <div style="font-size:9px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:8px;">Coach verdict</div>
        <p style="color:#888;font-style:italic;font-size:14px;margin:0;line-height:1.65;">"${result.coach_verdict}"</p>
      </td>
    </tr></table>
  </td></tr>` : ""}

  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:16px;">Your top 3 technical fixes</div>
    ${fixesHtml}
  </td></tr>

  ${mental.psychological_tip || mental.observation ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:12px;">Mental game insight</div>
    ${mental.observation ? `<p style="color:#666;font-size:13px;margin:0 0 12px;line-height:1.7;">${mental.observation}</p>` : ""}
    ${mental.psychological_tip ? `
    <div style="background:#0d0a1a;border:1px solid #1e1535;border-radius:10px;padding:14px 16px;">
      <div style="font-size:9px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">This week's psychological tip</div>
      <p style="color:#bbb;font-size:14px;font-weight:600;margin:0;line-height:1.6;">${mental.psychological_tip}</p>
    </div>` : ""}
  </td></tr>` : ""}

  ${plan.mental_cue ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="background:#0d0a1a;border-left:2px solid #a78bfa;padding:12px 16px;border-radius:0 8px 8px 0;">
      <div style="font-size:9px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Your between-point phrase</div>
      <p style="color:#d0c0ff;font-size:16px;font-weight:800;margin:0;font-style:italic;">"${plan.mental_cue}"</p>
      <p style="color:#444;font-size:11px;margin:6px 0 0;line-height:1.5;">Repeat this to yourself every time you walk back to the baseline.</p>
    </div>
  </td></tr>` : ""}

  ${drillsHtml ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:14px;">This week's training prescription</div>
    ${drillsHtml}
  </td></tr>` : ""}

  ${plan.match_focus ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="background:#080e1a;border:1px solid #0e1e3a;border-radius:10px;padding:16px 18px;">
      <div style="font-size:9px;color:#3b82f6;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:8px;">Match rule this week</div>
      <p style="color:#ccc;font-size:15px;font-weight:700;margin:0;line-height:1.5;">${plan.match_focus}</p>
      <p style="color:#333;font-size:11px;margin:8px 0 0;line-height:1.5;">One rule simple enough to hold in mind during a match point.</p>
    </div>
  </td></tr>` : ""}

  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;text-align:center;">
    <a href="https://fortyfifteen.app" style="display:inline-block;background:#c8e63c;color:#060606;border-radius:10px;padding:13px 32px;font-weight:900;font-size:14px;text-decoration:none;letter-spacing:0.01em;">Analyze another match</a>
  </td></tr>

  <tr><td style="background:#080808;border-radius:0 0 16px 16px;padding:20px 28px;text-align:center;">
    <p style="color:#333;font-size:12px;margin:0 0 6px;line-height:1.6;">You received this because you analyzed a match on Forty Fifteen. We will never send spam.</p>
    <p style="color:#2a2a2a;font-size:11px;margin:0;">Coach-built. Science-backed. Made for players who want to improve.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Forty Fifteen <coach@fortyfifteen.app>",
        to: [email],
        subject: `Your Forty Fifteen coaching report is ready, ${firstName}`,
        html,
      }),
    });
    const emailData = await emailRes.json();
    console.log("Resend:", JSON.stringify(emailData).slice(0, 200));
  } catch (err) {
    console.error("Resend error:", err.message);
  }
}
