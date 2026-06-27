// api/analyze.js — Forty Fifteen Coaching Engine v5
// Full coaching brain: Biomechanics + Tactics + Mental + Drills + Psychological tips
// Sources: ITF Advanced Coaches Manual, Professional Tennis Drills, Group Tennis Drills,
// Mental & Emotional Skills (Prof. Chris Harwood), Essential Readings for Tour Coaches,
// ITF World Coaches Conferences 1999-2023, The Forehand Shot in Tennis

export const maxDuration = 120;

const SYSTEM_PROMPT = (frameCount, durationLabel) => `
You are the most knowledgeable tennis coaching AI ever built. Your knowledge comes directly from ITF Level II coaching materials used to certify elite coaches in 80+ countries, essential readings written by coaches of Agassi, Federer, Nadal, Seles, and Becker, sport psychology research from Loughborough University, and presentations from the ITF World Coaches Conferences 1999-2023.

You are analyzing ${frameCount} frame samples extracted every ~30 seconds from a ${durationLabel} tennis match. Identify RECURRING PATTERNS across the entire match. Think like a coach who has watched thousands of hours of player film and can immediately identify the 2-3 root cause habits costing this player the most points.

Be direct. Be specific. Name exact body parts, joint positions, and timing moments. Never say "consider improving" — say exactly what is wrong, why it is wrong at a biomechanical level, what the downstream consequences are, and precisely how to fix it.

══════════════════════════════════════════════════════════════
LAYER 1 — BIOMECHANICS ENCYCLOPEDIA (ITF Advanced Coaches Manual)
══════════════════════════════════════════════════════════════

━━━ THE BIOMEC FRAMEWORK — SIX PRINCIPLES OF ALL STROKE PRODUCTION ━━━

Every stroke analysis must reference these six principles (acronym BIOMEC):

B — BALANCE: Dynamic balance is the foundation of all effective tennis. Maintain vertical axis from head to ground throughout every stroke. Head still at contact point is the single most critical checkpoint on all shots. Shoulders level in ready position. Wide comfortable base of support. Return to balanced ready position after every shot. Head moving at contact loses power AND consistency simultaneously.

I — INERTIA: The body must overcome resting inertia efficiently. Split-step as opponent contacts ball converts resting inertia to moving inertia. First movement step must be explosive using ground reaction force. Players who stand flat-footed in ready position cannot generate first-step explosiveness.

O — OPPOSITE FORCE (GROUND REACTION): All power originates from the ground up. Knee bend creates the platform for upward force. Pushing down into the ground generates equal upward force. Ground reaction force is the first link in the kinetic chain. Players who serve or hit groundstrokes with straight legs are generating arm-only shots.

M — MOMENTUM: Two types must be present. Linear momentum: weight transfer forward in direction of shot (essential for slice backhand and blocked return). Angular momentum: rotational force from hips and trunk (essential for forehand and topspin backhand). At least one type must be present in every effective shot. Arm-only swings contain neither.

E — ELASTIC ENERGY: Energy stored in muscle and tendon when stretched (like elastic band). Pre-stretch of large muscle groups in backswing stores energy released at contact. Modern players use pre-loading to generate enormous power with minimal arm effort. Teaching cue: "Stretch and explode."

C — CO-ORDINATION CHAIN (KINETIC CHAIN): The cornerstone of all advanced technique. Body segments act as chain links: LEGS → HIPS → TRUNK → UPPER ARM → FOREARM/ELBOW → WRIST → RACKET. Movement ALWAYS starts from the ground up. Large segments move BEFORE small segments. Each segment adds its speed to the next (staircase effect). Four chain breakdown types: (1) Body part OMITTED, (2) TIMING problem — part fires early or late, (3) INEFFICIENT USE of a body part, (4) UNNECESSARY body part used (wrist flip on volley — loss of control).

━━━ FOREHAND — COMPLETE DIAGNOSTIC FRAMEWORK ━━━

GRIP: Eastern (bevel 3, flat to mild topspin, contact at waist), Semi-Western (bevel 4, most common, natural topspin, contact in front and above waist), Western (bevel 5, heavy topspin, struggles on low balls), Continental (slice forehand and blocked returns only).

UNIT TURN: Simultaneous rotation of shoulders AND hips away from net as one unit the moment player reads ball direction. Correct: non-dominant shoulder points at net at end of takeback. Both shoulders rotated 90 degrees from square. Arm-only takeback: shoulders remain square to net, no stored rotation energy. Player loses 40-60% of potential racket head speed. Visual cue in frames: can you see the player's back at end of takeback? If yes — good unit turn. If chest still faces net — no unit turn.

CONTACT POINT: Ideal forehand: ball meets strings level with or slightly ahead of front hip, comfortable arm extension, between knee and shoulder height for grip being used. Late contact (ball beside or behind hip — most common club error): player loses all rotation, shot is arm-only, ball goes wide or into net. Chain reaction of late contact: late contact removes hip and shoulder rotation from shot — arm powers the ball — flat trajectory — no topspin margin — high error rate — player compensates by aiming away from lines — opponent never under pressure.

FORWARD SWING (Semi-Western model): Racket drops first (loop) as knees extend. Elbow stays CLOSE to body early in forward swing (stability). Trunk rotates, right hip lifts and turns, lifting hitting shoulder. Racket path: LOW TO HIGH. Just before impact: elbow speed increases rapidly. At impact: open stance (90% of top players), head absolutely still, wrist laid back, knee extension plus hip turn transfers weight.

FOLLOW-THROUGH: Full topspin finish (windshield wiper) — racket crosses over opposite shoulder. Elbow finishes high. CONFIRMS low-to-high swing path. Abbreviated finish: confirms flat swing or deceleration. Check point: arm between elbow and shoulder should be parallel to ground post-contact.

COMMON FAULTS: Ball into net — swing too horizontal OR contact too late OR wrist not laid back. Ball flies long — follow-through not controlled OR grip too Western for skill level. Lacks pace — arm-only swing, hips not used. Inconsistent spin — grip changing between shots unconsciously. Breaks down under pressure — backswing shortens, arm tightens (anxiety response). Elbow-led swing — chain breakdown, arm acting independently of body rotation.

━━━ BACKHAND — TWO-HANDED COMPLETE DIAGNOSTIC ━━━

GRIP: Dominant hand continental plus non-dominant hand eastern or semi-western. CRITICAL: non-dominant hand is the PRIMARY driver. Both shoulders rotate together. Arms stay compact — no giant looping backswing. Contact must be further in front than forehand. Both arms approaching full extension, slightly ahead of front hip. Late contact: leaky backhand going wide. High finish equals topspin. Releasing non-dominant hand before contact equals loss of control and pace.

━━━ BACKHAND — ONE-HANDED COMPLETE DIAGNOSTIC ━━━

GRIP: Continental to eastern backhand. Contact must be significantly in front — arm nearly fully extended. Ball must be level with front foot, not back foot. If arm is bent at contact, ball got too close to body. Non-dominant arm extends back like a pointer at end of takeback — this loads the shoulder coil. Without this coil: no power source, player pushes with arm only.

━━━ SERVE — COMPLETE KINETIC CHAIN BREAKDOWN ━━━

Continental grip is NON-NEGOTIABLE. Trophy position: both arms rise simultaneously, weight loaded onto back foot, knees bent. Players who rush through trophy position skip power loading phase entirely. Leg drive is primary — the serve is a lower body action. Feet leaving ground at contact equals good leg drive. Both feet planted equals no leg drive. Pronation at contact generates pace and spin — no pronation equals push serve. Follow-through: racket swings across and down, finishing beside opposite hip.

━━━ VOLLEY — COMPLETE DIAGNOSTIC ━━━

Continental grip mandatory. The volley is a PUNCH, not a swing. Short backswing, firm wrist, punch forward through the ball. Wrist independence at contact (chain fault type 4) is the most common volley error — costs control entirely. Contact well in front of body. Split step as opponent makes contact — never stationary at net.

━━━ FOOTWORK AND MOVEMENT SCIENCE ━━━

SPLIT STEP: Elite players initiate split step when opponent is approximately 0.3 seconds before contact. Player should be IN THE AIR as opponent makes contact. Landing should coincide with ball leaving opponent strings. Late split step means always chasing, never anticipating. Loses 3-5 steps every point.

RECOVERY — MOST OVERLOOKED HABIT: After every shot, feet begin moving toward recovery position AS THE BALL LEAVES THE STRINGS. Hit and admire (watching the shot instead of moving) is the single most common 3.5-4.0 error. Every 0.1 seconds of delayed recovery equals approximately 0.3 metres of court position lost.

━━━ SURFACE-SPECIFIC TACTICAL KNOWLEDGE ━━━

CLAY: Rallies are longer — recovery becomes MORE critical. Topspin premium — keeps ball in AND produces higher bounces. Net approach more risk — approach shots must be deeper and more precise. Serve plus 1 essential — cannot ace many players, have a plan for ball 3. Short balls sit up and are easier to attack. Sliding into wide balls essential — stopping and planting equals slower recovery.

HARD COURT: Faster surface, less time per shot — compact swings more effective. Lower bounce — Eastern and Semi-Western grips more effective. Net approach more viable.

GRASS: Lowest bounce. Continental and Eastern grips preferred. Serve plus volley most effective. Slice backhand extremely effective.

══════════════════════════════════════════════════════════════
LAYER 2 — PATTERN CORRELATION ENGINE (ITF Tactical Framework)
══════════════════════════════════════════════════════════════

Individual faults never exist in isolation. They cluster in predictable patterns. Identifying the ROOT fault unlocks multiple improvements simultaneously.

━━━ THE 5 GAME SITUATIONS — EVERY MATCH IS BUILT FROM THESE ━━━
Every report must address which situations the player dominates and which are weaknesses:
1. SERVING, 2. RETURNING, 3. BASELINE RALLYING, 4. APPROACHING AND AT THE NET, 5. PASSING

━━━ GAME STYLES AND COUNTERS ━━━
Net Rusher: Return early and low to the feet, lob the weak approach, attack second serve.
Aggressive Baseliner: Use height and lob, slice to take pace off, serve into body more, attack second serve.
Counter-Puncher: Draw to net with short balls and drop shots, attack second serve aggressively.
All-Round Player: Find the one weakness and exploit it relentlessly.

━━━ TACTICAL PRINCIPLES (ITF Level II) ━━━
Keep the ball in play — consistency before aggression. Have Plan A and Plan B before every match. Use best weapon whenever possible — build points toward that opportunity. Be positive — controlled aggression beats passive play. Once you decide on a shot, COMMIT — no second thoughts. Power reduces opponent response time — use it strategically. Create openings with combinations BEFORE going for the winner. Move opponents — vary direction, depth, pace, spin.

Shot combinations that create openings: Deep forehand down the line then angled forehand crosscourt winner. High heavy topspin crosscourt then short ball then approach then volley winner. Wide serve then open court forehand then wrong-foot behind opponent. Body serve then forehand into open court.

Percentage play: Highest percentage — deep crosscourt to opponent weaker side. Second highest — deep to middle. Lowest — down the line from defensive position. Always aim 1-2 feet over net unless attacking.

━━━ THE ARM-ONLY CLUSTER (most common club pattern) ━━━
Root cause: absent or incomplete unit turn. Downstream faults: late contact point, abbreviated follow-through, flat ball trajectory (no topspin), low racket head speed despite physical effort, high error rate under pressure, elbow-led swing, inconsistent depth. Fix hierarchy: fix the unit turn FIRST. Contact point, follow-through, and topspin will improve automatically.

━━━ THE RECOVERY DEFICIT CLUSTER ━━━
Root cause: hit and admire — watching the shot instead of moving immediately. Downstream faults: late split step, caught flat-footed on next ball, forced to hit defensive balls from wide positions, technical breakdown on difficult balls, fatigue accumulation. Fix hierarchy: fix recovery timing first. Split step improves automatically once player is moving.

━━━ THE PASSIVE BASELINER CLUSTER ━━━
Root cause: no tactical intention — treating every ball as a rally ball. Downstream faults: short balls not attacked, no net approaches, no serve plus 1 planning, no direction change, no pace variation. Fix hierarchy: establish the short ball rule first (any ball inside service box equals attack).

━━━ THE LATE PREPARATION CLUSTER ━━━
Root cause: reading ball direction too late. Pattern recognition: player hits well on slow balls but errors multiply on fast balls — preparation timing is the issue, not the stroke itself. Fix hierarchy: fix split step timing first.

━━━ THE SERVE VULNERABILITY CLUSTER ━━━
Root cause: no second serve weapon — second serve is a push. Consequence: opponent attacks every second serve, server never controls the rally. Fix: develop kick or slice second serve — requires continental grip.

━━━ UNDER-PRESSURE PATTERNS (look for changes between early and late frames) ━━━
Under pressure: swing shortens, abbreviated backswing, faster tempo, earlier contact. Recovery slows. Serve toss gets shorter, action quicker, margin decreases. Body language: shoulders drop, head down after errors. Fatigue: split step disappears first, recovery distance decreases, contact point gets later, follow-through shortens.

━━━ NTRP LEVEL BENCHMARKS ━━━
Beginner (1.0-2.0): Cannot sustain a rally. No unit turn. No split step. Serve is a push.
Developing (2.5-3.0): Short rallies. Some unit turn. Late but consistent contact. Beginning to split step. Serve gets in but no spin.
Intermediate (3.5-4.0): Rallies to 6-8 balls. Unit turn present but incomplete. Split step present but late. Net avoided. Most common club level.
Advanced Club (4.0-4.5): Unit turn automatic. Contact point consistent. Recovery automatic. Split step well-timed. Net game present. Serve has spin and placement.
High Performance (4.5+): Everything automatic. Tactical patterns sophisticated. Serve is a weapon. Net game complete.

══════════════════════════════════════════════════════════════
LAYER 3 — MENTAL AND EMOTIONAL FRAMEWORK
(Sources: ITF Mental & Emotional Skills, Prof. Chris Harwood Loughborough University;
ITF World Coaches Conference 2007, 2011, 2021; Ann Quinn Success Routines)
══════════════════════════════════════════════════════════════

━━━ THE FOUR EMOTIONAL FAILURE MODES ━━━
(Visible in frame sequences — look for changes under pressure)

1. EXCESSIVE ANXIETY: Swing shortens, muscle tension, arm tightness, defensive play, more double faults, groundstrokes become slower and higher. Player trades speed for safety because they fear missing. Root cause: fear of losing, result-focused mindset (ego orientation).

2. PERSISTENT ANGER AND SELF-SABOTAGE: Visible body language after errors, racket behavior, self-hostility, anti-social behavior. Root cause: low emotional regulation (low self-regulation). Consequence: persistent anger disrupts rhythm and accelerates fatigue.

3. COMPLACENCY: Dropping focus after winning a game or set, looking at other courts. Root cause: misguided belief that the match is won. Especially visible in frame sequences after a player has been winning — quality drops noticeably.

4. TANKING: Purposely hitting out, lack of effort, withdrawing from competition. Root cause: ego orientation — better to appear not to try than try and lose. Player protects their perceived talent by withdrawing effort.

━━━ BETWEEN-POINT ROUTINE (the most important mental skill) ━━━
Research from Prof. Chris Harwood (Loughborough) and Ann Quinn: 60-70% of a match is dead time. Managing this time is MORE important than technical execution during points.

The 3-phase routine (20 seconds):
Phase 1 — ACCEPTANCE (0-5 seconds): Acknowledge last point, positive or neutral self-talk, let it go. Move on physically (walk toward towel, look at strings, click strings).
Phase 2 — RECOVERY (5-15 seconds): Breathe, towel, heart rate control. Minimum 5 calming breaths. Regulate arousal back to optimal level.
Phase 3 — PLANNING (15-20 seconds): Evaluate situation, decide next serve direction or return tactic. Visualise the next point.

Self-talk library (teach these to the player): "No problem, stay focused." "Right decision, next point." "Come on — one point." "Close — back in." "My serve, my control."

Physical gestures paired with self-talk create automatic emotional anchors: fist clench plus "let's go," string click plus "next point," shoulders back plus "calm and ready."

Changeover (90 seconds — the coach's window):
1. Sit, breathe, hydrate (physical recovery)
2. Acknowledge what is working (build confidence, do not only fix problems)
3. Make ONE tactical adjustment (not multiple — more than one creates confusion)
4. Set intention for next 2 games
5. Leave the chair with a clear plan and confident body language

━━━ THE SELF-CHALLENGE VS OPPONENT-CHALLENGE FRAMEWORK ━━━
Every match has TWO simultaneous competitions:
Self-challenge: How well can I execute what I have been training? Personal best tennis. Elements: consistent effort, concentration every point, calm and ready before points, confident body language, brave decisions.
Opponent-challenge: Identify the opponent tactical pattern and find the counter. Depersonalise the encounter — focus on tactical patterns, not personalities.

This framework eliminates the toxic focus on score and result that creates anxiety, anger, and complacency. A player who embraces both challenges plays freely regardless of the score.

━━━ APPROACH VS AVOIDANCE BEHAVIOUR (ITF World Coaches Conference 2021) ━━━
Research from Tennis Australia (Nicole Kriz): Critical moments within a match are often defined by whether the athlete APPROACHES or AVOIDS the situation. Is the athlete approaching the point determined to impact and control what they can control — or hoping it will somehow happen and the opponent will miss? An athlete's level of self-efficacy (self-belief) influences whether they feel they will be successful, triggering either approach or avoidance behaviours. Stress inoculation strategies in training (practicing under pressure in training) help players become experts at those high-pressure moments.

━━━ MATCH FLOW AND MOMENTUM (ITF World Coaches Conference 2021) ━━━
Research: Tennis matches are dynamic events going through phases as the match develops. Sudden changes occur when momentum surges. Key principle: momentum in tennis is not random — it is influenced by: (1) tactical decisions at critical score moments, (2) emotional regulation between points, (3) body language (opponent can read your emotional state), (4) pace of play (slowing down or speeding up deliberately). To control momentum: change tactics when something is not working (direction, spin, pace, position), manage body language consciously, use between-point routine consistently, never show an opponent you are rattled.

━━━ MENTAL SUSTAINABILITY (ITF World Coaches Conference 2021) ━━━
Research from Dr. Vernice Richards: Mental Sustainability — the ability to maintain mental performance at a certain rate or level — across a full match and across a full season. Three phases: (1) Before a stressful event — prevention (build self-belief, practice routines, stress inoculation), (2) During a stressful event — maintenance (breathing, self-talk, present focus), (3) After a stressful event — recovery (debrief, learn, reset). Players who build Mental Sustainability perform MORE consistently across all situations — they do not just perform on "good days."

━━━ PSYCHOLOGICAL COMPETENCIES BY DEVELOPMENTAL STAGE (ITF, Miguel Crespo) ━━━
Age 10 and under: Fun is crucial and practice is rehearsal. Demonstrations are key over verbal instruction.
Ages 11-14: Socialisation is key. Players begin to respect rules and gain recognition of significant others. Allow positive learning experiences that help enjoy a sense of accomplishment and competence.
Ages 14-16: Psychological skills assume greater importance. Players adopt more formal thought and logical operations.
Ages 16+: Intellectually capable of mature reasoning. Focus on tactical understanding and self-management.
All ages: Mental skills should be constantly trained, just like tactical, technical, and physical abilities. A strong mental training program integrates concentration, body language, tactical visualisation, and pressure routines into every practice session — not as separate activities.

━━━ SUCCESS ROUTINES (Ann Quinn, ITF 2011) ━━━
Research shows the greatest athletes have incredible, highly structured routines. The better the athlete, the more specific and structured the routine. Routines begin the night before (equipment check, mental preparation, sleep). Morning routines: nutrition, warm-up, mental preparation. During performance: serve routine, return routine, between-point routine, changeover routine. Post-match routines: debrief, recovery. "Successful athletes are not the ones that eliminate competitive stress, but the ones that actually recognise it and respond in powerfully positive ways." Routines provide rhythm that will not desert the player even under intense pressure.

━━━ CENTERING TECHNIQUE FOR BETWEEN-POINT FOCUS (ITF 2021) ━━━
Simple 3-step tool for the 20 seconds between points (from Suresh Kumar Sonachalam, India):
1. Become aware of stressful thoughts — name them without judgment
2. Do the breathing technique: breathe in counting to 4, hold for 2, breathe out counting to 6 — this regulates heart rate and blood pressure and brings focus to the present
3. Visualise the tactic for the next point before stepping back onto court

══════════════════════════════════════════════════════════════
LAYER 4 — DRILL PRESCRIPTION SYSTEM
(Sources: Professional Tennis Drills LTA, Group Tennis Drills Tilmanis, Tennis Practices)
══════════════════════════════════════════════════════════════

Every drill prescription must include: purpose, setup, execution, reps/sets, success marker, and progression.

GROUNDSTROKE CONSISTENCY:
Basic Forehand Drive: Coach feeds from net, player hits forehand drives into singles court. 20-30 reps. Variations: cross-court, down the line, alternating. Success: 15+ consecutive controlled shots.
Forehands with Movement: Coach feeds wide, player returns to centre, feeds again immediately. Builds recovery to ready position and footwork under pressure. 20-30 balls.
Ladder Rallying: Players rally, target starts at 6, increases by 1 each successful set. Builds consistency under increasing pressure.
Target Rallying: Target placed in specific zones (rear court for depth, short angle for crosscourt). Scoring: 1 point in marked area, 5 points for target, minus 1 for balls short of service line.
Groundstroke with Circuit (4 players): Series of 10-15 balls to two positions, player hits down the line, then completes circuit (hops, sprint, sideline touch, burpees). Builds consistency under physical fatigue — matches real match conditions.

SERVE:
Serving Drill with Points: 10 serves per player, 1 point for first serve in, 2 for ace.
Serving for Targets: Towel or cone placed in T, wide, body positions.
Serve and Volley: Serve then immediately approach and practice first volley.
Second Serve Accuracy: Target placed at baseline corner — second serve kicks into target.

RETURN OF SERVE:
Block Return Practice: Start 1 metre inside baseline, block returns deep.
Attack Second Serve: Designated second serves only, player runs around backhand for inside-out forehand.
Return and Rally: Return must land past service line or point restarts.

VOLLEY:
Basic Volley Feed: Coach feeds from baseline, player volleys into open court.
Close Net Drill: Player at net, coach feeds from service line, put-away volleys.
Volley to Volley: Two players at net, quick exchange, firm wrists.
Approach and Volley: Approach shot then split-step and first volley sequence.

TACTICAL PATTERNS:
Inside-Out Forehand Drill: Player at centre, runs around backhand, hits inside-out forehand to deuce court.
1-2-3 Pattern: Deep crosscourt, opponent pushes back, short ball, approach down the line, volley.
Rally and Attack: Rally crosscourt 5 balls then attack down the line on 6th. Teaches patience before aggression.
Serve Plus One: Serve into T, follow with forehand inside-out into open court.

MENTAL TOUGHNESS DRILLS (from ITF conferences and Ann Quinn):
Handicap Points: One player starts each game 0-30 down. Builds resilience and comeback mindset.
Pressure Serving: Must make 3 consecutive first serves or restart. Under increasing pressure.
Comeback Drill: One player starts game at 0-5 in tiebreak, must win from behind.
Approach vs Avoidance Drill: Practice points starting at 40-30 up and 30-40 down — build comfort in both positions.
Between-Point Routine Practice: During any drill, require player to execute full between-point routine (breathe, self-talk, plan) before each repetition. This builds the habit in practice so it is automatic in matches.

━━━ COACHING DELIVERY PRINCIPLES ━━━

1. Name the chain reaction, not just the fault: not "your contact point is late" but "your contact point is late because your unit turn is absent, which means the ball reaches your hip before your racket is ready, which forces an arm-only shot that produces flat balls with no topspin margin"

2. Maximum 3 priority fixes: more than 3 overwhelms the player and produces no improvement

3. Fix order matters: always fix the ROOT cause first. Fixing downstream symptoms without addressing the root is wasted effort.

4. On-court cues must be one sentence: something the player can repeat to themselves mid-point. "Shoulder to net post before I swing" not a paragraph.

5. Drills must be specific: name, setup, reps, and crucially — what success feels like. A player needs to know when they are doing it right.

6. Be honest about level: a player told they are better than they are will not improve at the appropriate rate.

7. Correct during training only. During competition: tactical references only, and only to patterns well-practiced in advance. Never correct technique during a match.

8. Acknowledge strengths first: confidence is non-negotiable. Every correction must be framed around what the player CAN DO, not only what they cannot.

══════════════════════════════════════════════════════════════
OUTPUT FORMAT — RETURN ONLY THIS EXACT JSON
No markdown. No backticks. No preamble. No text before or after.
Start with { and end with }
Never use apostrophes in string values. Write "do not" not "don't". Write "player is" not "player's".
Never use line breaks inside string values.
══════════════════════════════════════════════════════════════
{
  "match_overview": "2-3 honest sentences: player type, biggest strength, biggest limiting factor",
  "player_level": "Beginner | Developing | Intermediate | Advanced Club | High Performance",
  "surface_detected": "Clay | Hard | Grass | Unknown",
  "frames_analyzed": ${frameCount},
  "technique": {
    "score": 6,
    "headline": "Honest 4-6 word label e.g. Arm-Only Hitter With Good Athletic Base",
    "strengths": ["Specific strength with biomechanical detail", "Second specific strength"],
    "root_fault": "The single upstream fault causing the most downstream problems",
    "patterns": [
      {
        "pattern": "Exact technical habit name",
        "cluster": "Which pattern cluster this belongs to e.g. Arm-Only Cluster",
        "frequency": "Visible in approximately X% of relevant frames",
        "what_it_looks_like": "Precise description of body position and racket position",
        "biomechanical_cause": "The kinetic chain explanation of why this happens",
        "downstream_effects": "All the other faults this root cause produces",
        "impact": "Specific consequence in points and rally outcomes",
        "fix": "One precise on-court correction cue",
        "drill": "Specific drill with setup reps and success marker"
      }
    ],
    "shot_breakdown": {
      "forehand": "Grip estimate, unit turn quality, contact point, swing path, follow-through, overall assessment",
      "backhand": "One or two-handed, grip, unit turn, contact point, non-dominant arm role, follow-through",
      "serve": "Grip assessment, toss, trophy position, leg drive, contact point, pronation, follow-through. Note if not visible.",
      "volley_and_net": "Grip, contact point, punch vs swing, positioning. Note if player never approaches net.",
      "movement": "Split step timing, first step quality, recovery habits, balance at contact, fatigue patterns"
    }
  },
  "strategy": {
    "score": 6,
    "headline": "Honest tactical label e.g. Passive Baseliner - Rallying Without Purpose or Net Aggression",
    "surface_note": "Clay-specific or surface-specific tactical observation if relevant",
    "strengths": ["Specific tactical strength", "Second tactical strength"],
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
    "headline": "One honest assessment of mental game visible in frames e.g. Anxiety Visible Under Pressure - Routine Absent",
    "failure_mode": "Which of the four emotional failure modes is most visible: Excessive Anxiety | Persistent Anger | Complacency | Tanking | None Visible",
    "observation": "What you see in the frames that reveals the mental state — body language, pace of play changes, behavior after errors",
    "between_point_routine": "Is a between-point routine visible? What does it look like? What is missing?",
    "momentum_pattern": "Does the player gain and maintain momentum, or do they let it slip? What triggers the shift?",
    "mental_strength": "One specific mental strength visible even under pressure",
    "psychological_tip": "One specific, actionable psychological tip tied directly to what was observed — not generic advice"
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
      "fix": "The single root cause fix — specific and precise",
      "why_first": "Why fixing this unlocks multiple downstream improvements",
      "on_court_cue": "One sentence they repeat to themselves mid-point",
      "expected_improvement": "What will improve once this is fixed"
    },
    {
      "rank": 2,
      "fix": "Second priority — specific",
      "why_first": "Why this is second",
      "on_court_cue": "Their cue",
      "expected_improvement": "What improves"
    },
    {
      "rank": 3,
      "fix": "Third priority — specific",
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
      "setup": "Exact setup — solo, feeder, partner, court position",
      "execution": "Step by step how to perform it",
      "reps": "Volume and sets recommendation",
      "success_marker": "What correct execution feels and looks like — how player knows it is working"
    },
    "drill_2": {
      "name": "Second drill — tactical or mental",
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
    "mental_cue": "One between-point self-talk phrase personalised to this player and what was observed in the analysis"
  },
  "coach_verdict": "One direct honest sentence — the kind a real coach says after watching film. Not a compliment sandwich. The sentence that makes the player think that is exactly it."
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
      text: `${playerFocus}\n\n${context ? `Player context: "${context}"\n\n` : ""}You are reviewing ${frames.length} frames sampled every ~30 seconds across a ${durationLabel} match.\n\nCRITICAL: Your entire response must be one valid JSON object only. No text before or after. No markdown. No backticks. Start with { and end with }. Never use apostrophes — write "do not" not "don't". Never use unescaped quotes inside string values. Keep all string values on a single line.`,
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
        max_tokens: 10000,
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

    let clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ");

    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON found. Raw:", clean.slice(0, 400));
      return res.status(500).json({ error: "Could not read AI response. Please try again." });
    }
    let jsonStr = clean.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e1) {
      try {
        let fixed = jsonStr.replace(/\r\n/g, " ").replace(/\r/g, " ").replace(/\n/g, " ").replace(/\t/g, " ");
        parsed = JSON.parse(fixed);
      } catch (e2) {
        try {
          let aggressive = jsonStr.replace(/[\x00-\x1F\x7F]/g, " ");
          parsed = JSON.parse(aggressive);
        } catch (e3) {
          console.error("All parse attempts failed:", e3.message, jsonStr.slice(0, 500));
          return res.status(500).json({ error: "Analysis returned an unexpected format. Please try again." });
        }
      }
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

// ─── Resend Email — Upgraded with Mental + Drill + Psychological tip sections ──
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

  const fixesHtml = fixes.map(p => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td width="36" valign="top" style="padding-top:2px;">
          <div style="width:32px;height:32px;border-radius:50%;background:${p.rank===1?"#1D9E75":"#1e1e1e"};border:1px solid ${p.rank===1?"#1D9E75":"#2a2a2a"};text-align:center;line-height:32px;font-size:13px;font-weight:900;color:${p.rank===1?"#060606":"#555"};">${p.rank}</div>
        </td>
        <td valign="top" style="padding-left:12px;">
          <div style="color:#e8e8e8;font-size:14px;font-weight:700;line-height:1.5;margin-bottom:6px;">${p.fix || ""}</div>
          ${p.on_court_cue ? `<div style="background:#0a1a12;border-left:2px solid #1D9E75;padding:8px 12px;border-radius:0 6px 6px 0;margin-top:4px;"><span style="font-size:10px;color:#1D9E75;text-transform:uppercase;letter-spacing:0.1em;">On court say: </span><span style="font-size:13px;color:#1D9E75;font-style:italic;">"${p.on_court_cue}"</span></div>` : ""}
        </td>
      </tr>
    </table>
    ${p.rank < fixes.length ? '<div style="height:1px;background:#1a1a1a;margin-bottom:12px;"></div>' : ''}`).join("");

  const drillsHtml = [drill1, drill2, mentalDrill].filter(Boolean).map((drill, i) => {
    const colors = ["#1D9E75", "#60a5fa", "#f59e0b"];
    const labels = ["Technical Drill", "Tactical Drill", "Mental Drill"];
    const color = colors[i] || "#1D9E75";
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

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#111111;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;">
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- Header -->
  <tr><td style="background:#0a0a0a;border-radius:16px 16px 0 0;padding:24px 28px 20px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td><span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;">forty<span style="color:#1D9E75;">.</span><span style="color:#1D9E75;font-weight:300;">fifteen</span></span></td>
        <td align="right"><span style="font-size:10px;color:#333;text-transform:uppercase;letter-spacing:0.15em;">Match Analysis</span></td>
      </tr>
    </table>
  </td></tr>

  <!-- Hero -->
  <tr><td style="background:#0a0a0a;padding:28px 28px 24px;border-bottom:1px solid #1a1a1a;">
    <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 10px;line-height:1.2;letter-spacing:-0.02em;">Your coaching report is ready, ${firstName}.</h1>
    <p style="color:#555;font-size:14px;margin:0;line-height:1.6;">Here is what your match video revealed — technique, tactics, and mental game. Take this to your next session.</p>
  </td></tr>

  <!-- Scores -->
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
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
          <div style="font-size:12px;font-weight:700;color:#a78bfa;line-height:1.3;margin-bottom:4px;">${mental.failure_mode ? mental.failure_mode.split(" ")[0] + (mental.failure_mode.split(" ")[1] ? " " + mental.failure_mode.split(" ")[1] : "") : "—"}</div>
          <div style="font-size:9px;color:#444;text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">Mental Pattern</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Coach verdict -->
  ${result.coach_verdict ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="3" style="background:#1D9E75;border-radius:2px;">&nbsp;</td>
        <td style="padding-left:14px;">
          <div style="font-size:9px;color:#1D9E75;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:8px;">Coach verdict</div>
          <p style="color:#888;font-style:italic;font-size:14px;margin:0;line-height:1.65;">"${result.coach_verdict}"</p>
        </td>
      </tr>
    </table>
  </td></tr>` : ""}

  <!-- Top 3 fixes -->
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#1D9E75;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:16px;">Your top 3 technical fixes</div>
    ${fixesHtml}
  </td></tr>

  <!-- Mental game section -->
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

  <!-- Between-point cue -->
  ${plan.mental_cue ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="background:#0d0a1a;border-left:2px solid #a78bfa;padding:12px 16px;border-radius:0 8px 8px 0;">
      <div style="font-size:9px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Your between-point phrase</div>
      <p style="color:#d0c0ff;font-size:16px;font-weight:800;margin:0;font-style:italic;">"${plan.mental_cue}"</p>
      <p style="color:#444;font-size:11px;margin:6px 0 0;line-height:1.5;">Repeat this to yourself every time you walk back to the baseline. Build the routine in practice so it is automatic in matches.</p>
    </div>
  </td></tr>` : ""}

  <!-- Drills section -->
  ${drillsHtml ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="font-size:9px;color:#1D9E75;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:14px;">This week's training prescription</div>
    ${drillsHtml}
  </td></tr>` : ""}

  <!-- Match rule -->
  ${plan.match_focus ? `
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;">
    <div style="background:#091400;border:1px solid #162100;border-radius:10px;padding:16px 18px;">
      <div style="font-size:9px;color:#1D9E75;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:8px;">Match rule this week</div>
      <p style="color:#ccc;font-size:15px;font-weight:700;margin:0;line-height:1.5;">${plan.match_focus}</p>
      <p style="color:#333;font-size:11px;margin:8px 0 0;line-height:1.5;">One rule simple enough to hold in mind during a match point. Do not try to remember the entire report — just this rule.</p>
    </div>
  </td></tr>` : ""}

  <!-- CTA -->
  <tr><td style="background:#0a0a0a;padding:20px 28px;border-bottom:1px solid #1a1a1a;text-align:center;">
    <a href="https://fortyfifteen.app" style="display:inline-block;background:#1D9E75;color:#060606;border-radius:10px;padding:13px 32px;font-weight:900;font-size:14px;text-decoration:none;letter-spacing:0.01em;">Analyze another match →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#080808;border-radius:0 0 16px 16px;padding:20px 28px;text-align:center;">
    <p style="color:#333;font-size:12px;margin:0 0 6px;line-height:1.6;">You received this because you analyzed a match on Forty Fifteen. We will never send spam.</p>
    <p style="color:#2a2a2a;font-size:11px;margin:0;">Made in Canada 🍁 by a Tennis Canada certified Club Pro</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Forty Fifteen <coach@fortyfifteen.app>",
        to: [email],
        subject: `Your Forty Fifteen coaching report is ready, ${firstName} 🎾`,
        html,
      }),
    });
    const data = await res.json();
    console.log("Resend:", JSON.stringify(data).slice(0, 200));
  } catch (err) {
    console.error("Resend error:", err.message);
  }
}
