import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/analyze";

// ── Scroll Fade-In Component ───────────────────────────────────────────────────
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

const FRAME_INTERVAL = 5;
const FRAME_W = 640;
const FRAME_H = 360;
const FRAME_QUALITY = 0.72;
const MAX_FRAMES = 60;

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
const CourtLine = ({ color = "#3b82f6" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }}/>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
  </div>
);

// ── Section Label ──────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color = "#3b82f6", icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
    {icon && <span style={{ fontSize: "22px" }}>{icon}</span>}
    <span style={{ fontSize: "10px", color, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: "700" }}>{children}</span>
  </div>
);

// ── Expand Panel ───────────────────────────────────────────────────────────────
const Panel = ({ title, badge, accent = "#3b82f6", children }) => {
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
    background: glow ? "#080e1f" : "#0e0e0e",
    border: `1px solid ${glow ? "#1e3d1e" : "#181818"}`,
    borderRadius: "8px", padding: "12px 14px", marginBottom: "8px",
  }}>
    <div style={{ fontSize: "9px", color: glow ? "#5bc85b" : "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px" }}>{label}</div>
    <p style={{ margin: 0, fontSize: "13px", color: glow ? "#c8e8c8" : "#aaa", lineHeight: "1.7" }}>{value}</p>
  </div>
);

// ── Shot Breakdown Renderer (handles both strings and nested objects) ──────────
const ShotBreakdown = ({ shotBreakdown }) => {
  if (!shotBreakdown) return null;
  return (
    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
      <SectionLabel icon="🎾" color="#60a5fa">Shot-by-shot breakdown</SectionLabel>
      {Object.entries(shotBreakdown).map(([k, v]) => {
        // String value (e.g. movement field)
        if (typeof v === "string") {
          return <Block key={k} label={k.replace(/_/g, " ")} value={v} />;
        }
        // Boolean value
        if (typeof v === "boolean") {
          return <Block key={k} label={k.replace(/_/g, " ")} value={v ? "Yes" : "No"} />;
        }
        // Nested object (e.g. forehand_topspin, serve, backhand_volley etc.)
        if (typeof v === "object" && v !== null) {
          const confidence = v.confidence || "";
          const framesStr = v.frames_seen !== undefined ? ` · ${v.frames_seen} frames seen` : "";
          // Skip if not seen
          if (confidence === "not_seen") return null;
          // Build display value from assessment + key fields
          const assessment = v.assessment || "";
          const keyFields = Object.entries(v)
            .filter(([fk, fv]) =>
              typeof fv === "string" &&
              fk !== "assessment" &&
              fk !== "confidence" &&
              fv !== "Not visible" &&
              fv !== "not_seen" &&
              fv !== "Unknown"
            )
            .map(([fk, fv]) => `${fk.replace(/_/g, " ")}: ${fv}`)
            .join(" · ");
          const displayVal = assessment
            ? `${assessment}${confidence ? ` (${confidence})` : ""}${framesStr}${keyFields ? " — " + keyFields : ""}`
            : keyFields
            ? `${keyFields}${framesStr}`
            : null;
          return displayVal
            ? <Block key={k} label={k.replace(/_/g, " ")} value={displayVal} />
            : null;
        }
        return null;
      })}
    </div>
  );
};

