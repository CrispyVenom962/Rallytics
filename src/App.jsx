import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/analyze";
const FRAME_INTERVAL = 30;
const FRAME_W = 640;
const FRAME_H = 360;
const FRAME_QUALITY = 0.72;
const MAX_FRAMES = 40;

const TENNIS_FACTS = [
  "60% of club coaches say late contact point is the single most damaging habit they see — it forces arm-only swings and kills consistency.",
  "Research shows 73% of club-level unforced errors trace back to just 2–3 recurring habits. The same mistake, disguised in different shots.",
  "Elite coaches spend 60% of film review time on positioning and recovery — not stroke mechanics. Where you are matters more than what you do.",
  "The average 3.5–4.0 player makes contact 15–20cm behind the ideal contact point on their forehand — the root cause of most topspin problems.",
  "Players who receive written coaching feedback retain 40% more of the advice after one week compared to verbal-only feedback.",
  "On clay, the average rally at club level is 5–7 shots. On hard courts, it drops to 3–4. Your surface changes everything about shot selection.",
  "The kinetic chain — ground to racket — takes 0.08 seconds to fire. One broken link in that chain can cost you 20–30% of racket speed.",
  "Top-ranked juniors watch an average of 45 minutes of their own match footage per week. Most club players watch zero.",
  "Split step timing is the most undercoached skill in recreational tennis. Players who master it cover 30% more court with the same fitness.",
  "A 5cm shift in toss position changes a flat serve into a kick serve. Toss position is the most diagnostic tell in serve analysis.",
];

function extractFrames(file, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    canvas.width = FRAME_W; canvas.height = FRAME_H;
    const ctx = canvas.getContext("2d");
    const url = URL.createObjectURL(file);
    video.src = url; video.muted = true; video.playsInline = true;
    video.addEventListener("loadedmetadata", () => {
      const dur = video.duration;
      const times = [];
      for (let t = 2; t < dur - 2; t += FRAME_INTERVAL) {
        times.push(parseFloat(t.toFixed(1)));
        if (times.length >= MAX_FRAMES) break;
      }
      if (dur > 10) times.push(parseFloat((dur - 3).toFixed(1)));
      const frames = []; let idx = 0;
      const grabNext = () => {
        if (idx >= times.length) { URL.revokeObjectURL(url); resolve(frames); return; }
        video.currentTime = times[idx];
      };
      video.addEventListener("seeked", () => {
        ctx.drawImage(video, 0, 0, FRAME_W, FRAME_H);
        frames.push({ base64: canvas.toDataURL("image/jpeg", FRAME_QUALITY).split(",")[1], timestamp: Math.round(times[idx]) });
        onProgress?.(idx + 1, times.length);
        idx++; grabNext();
      });
      grabNext();
    });
    video.addEventListener("error", () => reject(new Error("Could not load video.")));
  });
}

// ── Score Arc ──────────────────────────────────────────────────────────────────
const ScoreArc = ({ score, label, color }) => {
  const r = 44, c = 2 * Math.PI * r;
  const pct = score / 10;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#141414" strokeWidth="7"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}/>
        <text x="55" y="48" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900" fontFamily="Inter,sans-serif">{score}</text>
        <text x="55" y="68" textAnchor="middle" fill="#444" fontSize="11" fontFamily="Inter,sans-serif">/10</text>
      </svg>
      <div style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "2px" }}>{label}</div>
    </div>
  );
};

// ── Court Line Divider ─────────────────────────────────────────────────────────
const CourtLine = ({ color = "#1D9E75" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }}/>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
  </div>
);

// ── Section Label ──────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color = "#1D9E75", icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
    {icon && <span style={{ fontSize: "22px" }}>{icon}</span>}
    <span style={{ fontSize: "10px", color, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: "700" }}>{children}</span>
  </div>
);