// ── Logo SVG ───────────────────────────────────────────────────────────────────
const Logo = ({ size = 36 }) => {
  const h = size * (68 / 56);
  return (
    <svg width={size} height={h} viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="56" height="68" rx="10" fill="#3b82f6"/>
      <rect x="5" y="5" width="46" height="58" fill="none" stroke="white" strokeWidth="1.2"/>
      <line x1="11" y1="5"  x2="11" y2="63" stroke="white" strokeWidth="0.8"/>
      <line x1="45" y1="5"  x2="45" y2="63" stroke="white" strokeWidth="0.8"/>
      <line x1="5"  y1="34" x2="51" y2="34" stroke="white" strokeWidth="2"/>
      <line x1="11" y1="18" x2="45" y2="18" stroke="white" strokeWidth="0.8"/>
      <line x1="11" y1="50" x2="45" y2="50" stroke="white" strokeWidth="0.8"/>
      <line x1="28" y1="18" x2="28" y2="50" stroke="white" strokeWidth="0.8"/>
      <line x1="28" y1="5"  x2="28" y2="9"  stroke="white" strokeWidth="0.8"/>
      <line x1="28" y1="59" x2="28" y2="63" stroke="white" strokeWidth="0.8"/>
    </svg>
  );
};

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
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [gateError, setGateError] = useState("");
  const [sessionType, setSessionType] = useState("match");
  const fileRef = useRef();
  const factTimer = useRef(null);
  const wakeLock = useRef(null);

  const fmt = s => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const estFrames = d => Math.min(MAX_FRAMES, Math.floor(Math.max(0, d - 4) / FRAME_INTERVAL) + 1);

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
    if (f.size > 2 * 1024 * 1024 * 1024) { setError("That file is bigger than Nadal's forehand — try recording in 720p or trimming to 20 minutes and try again."); return; }
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

    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      console.log('Wake lock not available:', e.message);
    }

    const phases = [
      "Extracting frames from your video…",
      "Sampling key moments across the match…",
      "Sending frames to your coaching engine…",
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
      const apiRes = await fetch(API_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: frames.map(f => f.base64),
          context: context.trim(), playerId: playerId.trim(),
          frameCount: frames.length, durationLabel: dLabel,
          firstName: firstName.trim(), email: email.trim(), level, sessionType,
        }),
      });

      clearInterval(aiTimer);
      setPct(100);
      setStatusMsg("Your report is ready!");

      if (!apiRes.ok) {
        const e = await apiRes.json().catch(() => ({}));
        if (e.error === "EMAIL_LIMIT_REACHED") {
          if (aiTimer) clearInterval(aiTimer);
          setStage("gate");
          setGateError(e.message || "You have already used your 2 free analyses. Join the Pro waitlist.");
          return;
        }
        throw new Error(e.message || e.error || `Error ${apiRes.status}`);
      }

      const data = await apiRes.json();
      setResult(data);
      setStage("result");
      if (wakeLock.current) { try { await wakeLock.current.release(); } catch(e) {} wakeLock.current = null; }
    } catch (e) {
      if (aiTimer) clearInterval(aiTimer);
      if (wakeLock.current) { try { await wakeLock.current.release(); } catch(err) {} wakeLock.current = null; }
      setError("ANALYSIS_ERROR"); setStage("context");
    }
  };

  const reset = () => {
    setStage("upload"); setVideoFile(null); setVideoUrl(null); setContext(""); setPlayerId("");
    setResult(null); setError(null); setPct(0); setFramesDone(0); setFramesTotal(0);
    setDuration(0); setTab("technique"); setFirstName(""); setEmail(""); setLevel(""); setGateError(""); setSessionType("match");
  };

  const lc = l => !l ? "#888" : l.includes("Beginner") ? "#5bc85b" : l.includes("Developing") ? "#a3e635" : l.includes("Intermediate") ? "#f5c842" : "#f97316";

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
        button:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes courtScan { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        @keyframes factFade { 0%{opacity:0;transform:translateY(6px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes ballSpin { 0%{transform:rotateY(0deg) rotateX(15deg)} 100%{transform:rotateY(360deg) rotateX(15deg)} }
        @keyframes ballFloat { 0%,100%{transform:translateY(0) rotateY(0deg) rotateX(15deg)} 50%{transform:translateY(-6px) rotateY(180deg) rotateX(15deg)} }
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
          <Logo size={32} />
          <span style={{ fontWeight: "900", fontSize: "17px", letterSpacing: "-0.03em" }}>
            <span style={{ color: "#c8e63c" }}>forty</span><span style={{ color: "#3b82f6" }}>.</span><span style={{ color: "#3b82f6", fontWeight: "300" }}>fifteen</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!["upload", "working"].includes(stage) && (
            <button onClick={reset} style={{
              background: "none", border: "1px solid #1e1e1e", borderRadius: "8px",
              color: "#555", fontSize: "12px", padding: "7px 16px", cursor: "pointer",
              letterSpacing: "0.04em", transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
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

            {/* ── SPORT SELECTOR ── */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px", textAlign: "center" }}>Select your sport</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#080e1f", border: "2px solid #3b82f6", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", cursor: "pointer", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <svg width="28" height="48" viewBox="0 0 28 48" fill="none">
                      <ellipse cx="14" cy="15" rx="11" ry="13" stroke="#3b82f6" strokeWidth="1.8" fill="none"/>
                      <line x1="8"  y1="4"  x2="8"  y2="26" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="11" y1="2.5" x2="11" y2="27" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="14" y1="2"  x2="14" y2="28" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="17" y1="2.5" x2="17" y2="27" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="20" y1="4"  x2="20" y2="26" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="4"  y1="9"  x2="24" y2="9"  stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="3"  y1="13" x2="25" y2="13" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="3"  y1="17" x2="25" y2="17" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <line x1="4"  y1="21" x2="24" y2="21" stroke="#3b82f6" strokeWidth="0.7" strokeLinecap="round" opacity="0.8"/>
                      <path d="M 9 28 L 9 32 L 14 30.5 L 19 32 L 19 28" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                      <rect x="11" y="32" width="6" height="14" rx="3" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
                      <line x1="11" y1="37" x2="17" y2="37" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6"/>
                      <line x1="11" y1="41" x2="17" y2="41" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#3b82f6" }}>Tennis</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#3b82f6", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#060606", fontWeight: "900", letterSpacing: "0.08em" }}>ACTIVE</span>
                  </div>
                </div>
                <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", opacity: 0.5, position: "relative", cursor: "not-allowed" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <svg width="28" height="48" viewBox="0 0 28 48" fill="none">
                      <path d="M 14 2 C 7 2 2 7 2 14 C 2 22 6 28 14 33 C 22 28 26 22 26 14 C 26 7 21 2 14 2 Z" stroke="#444" strokeWidth="1.8" fill="none"/>
                      <circle cx="8"  cy="8"  r="1.4" fill="#444"/>
                      <circle cx="14" cy="6"  r="1.4" fill="#444"/>
                      <circle cx="20" cy="8"  r="1.4" fill="#444"/>
                      <circle cx="6"  cy="14" r="1.4" fill="#444"/>
                      <circle cx="12" cy="13" r="1.4" fill="#444"/>
                      <circle cx="18" cy="13" r="1.4" fill="#444"/>
                      <circle cx="22" cy="15" r="1.4" fill="#444"/>
                      <circle cx="8"  cy="19" r="1.4" fill="#444"/>
                      <circle cx="14" cy="19" r="1.4" fill="#444"/>
                      <circle cx="20" cy="19" r="1.4" fill="#444"/>
                      <circle cx="11" cy="25" r="1.4" fill="#444"/>
                      <circle cx="17" cy="25" r="1.4" fill="#444"/>
                      <path d="M 10 33 L 10 36 L 14 34.5 L 18 36 L 18 33" stroke="#444" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                      <rect x="11" y="36" width="6" height="10" rx="3" stroke="#444" strokeWidth="1.5" fill="none"/>
                      <line x1="11" y1="41" x2="17" y2="41" stroke="#444" strokeWidth="0.8"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#444" }}>Padel</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#1a1a1a", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#555", fontWeight: "900", letterSpacing: "0.08em" }}>SOON</span>
                  </div>
                </div>
                <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", opacity: 0.5, position: "relative", cursor: "not-allowed" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <svg width="28" height="48" viewBox="0 0 28 48" fill="none">
                      <rect x="2" y="2" width="24" height="22" rx="7" stroke="#444" strokeWidth="1.8" fill="none"/>
                      <path d="M 8 24 C 8 27 11 29 14 29 C 17 29 20 27 20 24" stroke="#444" strokeWidth="1.5" fill="none"/>
                      <line x1="8"  y1="24" x2="8"  y2="29" stroke="#444" strokeWidth="1.5"/>
                      <line x1="20" y1="24" x2="20" y2="29" stroke="#444" strokeWidth="1.5"/>
                      <rect x="10" y="29" width="8" height="17" rx="4" stroke="#444" strokeWidth="1.5" fill="none"/>
                      <line x1="10" y1="35" x2="18" y2="35" stroke="#444" strokeWidth="0.8"/>
                      <line x1="10" y1="40" x2="18" y2="40" stroke="#444" strokeWidth="0.8"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#444" }}>Pickleball</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#1a1a1a", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#555", fontWeight: "900", letterSpacing: "0.08em" }}>SOON</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#3a3a3a", lineHeight: "1.7" }}>
                  Continuously trained on elite coaching publications, world-leading books, biomechanics research, and methodology from leading coaches and conferences around the world.
                </p>
              </div>
            </div>

            {/* ── HERO ── */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#3b82f612", border: "1px solid #3b82f625", borderRadius: "20px", padding: "5px 14px", marginBottom: "20px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.5s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.18em" }}>Free during beta</span>
              </div>
              <h1 style={{ fontSize: "clamp(38px,9vw,68px)", fontWeight: "900", letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 22px", color: "#c8e63c" }}>
                Your game<br />is leaking points.<br />Find out where.
              </h1>
              <p style={{ color: "#444", fontSize: "16px", lineHeight: "1.7", maxWidth: "400px", margin: "0 0 28px" }}>
                Upload your match. Start seeing your game the way a coach does — technique, tactics, mental game, and a training plan.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                {[
                  { text: "Coach-built, science-backed", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#3b82f6" strokeWidth="1.2" fill="none"/><path d="M 2 7 Q 4.5 4 7 7 Q 9.5 10 12 7" stroke="#3b82f6" strokeWidth="1" fill="none"/><path d="M 2 7 Q 4.5 10 7 7 Q 9.5 4 12 7" stroke="#3b82f6" strokeWidth="1" fill="none"/></svg> },
                  { text: "Tennis Canada certified coach", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="10" height="8" rx="2" stroke="#3b82f6" strokeWidth="1.2" fill="none"/><line x1="5" y1="3" x2="5" y2="1.5" stroke="#3b82f6" strokeWidth="1"/><line x1="9" y1="3" x2="9" y2="1.5" stroke="#3b82f6" strokeWidth="1"/><circle cx="5" cy="7" r="1" fill="#3b82f6"/><circle cx="9" cy="7" r="1" fill="#3b82f6"/><line x1="5" y1="7" x2="9" y2="7" stroke="#3b82f6" strokeWidth="0.8"/></svg> },
                  { text: "Report emailed to you", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#3b82f6" strokeWidth="1.2" fill="none"/><path d="M 1 4 L 7 8 L 13 4" stroke="#3b82f6" strokeWidth="1" fill="none"/></svg> },
                  { text: "No account needed", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="6" width="8" height="6" rx="1.5" stroke="#3b82f6" strokeWidth="1.2" fill="none"/><path d="M 4.5 6 V 4.5 A 2.5 2.5 0 0 1 9.5 4.5 V 6" stroke="#3b82f6" strokeWidth="1.2" fill="none"/><circle cx="7" cy="9" r="1" fill="#3b82f6"/></svg> },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "5px 12px" }}>
                    {b.icon}
                    <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.02em" }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SESSION TYPE SELECTOR ── */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>What type of video is this?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { id: "match", label: "Match", sub: "Point play vs opponent", icon: "⚔️" },
                  { id: "drilling", label: "Drilling", sub: "Practice or ball machine", icon: "🎯" },
                  { id: "lesson", label: "Lesson", sub: "Coach feeding balls", icon: "🎓" },
                ].map(s => (
                  <button key={s.id} onClick={() => setSessionType(s.id)} style={{
                    background: sessionType === s.id ? "#3b82f614" : "#080808",
                    border: `1px solid ${sessionType === s.id ? "#3b82f6" : "#141414"}`,
                    borderRadius: "12px", padding: "14px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.18s",
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: sessionType === s.id ? "#3b82f6" : "#555", marginBottom: "3px" }}>{s.label}</div>
                    <div style={{ fontSize: "9px", color: sessionType === s.id ? "#3b82f680" : "#2a2a2a", lineHeight: "1.4" }}>{s.sub}</div>
                  </button>
                ))}
              </div>
              {sessionType !== "match" && (
                <div style={{ marginTop: "10px", padding: "10px 14px", background: "#3b82f608", border: "1px solid #3b82f618", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#3b82f6" }}>
                    {sessionType === "drilling"
                      ? "Drilling mode: report focuses on shot mechanics only. Court position is read from the video, not assumed."
                      : "Lesson mode: report focuses on technique only. Coach-feed context is acknowledged throughout."}
                  </span>
                </div>
              )}
            </div>

            {/* ── DROP ZONE ── */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#3b82f6" : "#1c1c1c"}`,
                borderRadius: "20px", padding: "48px 24px 44px", textAlign: "center",
                cursor: "pointer", background: dragging ? "#07101f" : "#080808",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(29,158,117,0.06), rgba(29,158,117,0.15), rgba(29,158,117,0.06), transparent)", animation: "courtScan 2.5s linear infinite", pointerEvents: "none" }}/>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #3b82f6, transparent)", animation: "courtScan 2.5s linear infinite", opacity: 0.6 }}/>
              <div style={{ fontSize: "56px", marginBottom: "14px", lineHeight: 1 }}>🎾</div>
              <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px", letterSpacing: "-0.02em", color: "#e0e0e0" }}>
                The ball never lies. Start understanding what yours has been saying.
              </div>
              <div style={{ color: "#2a2a2a", fontSize: "12px", marginBottom: "22px" }}>
                Best results: 10–20 min · 720p or higher · MP4 or MOV
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#c8e63c", color: "#060606", borderRadius: "10px", padding: "13px 32px", fontWeight: "900", fontSize: "14px", letterSpacing: "0.02em" }}>
                <span>↑</span> Get my coaching report
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {error && error !== "ANALYSIS_ERROR" && (
              <div style={{ marginTop: "14px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", background: "#3b82f608", border: "1px solid #3b82f618", borderRadius: "10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.5s infinite" }}/>
              <span style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.05em" }}>
                Free during beta · 2 analyses per email · No credit card required
              </span>
            </div>

            {/* ── MOCK REPORT PREVIEW ── */}
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px 20px 80px", marginTop: "20px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #3b82f6, transparent)", opacity: 0.4 }}/>
              <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "14px" }}>Example report preview</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                {[
                  { label: "Technique", score: "6", color: "#60a5fa", sub: "Arm-Only Hitter" },
                  { label: "Strategy", score: "5", color: "#f59e0b", sub: "Passive Baseliner" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#0e0e0e", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: s.color, lineHeight: 1 }}>{s.score}</div>
                    <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "0.12em", margin: "4px 0" }}>{s.label} /10</div>
                    <div style={{ fontSize: "10px", color: "#2a2a2a" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0a0a0a", borderLeft: "2px solid #3b82f6", padding: "10px 14px", borderRadius: "0 8px 8px 0", marginBottom: "12px" }}>
                <div style={{ fontSize: "8px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>Coach verdict</div>
                <p style={{ margin: 0, fontSize: "12px", color: "#3a3a3a", fontStyle: "italic", lineHeight: "1.6" }}>"The arm is doing all the work while the body watches. Fix the unit turn first and everything downstream improves."</p>
              </div>
              <div style={{ fontSize: "8px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Top 3 fixes</div>
              {[
                { rank: 1, fix: "Establish a complete unit turn before every swing", cue: "Shoulder to net post before I swing" },
                { rank: 2, fix: "Begin recovery the instant the ball leaves your strings", cue: "Ball leaves strings, feet start moving" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px", opacity: i === 1 ? 0.5 : 1 }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: i === 0 ? "#3b82f6" : "#141414", border: `1px solid ${i === 0 ? "#3b82f6" : "#222"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", color: i === 0 ? "#060606" : "#333", flexShrink: 0 }}>{f.rank}</div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#555", marginBottom: "2px" }}>{f.fix}</div>
                    <div style={{ fontSize: "10px", color: "#3b82f6", fontStyle: "italic" }}>"{f.cue}"</div>
                  </div>
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(transparent, #080808)", borderRadius: "0 0 16px 16px" }}/>
              <div style={{ position: "absolute", bottom: "22px", left: 0, right: 0, textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#3b82f618", border: "1px solid #3b82f630", borderRadius: "20px", padding: "6px 16px" }}>
                  <span style={{ fontSize: "10px", color: "#3b82f6" }}>Upload your video to unlock your real report</span>
                </div>
              </div>
            </div>

            {/* ── FEATURE GRID ── */}
            <FadeIn delay={0}>
              <div style={{ marginTop: "48px" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>What you get</div>
                  <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: "900", letterSpacing: "-0.03em", margin: 0 }}>
                    The coaching report<br />your game has been missing.
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="40" r="2.5" fill="#3b82f6" opacity="0.5"/><line x1="22" y1="40" x2="22" y2="30" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"/><circle cx="22" cy="30" r="2.5" fill="#3b82f6" opacity="0.65"/><line x1="22" y1="30" x2="22" y2="20" stroke="#3b82f6" strokeWidth="1.5" opacity="0.65"/><circle cx="22" cy="20" r="2.5" fill="#3b82f6" opacity="0.8"/><line x1="22" y1="20" x2="32" y2="13" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8"/><circle cx="32" cy="13" r="2.5" fill="#3b82f6" opacity="0.9"/><ellipse cx="38" cy="8" rx="5" ry="7" fill="none" stroke="#3b82f6" strokeWidth="1.8"/></svg>, title: "Biomechanics breakdown", body: "Contact point, unit turn, swing path, follow-through — per shot type, with the kinetic chain explained." },
                    { icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="4" width="36" height="36" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.3"/><line x1="4" y1="22" x2="40" y2="22" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5"/><line x1="36" y1="30" x2="10" y2="10" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8"/><polygon points="10,10 16,12 12,16" fill="#3b82f6" opacity="0.8"/></svg>, title: "Tactical patterns", body: "Court positioning, recovery habits, short ball response — the patterns costing you games every match." },
                    { icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.25"/><circle cx="22" cy="22" r="12" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.45"/><circle cx="22" cy="22" r="6" fill="none" stroke="#3b82f6" strokeWidth="1.4" opacity="0.7"/><circle cx="22" cy="22" r="2.5" fill="#3b82f6"/><line x1="38" y1="6" x2="26" y2="18" stroke="#3b82f6" strokeWidth="1.8"/><polygon points="26,18 30,12 34,16" fill="#3b82f6"/></svg>, title: "Priority fixes", body: "Your top 3 root-cause fixes ranked by impact. Fix the upstream fault and multiple problems resolve." },
                    { icon: <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="8" y="10" width="28" height="32" rx="3" fill="none" stroke="#3b82f6" strokeWidth="1.4" opacity="0.6"/><rect x="16" y="6" width="12" height="8" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.6"/><polyline points="14,22 17,25 22,19" fill="none" stroke="#3b82f6" strokeWidth="1.4" opacity="0.9"/><polyline points="14,30 17,33 22,27" fill="none" stroke="#3b82f6" strokeWidth="1.4" opacity="0.6"/></svg>, title: "Training plan", body: "Two specific drills plus a match rule simple enough to hold in your head during a point." },
                  ].map((card, i) => (
                    <div key={i} style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px 16px" }}>
                      {card.icon}
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#ddd", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>{card.title}</div>
                      <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>{card.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* ── HOW IT WORKS ── */}
            <FadeIn delay={0}>
              <div style={{ marginTop: "48px" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>How it works</div>
                  <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: "900", letterSpacing: "-0.03em", margin: 0 }}>Three steps to your report.</h2>
                </div>
                {[
                  { n: "01", h: "Upload your match", b: "Up to 2GB. MP4 or MOV from your phone. We break your match down frame by frame — analyzing movement, technique, and patterns from start to finish.", color: "#3b82f6" },
                  { n: "02", h: "We analyze your match", b: "The engine reads your biomechanics, identifies recurring patterns, and cross-references against club-level benchmarks. Takes 2–3 minutes.", color: "#60a5fa" },
                  { n: "03", h: "Get your full report", b: "Technique scores, top fixes, drills, and on-court cues — displayed instantly and emailed so you can reference it on court.", color: "#a78bfa" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "20px", background: "#080808", border: "1px solid #111", borderRadius: "14px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: s.color, opacity: 0.3, lineHeight: 1, flexShrink: 0, width: "36px" }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#ddd", marginBottom: "6px" }}>{s.h}</div>
                      <div style={{ fontSize: "12px", color: "#333", lineHeight: "1.7" }}>{s.b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* ── PRO WAITLIST ── */}
            <FadeIn delay={0}>
              <div style={{ marginTop: "48px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "28px 24px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#3b82f618", border: "1px solid #3b82f630", borderRadius: "20px", padding: "4px 14px", marginBottom: "16px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.5s infinite" }}/>
                  <span style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em" }}>Coming soon</span>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em", margin: "0 0 10px", color: "#e8e8e8" }}>
                  Unlimited analyses. Progress tracking. Coach sharing.
                </h3>
                <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#333", lineHeight: "1.7", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
                  Pro members get unlimited analyses, session history, progress tracking, and first access to every new capability as it launches.
                </p>
                <a href="https://tally.so/r/RG2pGj" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", background: "#c8e63c", color: "#060606", borderRadius: "10px", padding: "13px 28px", fontWeight: "900", fontSize: "14px", textDecoration: "none", letterSpacing: "0.01em" }}>
                  Join the Pro waitlist
                </a>
                <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#1e1e1e" }}>
                  Early members get founding pricing. No spam.
                </p>
              </div>
            </FadeIn>

            {/* ── FOOTER ── */}
            <FadeIn delay={0}>
              <div style={{ marginTop: "32px", textAlign: "center", paddingBottom: "16px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#555", lineHeight: "1.9" }}>
                  Made in Canada 🍁 by a Tennis Canada NCCP certified Club Pro<br />
                  <span style={{ fontStyle: "italic", color: "#3a3a3a" }}>who got tired of guessing what was wrong with his game.</span>
                </p>
                <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#555", lineHeight: "1.8" }}>
                  Questions?{" "}
                  <a href="mailto:coach@fortyfifteen.app" style={{ color: "#3b82f6", textDecoration: "none", borderBottom: "1px solid #3b82f640" }}>
                    coach@fortyfifteen.app
                  </a>
                </p>
                <p style={{ margin: "12px 0 0", fontSize: "10px", color: "#3a3a3a", lineHeight: "1.6", letterSpacing: "0.04em" }}>
                  © {new Date().getFullYear()} Forty Fifteen. All rights reserved.
                </p>
              </div>
            </FadeIn>
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
                  { l: "Data processed", v: `~${estFrames(duration) * 40}KB` },
                ].map(s => (
                  <div key={s.l} style={{ background: "#080808", border: "1px solid #141414", borderRadius: "10px", padding: "12px 14px" }}>
                    <div style={{ fontSize: "9px", color: "#2e2e2e", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>{s.l}</div>
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#3b82f6", letterSpacing: "-0.02em" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
                Who should I focus on? <span style={{ color: "#2a2a2a", textTransform: "none", letterSpacing: 0 }}>(leave blank if it's only you)</span>
              </div>
              <input value={playerId} onChange={e => setPlayerId(e.target.value)}
                placeholder="e.g. Red shirt, black shorts, far side of the court"
                style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "13px 16px", color: "#f0f0f0", fontSize: "14px", lineHeight: "1.5", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
            </div>

            <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
              Anything else I should know? <span style={{ color: "#2a2a2a" }}>(optional)</span>
            </div>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. My backhand keeps going wide under pressure. Playing against a big server. Focus on my serve and net approach."
              style={{ width: "100%", minHeight: "80px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "14px", lineHeight: "1.7", resize: "vertical", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#1a1a1a"} />

            {error && (
              <div style={{ marginTop: "12px", background: "#120808", border: "1px solid #2e1010", borderRadius: "12px", padding: "18px 20px" }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>🎾</div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#e8e8e8", marginBottom: "6px" }}>
                  Oops — your coaching engine hit one into the net.
                </div>
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
                  Something went wrong during analysis. This is usually a one-time glitch — hit the button again and it should work.
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#333", lineHeight: "1.6" }}>
                  If this keeps happening, reach out at{" "}
                  <a href="mailto:coach@fortyfifteen.app" style={{ color: "#3b82f6", textDecoration: "none" }}>coach@fortyfifteen.app</a>
                  {" "}and we will sort it out.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={reset} style={{ flex: 1, background: "none", border: "1px solid #1a1a1a", borderRadius: "10px", color: "#3a3a3a", fontSize: "14px", padding: "14px", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                ← Change video
              </button>
              <button onClick={proceedToGate} style={{ flex: 3, background: "#c8e63c", border: "none", borderRadius: "10px", color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s" }}
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
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }}/>
                <span style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em" }}>Almost there</span>
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", margin: "0 0 8px" }}>Where should we send your report?</h2>
              <p style={{ color: "#3a3a3a", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                Your full coaching report will be emailed to you so you can reference it on court. No spam. Unsubscribe anytime.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", padding: "12px 16px", background: "#3b82f608", border: "1px solid #3b82f618", borderRadius: "10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.5s infinite" }}/>
              <span style={{ fontSize: "11px", color: "#3b82f6" }}>
                Free during beta — <strong style={{ color: "#3b82f6" }}>2 analyses per email</strong> included
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>First name</div>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. William"
                  style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>Email address</div>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="e.g. you@gmail.com"
                  style={{ width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
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
                      background: level === l.id ? "#3b82f6" : "#080808",
                      border: `1px solid ${level === l.id ? "#3b82f6" : "#1a1a1a"}`,
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
                {gateError}
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
              <button onClick={proceedToAnalysis} style={{ flex: 3, background: "#c8e63c", border: "none", borderRadius: "10px", color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px", cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s" }}
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

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "52px", display: "inline-block", animation: "ballBounce 1s ease-in-out infinite" }}>🎾</div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.2s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em" }}>Analyzing</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em", margin: "0 0 8px", minHeight: "32px" }}>
                {statusMsg}
              </h2>
              {framesTotal > 0 && pct < 60 && (
                <div style={{ fontSize: "12px", color: "#2a2a2a", marginBottom: "4px" }}>
                  Frame {framesDone} of {framesTotal} extracted
                </div>
              )}
              {pct >= 60 && pct < 100 && (
                <div style={{ fontSize: "12px", color: "#2a2a2a" }}>
                  {framesTotal > 0 ? `${framesTotal} frames` : "Frames"} sent · Your coaching report is being built…
                </div>
              )}
              <p style={{ color: "#2a2a2a", fontSize: "12px", margin: "6px 0 0" }}>Keep this tab open and your screen unlocked</p>
              <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "#1a1000", border: "1px solid #2a1e00", borderRadius: "8px", padding: "7px 14px" }}>
                <span style={{ fontSize: "13px" }}>📱</span>
                <span style={{ fontSize: "11px", color: "#a07020" }}>On mobile: turn off auto-lock or keep tapping the screen</span>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overall progress</span>
                <span style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "700" }}>{Math.round(pct)}%</span>
              </div>
              <div style={{ background: "#0e0e0e", borderRadius: "8px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  background: pct === 100 ? "#3b82f6" : "linear-gradient(90deg, #3b82f6, #a8df00)",
                  borderRadius: "8px", width: `${pct}%`,
                  transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                  boxShadow: pct > 0 && pct < 100 ? "0 0 14px #3b82f666" : "none",
                }}/>
              </div>
            </div>

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

            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "14px", padding: "20px 22px", minHeight: "100px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#3b82f6" }}/>
                Did you know · {factIndex + 1}/{TENNIS_FACTS.length}
              </div>
              <p key={factIndex} style={{
                margin: 0, fontSize: "13px", color: "#3a3a3a", lineHeight: "1.75",
                animation: "factSlide 6s ease forwards",
              }}>
                {TENNIS_FACTS[factIndex]}
              </p>
              <div style={{ display: "flex", gap: "4px", marginTop: "14px" }}>
                {TENNIS_FACTS.map((_, i) => (
                  <div key={i} style={{
                    width: i === factIndex ? "16px" : "4px", height: "4px",
                    borderRadius: "2px",
                    background: i === factIndex ? "#3b82f6" : "#1a1a1a",
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
                  <div style={{ background: "#080808", borderLeft: "3px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "16px 20px" }}>
                    <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>Coach verdict</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#777", fontStyle: "italic", lineHeight: "1.65" }}>"{result.coach_verdict}"</p>
                  </div>
                )}
              </div>

              <CourtLine />

              {result.priority_fixes?.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <SectionLabel icon="⚡" color="#3b82f6">Top 3 fixes</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {result.priority_fixes.map(p => (
                      <div key={p.rank} style={{
                        background: p.rank === 1 ? "#080e1a" : "#080808",
                        border: `1px solid ${p.rank === 1 ? "#0e1e3a" : "#111"}`,
                        borderRadius: "12px", padding: "16px 18px",
                        display: "flex", gap: "16px", alignItems: "flex-start",
                      }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                          background: p.rank === 1 ? "#3b82f6" : "#0e0e0e",
                          color: p.rank === 1 ? "#060606" : "#2e2e2e",
                          border: `1px solid ${p.rank === 1 ? "#3b82f6" : "#1a1a1a"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: "900",
                        }}>{p.rank}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#e0e0e0", marginBottom: "4px", lineHeight: "1.4" }}>{p.fix}</div>
                          {p.why_first && <div style={{ fontSize: "12px", color: "#3a3a3a", marginBottom: p.on_court_cue ? "8px" : 0 }}>{p.why_first}</div>}
                          {p.expected_improvement && <div style={{ fontSize: "12px", color: "#2a2a2a", marginBottom: p.on_court_cue ? "8px" : 0 }}>{p.expected_improvement}</div>}
                          {p.on_court_cue && (
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "8px 12px", display: "inline-block" }}>
                              <span style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em" }}>Say on court: </span>
                              <span style={{ fontSize: "12px", color: "#3b82f6", fontStyle: "italic", fontWeight: "600" }}>"{p.on_court_cue}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CourtLine />

              <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                {[
                  { id: "technique", label: "Technique", icon: "🎯" },
                  { id: "strategy", label: "Strategy", icon: "🧠" },
                  { id: "training", label: "Training", icon: "🏋️" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, padding: "12px 8px",
                    background: tab === t.id ? "#3b82f6" : "#080808",
                    border: `1px solid ${tab === t.id ? "#3b82f6" : "#141414"}`,
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

              {tab === "technique" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  {tech.strengths?.length > 0 && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel color="#5bc85b">What is working</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {tech.strengths.map((s, i) => (
                          <div key={i} style={{ background: "#080e1f", border: "1px solid #1a2a4a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>✓ {s}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── FIXED: Shot breakdown handles nested objects safely ── */}
                  {tech.shot_breakdown && (
                    <ShotBreakdown shotBreakdown={tech.shot_breakdown} />
                  )}

                  {tech.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#3b82f6">Recurring patterns</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {tech.patterns.map((p, i) => (
                          <Panel key={i} title={p.pattern} badge accent="#60a5fa">
                            <div style={{ paddingTop: "14px" }}>
                              {p.frequency && <div style={{ fontSize: "11px", color: "#2e2e2e", marginBottom: "12px" }}>{p.frequency}</div>}
                              {p.what_it_looks_like && <Block label="What I see" value={p.what_it_looks_like} />}
                              {p.biomechanical_cause && <Block label="Root cause" value={p.biomechanical_cause} />}
                              {p.downstream_effects && <Block label="Downstream effects" value={p.downstream_effects} />}
                              {p.impact && <Block label="Impact" value={p.impact} />}
                              {p.fix && <Block label="The fix" value={p.fix} glow />}
                              {p.drill && <Block label="Drill" value={p.drill} />}
                            </div>
                          </Panel>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.pattern_correlations?.length > 0 && (
                    <div>
                      <SectionLabel color="#a78bfa">Pattern correlations</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {result.pattern_correlations.map((c, i) => (
                          <Panel key={i} title={c.correlation} accent="#a78bfa">
                            <div style={{ paddingTop: "14px" }}>
                              {c.explanation && <Block label="How they interact" value={c.explanation} />}
                              {c.combined_impact && <Block label="Combined impact" value={c.combined_impact} glow />}
                            </div>
                          </Panel>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "strategy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  {strat.headline && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <div style={{ fontSize: "9px", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>Playing style</div>
                      <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em" }}>{strat.headline}</div>
                      {strat.surface_note && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#444", lineHeight: "1.6" }}>{strat.surface_note}</p>}
                    </div>
                  )}
                  {strat.net_game_tendency && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <div style={{ fontSize: "9px", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>Net game</div>
                      <div style={{ fontSize: "14px", color: "#888" }}>{strat.net_game_tendency}</div>
                    </div>
                  )}
                  {strat.strengths?.length > 0 && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel color="#5bc85b">What is working</SectionLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {strat.strengths.map((s, i) => (
                          <div key={i} style={{ background: "#080e1f", border: "1px solid #1a2a4a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>✓ {s}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strat.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#3b82f6">Tactical patterns</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {strat.patterns.map((p, i) => (
                          <Panel key={i} title={p.pattern} badge accent="#f59e0b">
                            <div style={{ paddingTop: "14px" }}>
                              {p.frequency && <div style={{ fontSize: "11px", color: "#2e2e2e", marginBottom: "12px" }}>{p.frequency}</div>}
                              {p.what_it_looks_like && <Block label="What I see" value={p.what_it_looks_like} />}
                              {p.impact && <Block label="Impact" value={p.impact} />}
                              {p.fix && <Block label="Fix" value={p.fix} glow />}
                            </div>
                          </Panel>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.mental_game && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="🧠" color="#a78bfa">Mental game</SectionLabel>
                      {result.mental_game.headline && <div style={{ fontSize: "15px", fontWeight: "800", color: "#e0e0e0", marginBottom: "12px" }}>{result.mental_game.headline}</div>}
                      {result.mental_game.observation && <Block label="What I see" value={result.mental_game.observation} />}
                      {result.mental_game.failure_mode && result.mental_game.failure_mode !== "None Visible" && <Block label="Pattern" value={result.mental_game.failure_mode} />}
                      {result.mental_game.between_point_routine && <Block label="Between-point routine" value={result.mental_game.between_point_routine} />}
                      {result.mental_game.momentum_pattern && <Block label="Momentum" value={result.mental_game.momentum_pattern} />}
                      {result.mental_game.mental_strength && <Block label="Mental strength" value={result.mental_game.mental_strength} glow />}
                      {result.mental_game.psychological_tip && <Block label="This week's tip" value={result.mental_game.psychological_tip} glow />}
                    </div>
                  )}
                </div>
              )}

              {tab === "training" && result.training_plan && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", animation: "fadeUp 0.25s ease" }}>
                  <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                    <SectionLabel icon="📅" color="#a78bfa">This week</SectionLabel>
                    <p style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#e0e0e0", lineHeight: "1.5", letterSpacing: "-0.01em" }}>
                      {result.training_plan.this_week}
                    </p>
                    {result.training_plan.match_focus && (
                      <div style={{ background: "#080e1a", border: "1px solid #0e1e3a", borderRadius: "8px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>Match rule</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#bbb", lineHeight: "1.65" }}>{result.training_plan.match_focus}</p>
                      </div>
                    )}
                    {result.training_plan.mental_cue && (
                      <div style={{ background: "#0d0a1a", border: "1px solid #1e1535", borderRadius: "8px", padding: "14px 16px", marginTop: "10px" }}>
                        <div style={{ fontSize: "9px", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>Between-point phrase</div>
                        <p style={{ margin: 0, fontSize: "15px", color: "#d0c0ff", fontStyle: "italic", fontWeight: "800", lineHeight: "1.5" }}>"{result.training_plan.mental_cue}"</p>
                      </div>
                    )}
                  </div>

                  {result.priority_fixes?.some(p => p.on_court_cue) && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="💬" color="#3b82f6">On-court cues</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {result.priority_fixes.filter(p => p.on_court_cue).map(p => (
                          <div key={p.rank} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                              background: p.rank === 1 ? "#3b82f6" : "#0e0e0e",
                              color: p.rank === 1 ? "#060606" : "#333",
                              border: `1px solid ${p.rank === 1 ? "#3b82f6" : "#1a1a1a"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px", fontWeight: "900",
                            }}>{p.rank}</div>
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 14px", flex: 1 }}>
                              <p style={{ margin: 0, fontSize: "14px", color: "#3b82f6", fontStyle: "italic", fontWeight: "700" }}>"{p.on_court_cue}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {[result.training_plan.drill_1, result.training_plan.drill_2, result.training_plan.mental_drill].filter(Boolean).map((drill, i) => {
                    const colors = ["#a78bfa", "#60a5fa", "#f59e0b"];
                    const labels = ["Technical drill", "Tactical drill", "Mental drill"];
                    return (
                      <Panel key={i} title={drill.name} badge accent={colors[i] || "#a78bfa"}>
                        <div style={{ paddingTop: "14px" }}>
                          {drill.targets && <div style={{ fontSize: "11px", color: colors[i] || "#a78bfa", marginBottom: "12px" }}>{labels[i] || "Drill"} — {drill.targets}</div>}
                          {drill.setup && <Block label="Setup" value={drill.setup} />}
                          {drill.execution && <Block label="How to do it" value={drill.execution} />}
                          {drill.reps && <Block label="Volume" value={drill.reps} />}
                          {drill.success_marker && <Block label="You are doing it right when" value={drill.success_marker} glow />}
                        </div>
                      </Panel>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "32px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "24px 20px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#3b82f618", border: "1px solid #3b82f630", borderRadius: "20px", padding: "4px 14px", marginBottom: "12px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.5s infinite" }}/>
                  <span style={{ fontSize: "10px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.15em" }}>Free Beta</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "800", color: "#e0e0e0", letterSpacing: "-0.01em" }}>
                  Forty Fifteen is free during beta.
                </p>
                <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#333", lineHeight: "1.6" }}>
                  Pro features: unlimited analyses, session history, progress tracking, and coach sharing.
                </p>
                <a href="https://tally.so/r/RG2pGj" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", background: "#c8e63c", color: "#060606", borderRadius: "10px", padding: "12px 28px", fontWeight: "900", fontSize: "14px", textDecoration: "none", letterSpacing: "0.01em" }}>
                  Join the Pro waitlist
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