// ── Expand Panel ───────────────────────────────────────────────────────────────
const Panel = ({ title, badge, accent = "#1D9E75", children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${open ? accent + "30" : "#1a1a1a"}`, transition: "border-color 0.2s" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: open ? "#0e0e0e" : "#0a0a0a",
        border: "none", cursor: "pointer", padding: "16px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left",
        transition: "background 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {badge && <div style={{ width: "4px", height: "36px", borderRadius: "2px", background: accent, flexShrink: 0 }}/>}
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#e8e8e8", lineHeight: "1.4" }}>{title}</span>
        </div>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          border: `1px solid ${open ? accent : "#2a2a2a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? accent : "#444", fontSize: "16px", flexShrink: 0,
          transition: "all 0.2s",
        }}>
          {open ? "−" : "+"}
        </div>
      </button>
      {open && (
        <div style={{ background: "#0a0a0a", padding: "0 18px 18px", borderTop: "1px solid #141414" }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ── Info Block ─────────────────────────────────────────────────────────────────
const Block = ({ label, value, glow }) => (
  <div style={{
    background: glow ? "#0b150b" : "#0e0e0e",
    border: `1px solid ${glow ? "#1e3d1e" : "#181818"}`,
    borderRadius: "8px", padding: "12px 14px", marginBottom: "8px",
  }}>
    <div style={{ fontSize: "9px", color: glow ? "#5bc85b" : "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px" }}>{label}</div>
    <p style={{ margin: 0, fontSize: "13px", color: glow ? "#c8e8c8" : "#aaa", lineHeight: "1.7" }}>{value}</p>
  </div>
);

// ── Film Guide Card ────────────────────────────────────────────────────────────
const FilmCard = ({ emoji, title, body }) => (
  <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: "12px", padding: "18px" }}>
    <div style={{ fontSize: "32px", marginBottom: "10px" }}>{emoji}</div>
    <div style={{ fontSize: "13px", fontWeight: "800", color: "#e8e8e8", marginBottom: "6px", letterSpacing: "-0.01em" }}>{title}</div>
    <div style={{ fontSize: "12px", color: "#444", lineHeight: "1.7" }}>{body}</div>
  </div>
);

// ── Logo SVG ───────────────────────────────────────────────────────────────────
const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="52" fill="none" stroke="#1D9E75" strokeWidth="3"/>
    <circle cx="80" cy="80" r="38" fill="#1D9E75"/>
    <path d="M 52 58 A 32 32 0 0 1 108 58" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <line x1="52" y1="102" x2="108" y2="102" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    <line x1="80" y1="58" x2="80" y2="102" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="96" cy="72" r="5" fill="#ffffff"/>
  </svg>
);

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [context, setContext] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState("technique");
  const [pct, setPct] = useState(0);
  const [framesDone, setFramesDone] = useState(0);
  const [framesTotal, setFramesTotal] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusPhase, setStatusPhase] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  // Email gate
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [gateError, setGateError] = useState("");
  const fileRef = useRef();
  const factTimer = useRef(null);

  const fmt = s => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const estFrames = d => Math.min(MAX_FRAMES, Math.floor(Math.max(0, d - 4) / FRAME_INTERVAL) + 1);

  // Rotate facts every 6 seconds during analysis
  useEffect(() => {
    if (stage === "working") {
      setFactIndex(Math.floor(Math.random() * TENNIS_FACTS.length));
      factTimer.current = setInterval(() => {
        setFactIndex(i => (i + 1) % TENNIS_FACTS.length);
      }, 6000);
    } else {
      clearInterval(factTimer.current);
    }
    return () => clearInterval(factTimer.current);
  }, [stage]);

  const handleFile = f => {
    if (!f?.type.startsWith("video/")) { setError("Please upload a video file — MP4 or MOV works best."); return; }
    setError(null); setVideoFile(f); setVideoUrl(URL.createObjectURL(f)); setStage("context");
  };

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);

  const proceedToGate = () => { setGateError(""); setStage("gate"); };

  const proceedToAnalysis = () => {
    if (!firstName.trim()) { setGateError("Please enter your first name."); return; }
    if (!email.trim() || !email.includes("@")) { setGateError("Please enter a valid email address."); return; }
    if (!level) { setGateError("Please select your playing level."); return; }
    setGateError("");
    analyze();
  };

  const analyze = async () => {
    setStage("working"); setPct(0); setError(null); setFramesDone(0); setStatusPhase(0);

    // Phases with messages
    const phases = [
      "Extracting frames from your video…",
      "Sampling key moments across the match…",
      "Sending frames to your AI coach…",
      "Reading your technique patterns…",
      "Analyzing forehand & backhand mechanics…",
      "Checking serve mechanics and footwork…",
      "Identifying tactical habits…",
      "Cross-referencing pattern clusters…",
      "Writing your priority fixes…",
      "Building your coaching report…",
      "Final review — almost there…",
    ];

    let aiTimer = null;
    try {
      setStatusMsg(phases[0]);
      setStatusPhase(0);

      const frames = await extractFrames(videoFile, (done, total) => {
        setFramesDone(done);
        setFramesTotal(total);
        const extractPct = Math.round((done / total) * 55);
        setPct(extractPct);
        if (done < total * 0.3) setStatusMsg(phases[0]);
        else if (done < total * 0.7) setStatusMsg(phases[1]);
        else setStatusMsg(phases[2]);
      });

      setFramesDone(frames.length);
      setStatusMsg(phases[2]);
      setPct(58);

      // Animated AI phase — steps from 60 → 97
      const aiSteps = [
        { at: 60, msg: phases[3], phase: 3 },
        { at: 67, msg: phases[4], phase: 4 },
        { at: 73, msg: phases[5], phase: 5 },
        { at: 79, msg: phases[6], phase: 6 },
        { at: 84, msg: phases[7], phase: 7 },
        { at: 88, msg: phases[8], phase: 8 },
        { at: 92, msg: phases[9], phase: 9 },
        { at: 95, msg: phases[10], phase: 10 },
      ];

      let currentPct = 58;
      aiTimer = setInterval(() => {
        currentPct = Math.min(97, currentPct + 1);
        setPct(currentPct);
        const step = aiSteps.findLast(s => currentPct >= s.at);
        if (step) { setStatusMsg(step.msg); setStatusPhase(step.phase); }
        if (currentPct >= 97) clearInterval(aiTimer);
      }, 900);

      const dLabel = duration > 60 ? `${Math.round(duration / 60)}-minute` : `${Math.round(duration)}-second`;
      const res = await fetch(API_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: frames.map(f => f.base64),
          context: context.trim(), playerId: playerId.trim(),
          frameCount: frames.length, durationLabel: dLabel,
          firstName: firstName.trim(), email: email.trim(), level,
        }),
      });

      clearInterval(aiTimer);
      setPct(100);
      setStatusMsg("Your report is ready!");


      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        if (e.error === "EMAIL_LIMIT_REACHED") {
          if (aiTimer) clearInterval(aiTimer);
          setStage("gate");
          setGateError(e.message || "You have already used your 2 free analyses. Join the Pro waitlist.");
          return;
        }
        throw new Error(e.message || e.error || `Error ${res.status}`);
      }



      setResult(await res.json());
      setStage("result");
    } catch (e) {
      if (aiTimer) clearInterval(aiTimer);
      setError(e.message || "Analysis failed. Try again."); setStage("context");
    }
  };

  const reset = () => {
    setStage("upload"); setVideoFile(null); setVideoUrl(null); setContext(""); setPlayerId("");
    setResult(null); setError(null); setPct(0); setFramesDone(0); setFramesTotal(0);
    setDuration(0); setTab("technique"); setFirstName(""); setEmail(""); setLevel(""); setGateError("");
  };

  const lc = l => !l ? "#888" : l.includes("Beginner") ? "#5bc85b" : l.includes("Developing") ? "#a3e635" : l.includes("Intermediate") ? "#f5c842" : "#f97316";

  // Analysis bars keyed to phase
  const analysisBars = [
    { label: "Forehand mechanics", color: "#60a5fa", activePhase: 4, donePhase: 6 },
    { label: "Backhand mechanics", color: "#60a5fa", activePhase: 4, donePhase: 6 },
    { label: "Serve & footwork", color: "#f59e0b", activePhase: 5, donePhase: 7 },
    { label: "Tactical patterns", color: "#f59e0b", activePhase: 6, donePhase: 8 },
    { label: "Building your report", color: "#a78bfa", activePhase: 8, donePhase: 11 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060606", fontFamily: "'Inter','Helvetica Neue',sans-serif", color: "#f0f0f0" }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        button:focus-visible { outline: 2px solid #1D9E75; outline-offset: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes courtScan { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes factFade { 0%{opacity:0;transform:translateY(6px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        ::placeholder { color: #282828; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,6,6,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111", padding: "0 24px", height: "58px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div onClick={reset} style={{ display: "flex", alignItems: "center", gap: "11px", cursor: "pointer" }}>
          <Logo size={36} />
          <span style={{ fontWeight: "900", fontSize: "17px", letterSpacing: "-0.03em" }}>
            forty<span style={{ color: "#1D9E75" }}>.</span><span style={{ color: "#1D9E75", fontWeight: "300" }}>fifteen</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {!["upload", "working"].includes(stage) && (
            <button onClick={reset} style={{
              background: "none", border: "1px solid #1e1e1e", borderRadius: "8px",
              color: "#555", fontSize: "12px", padding: "7px 16px", cursor: "pointer",
              letterSpacing: "0.04em", transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#1D9E75"; e.currentTarget.style.color = "#1D9E75"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#555"; }}
            >
              ← New match
            </button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* ══════════════════ UPLOAD ══════════════════ */}
        {stage === "upload" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Hero */}
            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1D9E75", boxShadow: "0 0 10px #1D9E75" }}/>
                <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em" }}>AI Match Analysis</span>

              </div>
              <h1 style={{ fontSize: "clamp(36px,8vw,64px)", fontWeight: "900", letterSpacing: "-0.035em", lineHeight: 0.95, margin: "0 0 20px" }}>
                Your game<br />is leaking points.<br /><span style={{ color: "#1D9E75" }}>Find out where.</span>
              </h1>
              <p style={{ color: "#3a3a3a", fontSize: "15px", lineHeight: "1.7", maxWidth: "340px", margin: 0 }}>
                See your game the way your coach does. Upload your match video and get a full coaching report — technique, tactics, drills, and on-court cues.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#1D9E75" : "#1c1c1c"}`,
                borderRadius: "20px", padding: "64px 24px 56px", textAlign: "center",
                cursor: "pointer",
                background: dragging ? "#071a12" : "#080808",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(29,158,117,0.06), rgba(29,158,117,0.15), rgba(29,158,117,0.06), transparent)", animation: "courtScan 2.5s linear infinite", pointerEvents: "none" }}/>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #1D9E75, transparent)", animation: "courtScan 2.5s linear infinite", opacity: 0.6 }}/>
              <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>🎾</div>
              <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                Film doesn't lie. Neither does your technique.
              </div>
              <div style={{ color: "#2e2e2e", fontSize: "13px", marginBottom: "6px" }}>
                Technique. Tactics. Patterns. All in one report.
              </div>
              <div style={{ color: "#1e1e1e", fontSize: "11px", marginBottom: "28px" }}>
                MP4 or MOV · any file size · no account needed
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1D9E75", color: "#060606", borderRadius: "10px", padding: "13px 32px", fontWeight: "900", fontSize: "14px", letterSpacing: "0.02em" }}>
                <span style={{ fontSize: "16px" }}>↑</span> Choose video
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {error && (
              <div style={{ marginTop: "16px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                ⚠ {error}
              </div>
            )}

            {/* Free beta urgency strip */}
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", background: "#1D9E7508", border: "1px solid #1D9E7518", borderRadius: "10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
              <span style={{ fontSize: "11px", color: "#1D9E75", letterSpacing: "0.06em" }}>
                Free during beta · 2 analyses per email · No credit card
              </span>
            </div>

            <CourtLine />

            {/* How to film */}
            <SectionLabel icon="🎥" color="#1D9E75">How to film for best results</SectionLabel>
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Choose your focus before filming</div>
              <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.7" }}>
                One phone cannot perfectly capture everything at once. Decide what you want to improve — then film accordingly for the most accurate analysis.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <FilmCard emoji="🎾" title="For technique analysis" body="Film from the SIDE at mid-court, zoomed in to show waist-up. This gives the AI a clear view of your swing shape, contact point, hip rotation, and follow-through on every shot." />
              <FilmCard emoji="📷" title="For tactical analysis" body="Film from BEHIND the baseline, wide angle showing the full court. Best for reading court positioning, recovery habits, net approach patterns, and rally tendencies." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "32px" }}>
              <FilmCard emoji="📐" title="Camera height & angle" body="Place phone at 1–1.5 metres high. Use a tripod, lean against a fence post, or ask someone to hold it steady. Slight downward angle. Keep the phone still — shaky video reduces accuracy." />
              <FilmCard emoji="⏱️" title="Length & format" body="10–20 minutes of real play. iPhone: Settings → Camera → Formats → Most Compatible (MP4). Android: standard video mode. No slow-mo, no portrait mode. Any file size works." />
            </div>

            <CourtLine />

            {/* How it works */}
            <SectionLabel icon="🔬" color="#1D9E75">How the analysis works</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
              {[
                { n: "01", h: "Frame sampling", b: "1 frame every 30 seconds. Finds habits across your full match, not just one shot." },
                { n: "02", h: "Technique breakdown", b: "Contact point, follow-through, unit turn, footwork — per shot type, with the chain reaction explained." },
                { n: "03", h: "Tactical read", b: "Short ball response, net approach, rally patterns, positioning — the tactical habits costing you games." },
              ].map(c => (
                <div key={c.n} style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "20px 16px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: "#1e1e1e", marginBottom: "8px", letterSpacing: "-0.02em" }}>{c.n}</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#ccc", marginBottom: "6px" }}>{c.h}</div>
                  <div style={{ fontSize: "11px", color: "#333", lineHeight: "1.6" }}>{c.b}</div>
                </div>
              ))}
            </div>

            {/* Trust line */}
            <div style={{ marginTop: "28px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#2a2a2a", lineHeight: "1.8" }}>Made in Canada 🍁 by a Tennis Canada certified Club Pro</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#1e1e1e", lineHeight: "1.6", fontStyle: "italic" }}>who got tired of guessing what was wrong with his game.</p>
            </div>
          </div>
        )}

        {/* ══════════════════ CONTEXT ══════════════════ */}
        {stage === "context" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5bc85b", boxShadow: "0 0 10px #5bc85b" }}/>
                <span style={{ fontSize: "10px", color: "#5bc85b", textTransform: "uppercase", letterSpacing: "0.2em" }}>Video loaded</span>
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", margin: "0 0 6px" }}>Anything I should know?</h2>
              <p style={{ color: "#3a3a3a", fontSize: "13px", margin: 0 }}>Optional — specific context means sharper, more targeted feedback.</p>
            </div>

            <video src={videoUrl} controls playsInline
              style={{ width: "100%", borderRadius: "14px", background: "#000", maxHeight: "240px", objectFit: "contain", marginBottom: "16px" }}
              onLoadedMetadata={e => setDuration(e.target.duration)} />

            {duration > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "16px" }}>
                {[
                  { l: "Video length", v: fmt(duration) },
                  { l: "Frames to extract", v: `~${estFrames(duration)}` },
                  { l: "Data sent to AI", v: `~${estFrames(duration) * 40}KB` },
                ].map(s => (
                  <div key={s.l} style={{ background: "#080808", border: "1px solid #141414", borderRadius: "10px", padding: "12px 14px" }}>
                    <div style={{ fontSize: "9px", color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>{s.l}</div>
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#1D9E75", letterSpacing: "-0.02em" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>Which player should I analyze?</div>
              <input value={playerId} onChange={e => setPlayerId(e.target.value)}
                placeholder="e.g. Red shirt, black shorts, far side of the court — leave blank if it's only you in the video"
                style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "13px 16px", color: "#f0f0f0", fontSize: "14px", lineHeight: "1.5", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#1D9E75"}
                onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
            </div>

            <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
              Anything else I should know? <span style={{ color: "#2a2a2a" }}>(optional)</span>
            </div>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. My backhand keeps going wide under pressure. Playing against a big server. Focus on my serve and net approach."
              style={{ width: "100%", minHeight: "80px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "14px", lineHeight: "1.7", resize: "vertical", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#1D9E75"}
              onBlur={e => e.target.style.borderColor = "#1a1a1a"} />

            {error && (
              <div style={{ marginTop: "12px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>⚠ {error}</div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={reset} style={{ flex: 1, background: "none", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#3a3a3a", fontSize: "14px", padding: "14px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                ← Change video
              </button>
              <button onClick={proceedToGate} style={{ flex: 3, background: "#1D9E75", border: "none", borderRadius: "10px", color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Get my coaching report →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════ EMAIL GATE ══════════════════ */}
        {stage === "gate" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1D9E75", boxShadow: "0 0 10px #1D9E75" }}/>
                <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em" }}>Almost there</span>
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", margin: "0 0 8px" }}>Where should we send your report?</h2>
              <p style={{ color: "#3a3a3a", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                Your full coaching report will be emailed to you so you can reference it on court. No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Free analyses counter on gate */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", padding: "12px 16px", background: "#1D9E7508", border: "1px solid #1D9E7518", borderRadius: "10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
              <span style={{ fontSize: "11px", color: "#1D9E75" }}>
                Free during beta — <strong style={{ color: "#1D9E75" }}>2 analyses per email</strong> included
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>First name</div>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. William"
                  style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#1D9E75"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>Email address</div>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="e.g. you@gmail.com"
                  style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#1D9E75"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Your playing level</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                  {[
                    { id: "beginner", label: "Beginner", sub: "Just starting out" },
                    { id: "intermediate", label: "Intermediate", sub: "Club / league player" },
                    { id: "advanced", label: "Advanced", sub: "Competitive / tournament" },
                  ].map(l => (
                    <button key={l.id} onClick={() => setLevel(l.id)} style={{
                      background: level === l.id ? "#1D9E75" : "#080808",
                      border: `1px solid ${level === l.id ? "#1D9E75" : "#1a1a1a"}`,
                      borderRadius: "10px", padding: "14px 10px", cursor: "pointer", textAlign: "center", transition: "all 0.18s",
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: level === l.id ? "#060606" : "#888", marginBottom: "3px" }}>{l.label}</div>
                      <div style={{ fontSize: "10px", color: level === l.id ? "#333" : "#2a2a2a" }}>{l.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {gateError && (
              <div style={{ marginTop: "14px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                ⚠ {gateError}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "16px", padding: "12px 14px", background: "#080808", border: "1px solid #111", borderRadius: "10px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🔒</span>
              <p style={{ margin: 0, fontSize: "12px", color: "#2e2e2e", lineHeight: "1.6" }}>
                Your email is used only to send your coaching report. We will never share your data or send unsolicited emails.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setStage("context")} style={{ flex: 1, background: "none", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#3a3a3a", fontSize: "14px", padding: "14px", cursor: "pointer" }}>
                ← Back
              </button>
              <button onClick={proceedToAnalysis} style={{ flex: 3, background: "#1D9E75", border: "none", borderRadius: "10px", color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Analyze my match →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════ WORKING ══════════════════ */}
        {stage === "working" && (
          <div style={{ animation: "fadeUp 0.3s ease", paddingTop: "10px" }}>
            <style>{`
              @keyframes barPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
              @keyframes ballBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
              @keyframes factSlide { 0%{opacity:0;transform:translateY(8px)} 12%{opacity:1;transform:translateY(0)} 88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
            `}</style>

            {/* Bouncing ball */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "52px", display: "inline-block", animation: "ballBounce 1s ease-in-out infinite" }}>🎾</div>
            </div>

            {/* Phase + status */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.2s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em" }}>Analyzing</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em", margin: "0 0 8px", minHeight: "32px" }}>
                {statusMsg}
              </h2>
              {/* Frame counter */}
              {framesTotal > 0 && pct < 60 && (
                <div style={{ fontSize: "12px", color: "#2a2a2a", marginBottom: "4px" }}>
                  Frame {framesDone} of {framesTotal} extracted
                </div>
              )}
              {pct >= 60 && pct < 100 && (
                <div style={{ fontSize: "12px", color: "#2a2a2a" }}>
                  {framesTotal > 0 ? `${framesTotal} frames` : "Frames"} sent · Claude is reading your match
                </div>
              )}
              <p style={{ color: "#1e1e1e", fontSize: "12px", margin: "6px 0 0" }}>Do not close this tab — your report is being built</p>
            </div>

            {/* Main progress bar */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overall progress</span>
                <span style={{ fontSize: "13px", color: "#1D9E75", fontWeight: "700" }}>{Math.round(pct)}%</span>
              </div>
              <div style={{ background: "#0e0e0e", borderRadius: "8px", height: "10px", overflow: "hidden", position: "relative" }}>
                <div style={{
                  height: "100%",
                  background: pct === 100 ? "#1D9E75" : "linear-gradient(90deg, #1D9E75, #a8df00)",
                  borderRadius: "8px", width: `${pct}%`,
                  transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                  boxShadow: pct > 0 && pct < 100 ? "0 0 14px #1D9E7566" : "none",
                  position: "relative",
                }}>
                  {/* Shimmer on active bar */}
                  {pct > 5 && pct < 98 && (
                    <div style={{
                      position: "absolute", top: 0, right: 0, width: "40px", height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                      borderRadius: "8px",
                    }}/>
                  )}
                </div>
              </div>
            </div>

            {/* Per-analysis bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
              {analysisBars.map((item, i) => {
                const isActive = statusPhase >= item.activePhase;
                const isDone = statusPhase >= item.donePhase;
                const barPct = isDone ? 100 : isActive ? Math.min(95, ((pct - 60) / 37) * 100) : 0;
                return (
                  <div key={i} style={{ opacity: isActive ? 1 : 0.18, transition: "opacity 0.6s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: isActive ? "#666" : "#222", letterSpacing: "0.02em" }}>{item.label}</span>
                      {isDone
                        ? <span style={{ fontSize: "10px", color: "#5bc85b", fontWeight: "700" }}>✓ done</span>
                        : isActive
                          ? <span style={{ fontSize: "10px", color: item.color, animation: "barPulse 1.5s infinite" }}>scanning…</span>
                          : null
                      }
                    </div>
                    <div style={{ background: "#0e0e0e", borderRadius: "4px", height: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", background: item.color,
                        borderRadius: "4px", width: `${barPct}%`,
                        transition: "width 1s ease",
                        boxShadow: barPct > 0 && !isDone ? `0 0 8px ${item.color}55` : "none",
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rotating fact card */}
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "14px", padding: "20px 22px", minHeight: "100px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#1D9E75" }}/>
                Did you know · {factIndex + 1}/{TENNIS_FACTS.length}
              </div>
              <p key={factIndex} style={{
                margin: 0, fontSize: "13px", color: "#3a3a3a", lineHeight: "1.75",
                animation: "factSlide 6s ease forwards",
              }}>
                {TENNIS_FACTS[factIndex]}
              </p>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: "4px", marginTop: "14px" }}>
                {TENNIS_FACTS.map((_, i) => (
                  <div key={i} style={{
                    width: i === factIndex ? "16px" : "4px", height: "4px",
                    borderRadius: "2px",
                    background: i === factIndex ? "#1D9E75" : "#1a1a1a",
                    transition: "all 0.4s ease",
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ RESULT ══════════════════ */}
        {stage === "result" && result && (() => {
          const tech = result.technique || {};
          const strat = result.strategy || {};
          const lcolor = lc(result.player_level);

          return (
            <div style={{ animation: "fadeUp 0.4s ease" }}>

              {/* ── Header ── */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: lcolor, boxShadow: `0 0 10px ${lcolor}` }}/>
                  <span style={{ fontSize: "10px", color: lcolor, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    {result.frames_analyzed || framesTotal} frames · {fmt(duration)}
                  </span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: lcolor + "14", border: `1px solid ${lcolor}30`, borderRadius: "8px", padding: "6px 16px", marginBottom: "20px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: lcolor }}/>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: lcolor, letterSpacing: "0.04em" }}>{result.player_level}</span>
                </div>
                <p style={{ fontSize: "15px", color: "#888", lineHeight: "1.75", margin: "0 0 20px", maxWidth: "580px" }}>
                  {result.match_overview}
                </p>
                <div style={{ display: "flex", gap: "28px", marginBottom: "20px" }}>
                  <ScoreArc score={tech.score || 5} label="Technique" color="#60a5fa" />
                  <ScoreArc score={strat.score || 5} label="Strategy" color="#f59e0b" />
                </div>
                {result.coach_verdict && (
                  <div style={{ background: "#080808", borderLeft: "3px solid #1D9E75", borderRadius: "0 10px 10px 0", padding: "16px 20px" }}>
                    <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>Coach verdict</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#777", fontStyle: "italic", lineHeight: "1.65" }}>"{result.coach_verdict}"</p>
                  </div>
                )}
              </div>

              <CourtLine />

              {/* ── Priority Fixes ── */}
              {result.priority_fixes?.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <SectionLabel icon="⚡" color="#1D9E75">Top 3 fixes</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {result.priority_fixes.map(p => (
                      <div key={p.rank} style={{
                        background: p.rank === 1 ? "#0b1300" : "#080808",
                        border: `1px solid ${p.rank === 1 ? "#1e3300" : "#111"}`,
                        borderRadius: "12px", padding: "16px 18px",
                        display: "flex", gap: "16px", alignItems: "flex-start",
                      }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                          background: p.rank === 1 ? "#1D9E75" : "#0e0e0e",
                          color: p.rank === 1 ? "#060606" : "#2e2e2e",
                          border: `1px solid ${p.rank === 1 ? "#1D9E75" : "#1a1a1a"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: "900",
                        }}>{p.rank}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#e0e0e0", marginBottom: "4px", lineHeight: "1.4" }}>{p.fix}</div>
                          {p.why && <div style={{ fontSize: "12px", color: "#3a3a3a", marginBottom: p.on_court_cue ? "8px" : 0 }}>{p.why}</div>}
                          {p.on_court_cue && (
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "8px 12px", display: "inline-block" }}>
                              <span style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em" }}>Say on court: </span>
                              <span style={{ fontSize: "12px", color: "#1D9E75", fontStyle: "italic", fontWeight: "600" }}>"{p.on_court_cue}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CourtLine />

              {/* ── Tabs ── */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                {[
                  { id: "technique", label: "Technique", icon: "🎯" },
                  { id: "strategy", label: "Strategy", icon: "🧠" },
                  { id: "training", label: "Training", icon: "🏋️" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, padding: "12px 8px",
                    background: tab === t.id ? "#1D9E75" : "#080808",
                    border: `1px solid ${tab === t.id ? "#1D9E75" : "#141414"}`,
                    borderRadius: "10px",
                    color: tab === t.id ? "#060606" : "#333",
                    fontSize: "12px", fontWeight: "800", cursor: "pointer",
                    transition: "all 0.18s", letterSpacing: "0.02em",
                  }}>
                    <span style={{ fontSize: "16px", display: "block", marginBottom: "3px" }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Technique ── */}
              {tab === "technique" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  {tech.strengths?.length > 0 && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel color="#5bc85b">What's working</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {tech.strengths.map((s, i) => (
                          <div key={i} style={{ background: "#0b180b", border: "1px solid #1a3a1a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>✓ {s}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tech.shot_breakdown && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="🎾" color="#60a5fa">Shot-by-shot breakdown</SectionLabel>
                      {Object.entries(tech.shot_breakdown).map(([k, v]) => (
                        <Block key={k} label={k.replace(/_/g, " ")} value={v} />
                      ))}
                    </div>
                  )}
                  {tech.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#1D9E75">Recurring patterns</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {tech.patterns.map((p, i) => (
                          <Panel key={i} title={p.pattern} badge accent="#60a5fa">
                            <div style={{ paddingTop: "14px" }}>
                              {p.frequency && <div style={{ fontSize: "11px", color: "#2e2e2e", marginBottom: "12px" }}>{p.frequency}</div>}
                              <Block label="What I see" value={p.what_it_looks_like} />
                              {p.root_cause && <Block label="Root cause" value={p.root_cause} />}
                              <Block label="Impact" value={p.impact} />
                              <Block label="The fix" value={p.fix} glow />
                              {p.drill && <Block label="Drill" value={p.drill} />}
                            </div>
                          </Panel>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Strategy ── */}
              {tab === "strategy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  {strat.headline && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <div style={{ fontSize: "9px", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>Playing style</div>
                      <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em" }}>{strat.headline}</div>
                    </div>
                  )}
                  {strat.strengths?.length > 0 && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel color="#5bc85b">What's working</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {strat.strengths.map((s, i) => (
                          <div key={i} style={{ background: "#0b180b", border: "1px solid #1a3a1a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>✓ {s}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strat.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#1D9E75">Tactical patterns</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {strat.patterns.map((p, i) => (
                          <Panel key={i} title={p.pattern} badge accent="#f59e0b">
                            <div style={{ paddingTop: "14px" }}>
                              {p.frequency && <div style={{ fontSize: "11px", color: "#2e2e2e", marginBottom: "12px" }}>{p.frequency}</div>}
                              <Block label="What I see" value={p.what_it_looks_like} />
                              <Block label="Impact" value={p.impact} />
                              <Block label="Fix" value={p.fix} glow />
                            </div>
                          </Panel>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Training ── */}
              {tab === "training" && result.training_plan && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                    <SectionLabel icon="📅" color="#a78bfa">This week</SectionLabel>
                    <p style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#e0e0e0", lineHeight: "1.5", letterSpacing: "-0.01em" }}>
                      {result.training_plan.this_week}
                    </p>
                    {result.training_plan.match_focus && (
                      <div style={{ background: "#0a1100", border: "1px solid #1a2500", borderRadius: "8px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>Match rule</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#bbb", lineHeight: "1.65" }}>{result.training_plan.match_focus}</p>
                      </div>
                    )}
                  </div>
                  {result.priority_fixes?.some(p => p.on_court_cue) && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="💬" color="#1D9E75">On-court cues</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {result.priority_fixes.filter(p => p.on_court_cue).map(p => (
                          <div key={p.rank} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                              background: p.rank === 1 ? "#1D9E75" : "#0e0e0e",
                              color: p.rank === 1 ? "#060606" : "#333",
                              border: `1px solid ${p.rank === 1 ? "#1D9E75" : "#1a1a1a"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px", fontWeight: "900",
                            }}>{p.rank}</div>
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 14px", flex: 1 }}>
                              <p style={{ margin: 0, fontSize: "14px", color: "#1D9E75", fontStyle: "italic", fontWeight: "700" }}>"{p.on_court_cue}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {[result.training_plan.drill_1, result.training_plan.drill_2].filter(Boolean).map((drill, i) => (
                    <Panel key={i} title={drill.name} badge accent="#a78bfa">
                      <div style={{ paddingTop: "14px" }}>
                        {drill.targets && <div style={{ fontSize: "11px", color: "#a78bfa", marginBottom: "12px" }}>{drill.targets}</div>}
                        <Block label="Setup" value={drill.setup} />
                        <Block label="How to do it" value={drill.execution} />
                        <Block label="Volume" value={drill.reps} />
                        <Block label="You're doing it right when…" value={drill.success_marker} glow />
                      </div>
                    </Panel>
                  ))}
                </div>
              )}

              {/* ── Beta banner ── */}
              <div style={{ marginTop: "32px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "24px 20px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1D9E7518", border: "1px solid #1D9E7530", borderRadius: "20px", padding: "4px 14px", marginBottom: "12px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
                  <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em" }}>Free Beta</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "800", color: "#e0e0e0", letterSpacing: "-0.01em" }}>
                  Forty Fifteen is free during beta.
                </p>
                <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#2a2a2a" }}>
                  Each email gets 2 free analyses. Pro is coming with unlimited access.
                </p>
                <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#3a3a3a", lineHeight: "1.6" }}>
                  Pro features: unlimited analyses, session history, progress tracking, and coach sharing.
                </p>
                <a href="https://tally.so/r/RG2pGj"
                  style={{ display: "inline-block", background: "#1D9E75", color: "#060606", borderRadius: "10px", padding: "12px 28px", fontWeight: "900", fontSize: "14px", textDecoration: "none", letterSpacing: "0.01em" }}>
                  Join the Pro waitlist →
                </a>
                <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#222" }}>No spam. Just one email when Pro launches.</p>
              </div>

            </div>
          );
        })()}
      </main>
    </div>
  );
}
