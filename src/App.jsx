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
  const wakeLock = useRef(null);

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

    // Request wake lock to keep screen on during analysis
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      console.log('Wake lock not available:', e.message);
    }

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
      // Release wake lock
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

            {/* ── SPORT SELECTOR ── */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px", textAlign: "center" }}>Select your sport</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>

                {/* Tennis — active */}
                <div style={{ background: "#0b150b", border: "2px solid #1D9E75", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", cursor: "pointer", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="#1D9E75" strokeWidth="2" fill="none"/>
                      <path d="M 6 20 Q 13 10 20 20 Q 27 30 34 20" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                      <path d="M 6 20 Q 13 30 20 20 Q 27 10 34 20" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#1D9E75" }}>Tennis</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#1D9E75", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#060606", fontWeight: "900", letterSpacing: "0.08em" }}>ACTIVE</span>
                  </div>
                </div>

                {/* Padel — coming soon */}
                <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", opacity: 0.5, position: "relative", cursor: "not-allowed" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    {/* Padel racket — rounded top, widest upper half, tapers to rounded point, throat triangle, short handle */}
                    <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                      {/* Head: gently curved top, wide upper half, tapers to rounded point */}
                      <path d="M 16 2 C 9 2 2 7 2 14 C 2 21 5 27 16 33 C 27 27 30 21 30 14 C 30 7 23 2 16 2 Z" stroke="#555" strokeWidth="2" fill="none"/>
                      {/* Hole pattern */}
                      <circle cx="10" cy="8"  r="1.3" fill="#555"/>
                      <circle cx="16" cy="7"  r="1.3" fill="#555"/>
                      <circle cx="22" cy="8"  r="1.3" fill="#555"/>
                      <circle cx="7"  cy="14" r="1.3" fill="#555"/>
                      <circle cx="13" cy="14" r="1.3" fill="#555"/>
                      <circle cx="19" cy="14" r="1.3" fill="#555"/>
                      <circle cx="25" cy="14" r="1.3" fill="#555"/>
                      <circle cx="10" cy="20" r="1.3" fill="#555"/>
                      <circle cx="16" cy="20" r="1.3" fill="#555"/>
                      <circle cx="22" cy="20" r="1.3" fill="#555"/>
                      <circle cx="13" cy="26" r="1.3" fill="#555"/>
                      <circle cx="19" cy="26" r="1.3" fill="#555"/>
                      {/* Throat triangle */}
                      <path d="M 12 33 L 12 36 L 16 34.5 L 20 36 L 20 33" stroke="#555" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                      {/* Short handle */}
                      <rect x="13" y="36" width="6" height="9" rx="3" stroke="#555" strokeWidth="1.5" fill="none"/>
                      <line x1="13" y1="41" x2="19" y2="41" stroke="#555" strokeWidth="0.8"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#444" }}>Padel</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#1a1a1a", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#555", fontWeight: "900", letterSpacing: "0.08em" }}>SOON</span>
                  </div>
                </div>

                {/* Pickleball — coming soon */}
                <div style={{ background: "#080808", border: "1px solid #141414", borderRadius: "14px", padding: "18px 10px 14px", textAlign: "center", opacity: 0.5, position: "relative", cursor: "not-allowed" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    {/* Pickleball paddle — wide rectangular rounded head, solid face, throat neck, longer handle */}
                    <svg width="32" height="48" viewBox="0 0 32 48" fill="none">
                      {/* Wide rectangular head with very rounded corners */}
                      <rect x="2" y="2" width="28" height="26" rx="8" stroke="#555" strokeWidth="2" fill="none"/>
                      {/* Solid face — subtle texture lines */}
                      <line x1="8"  y1="8"  x2="8"  y2="24" stroke="#444" strokeWidth="0.8" strokeLinecap="round"/>
                      <line x1="13" y1="6"  x2="13" y2="25" stroke="#444" strokeWidth="0.8" strokeLinecap="round"/>
                      <line x1="18" y1="6"  x2="18" y2="25" stroke="#444" strokeWidth="0.8" strokeLinecap="round"/>
                      <line x1="23" y1="8"  x2="23" y2="24" stroke="#444" strokeWidth="0.8" strokeLinecap="round"/>
                      {/* Throat — narrows from head to handle */}
                      <path d="M 10 28 C 10 30 13 32 16 32 C 19 32 22 30 22 28" stroke="#555" strokeWidth="1.5" fill="none"/>
                      <line x1="10" y1="28" x2="10" y2="32" stroke="#555" strokeWidth="1.5"/>
                      <line x1="22" y1="28" x2="22" y2="32" stroke="#555" strokeWidth="1.5"/>
                      {/* Handle — longer than padel */}
                      <rect x="12" y="32" width="8" height="14" rx="4" stroke="#555" strokeWidth="1.5" fill="none"/>
                      {/* Grip wrap lines */}
                      <line x1="12" y1="37" x2="20" y2="37" stroke="#555" strokeWidth="0.8"/>
                      <line x1="12" y1="41" x2="20" y2="41" stroke="#555" strokeWidth="0.8"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#444" }}>Pickleball</div>
                  <div style={{ position: "absolute", top: "8px", right: "8px", background: "#1a1a1a", borderRadius: "4px", padding: "2px 6px" }}>
                    <span style={{ fontSize: "8px", color: "#555", fontWeight: "900", letterSpacing: "0.08em" }}>SOON</span>
                  </div>
                </div>

              </div>
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#2a2a2a", lineHeight: "1.7" }}>
                  The coaching engine is trained on peer-reviewed biomechanics research, ITF coaching science, and professional match data — and gets sharper with every analysis.
                </p>
              </div>
            </div>

            {/* ── HERO ── */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1D9E7512", border: "1px solid #1D9E7525", borderRadius: "20px", padding: "5px 14px", marginBottom: "20px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.18em" }}>Free during beta</span>
              </div>
              <h1 style={{ fontSize: "clamp(38px,9vw,68px)", fontWeight: "900", letterSpacing: "-0.04em", lineHeight: 0.92, margin: "0 0 22px" }}>
                Your game<br />is leaking points.<br /><span style={{ color: "#1D9E75" }}>Find out where.</span>
              </h1>
              <p style={{ color: "#444", fontSize: "16px", lineHeight: "1.7", maxWidth: "400px", margin: "0 0 28px" }}>
                Upload your match video and get a full AI coaching report in minutes — technique breakdowns, tactical patterns, drills, and on-court cues.
              </p>

              {/* Social proof strip */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                {[
                  {
                    text: "Tennis Canada certified",
                    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#1D9E75" strokeWidth="1.2" fill="none"/><path d="M 2 7 Q 4.5 4 7 7 Q 9.5 10 12 7" stroke="#1D9E75" strokeWidth="1" fill="none"/><path d="M 2 7 Q 4.5 10 7 7 Q 9.5 4 12 7" stroke="#1D9E75" strokeWidth="1" fill="none"/></svg>
                  },
                  {
                    text: "AI coaching engine",
                    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="10" height="8" rx="2" stroke="#1D9E75" strokeWidth="1.2" fill="none"/><line x1="5" y1="3" x2="5" y2="1.5" stroke="#1D9E75" strokeWidth="1"/><line x1="9" y1="3" x2="9" y2="1.5" stroke="#1D9E75" strokeWidth="1"/><circle cx="5" cy="7" r="1" fill="#1D9E75"/><circle cx="9" cy="7" r="1" fill="#1D9E75"/><line x1="5" y1="7" x2="9" y2="7" stroke="#1D9E75" strokeWidth="0.8"/></svg>
                  },
                  {
                    text: "Report emailed to you",
                    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#1D9E75" strokeWidth="1.2" fill="none"/><path d="M 1 4 L 7 8 L 13 4" stroke="#1D9E75" strokeWidth="1" fill="none"/></svg>
                  },
                  {
                    text: "No account needed",
                    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="6" width="8" height="6" rx="1.5" stroke="#1D9E75" strokeWidth="1.2" fill="none"/><path d="M 4.5 6 V 4.5 A 2.5 2.5 0 0 1 9.5 4.5 V 6" stroke="#1D9E75" strokeWidth="1.2" fill="none"/><circle cx="7" cy="9" r="1" fill="#1D9E75"/></svg>
                  },
                ].map((b, i) => (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "5px 12px" }}>
                    {b.icon}
                    <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.02em" }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DROP ZONE ── */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#1D9E75" : "#1c1c1c"}`,
                borderRadius: "20px", padding: "48px 24px 44px", textAlign: "center",
                cursor: "pointer",
                background: dragging ? "#071a12" : "#080808",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(29,158,117,0.06), rgba(29,158,117,0.15), rgba(29,158,117,0.06), transparent)", animation: "courtScan 2.5s linear infinite", pointerEvents: "none" }}/>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #1D9E75, transparent)", animation: "courtScan 2.5s linear infinite", opacity: 0.6 }}/>
              <div style={{ fontSize: "48px", marginBottom: "14px", lineHeight: 1 }}>🎾</div>
              <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px", letterSpacing: "-0.02em", color: "#e0e0e0" }}>
                The ball never lies. Find out what yours has been saying.
              </div>
              <div style={{ color: "#2a2a2a", fontSize: "12px", marginBottom: "22px" }}>
                Best results: 10–20 min · 720p quality · MP4 or MOV
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1D9E75", color: "#060606", borderRadius: "10px", padding: "13px 32px", fontWeight: "900", fontSize: "14px", letterSpacing: "0.02em" }}>
                <span>↑</span> Choose video
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {error && error !== "ANALYSIS_ERROR" && (
              <div style={{ marginTop: "14px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                ⚠ {error}
              </div>
            )}

            {/* ── BETA STRIP ── */}
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", background: "#1D9E7508", border: "1px solid #1D9E7518", borderRadius: "10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
              <span style={{ fontSize: "11px", color: "#1D9E75", letterSpacing: "0.05em" }}>
                Free during beta · 2 analyses per email · No credit card required
              </span>
            </div>

            {/* ── MOCK REPORT PREVIEW ── */}
            <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "20px", marginTop: "20px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #1D9E75, transparent)", opacity: 0.4 }}/>
              <div style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "14px" }}>Example report preview</div>
              {/* Score row */}
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
              {/* Coach verdict preview */}
              <div style={{ background: "#0a0a0a", borderLeft: "2px solid #1D9E75", padding: "10px 14px", borderRadius: "0 8px 8px 0", marginBottom: "12px" }}>
                <div style={{ fontSize: "8px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>Coach verdict</div>
                <p style={{ margin: 0, fontSize: "12px", color: "#3a3a3a", fontStyle: "italic", lineHeight: "1.6" }}>"The arm is doing all the work while the body watches. Fix the unit turn first and everything downstream improves."</p>
              </div>
              {/* Top fixes preview */}
              <div style={{ fontSize: "8px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Top 3 fixes</div>
              {[
                { rank: 1, fix: "Establish a complete unit turn before every swing", cue: "Shoulder to net post before I swing" },
                { rank: 2, fix: "Begin recovery the instant the ball leaves your strings", cue: "Ball leaves strings, feet start moving" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px", opacity: i === 1 ? 0.5 : 1 }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: i === 0 ? "#1D9E75" : "#141414", border: `1px solid ${i === 0 ? "#1D9E75" : "#222"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", color: i === 0 ? "#060606" : "#333", flexShrink: 0 }}>{f.rank}</div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#555", marginBottom: "2px" }}>{f.fix}</div>
                    <div style={{ fontSize: "10px", color: "#1D9E75", fontStyle: "italic" }}>"{f.cue}"</div>
                  </div>
                </div>
              ))}
              {/* Blur overlay at bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(transparent, #080808)", borderRadius: "0 0 16px 16px" }}/>
              <div style={{ position: "absolute", bottom: "10px", left: 0, right: 0, textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1D9E7518", border: "1px solid #1D9E7530", borderRadius: "20px", padding: "4px 14px" }}>
                  <span style={{ fontSize: "10px", color: "#1D9E75" }}>Upload your video to unlock your real report</span>
                </div>
              </div>
            </div>



            {/* ── FEATURE GRID ── */}
            <FadeIn delay={0}>
            <div style={{ marginTop: "48px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>What you get</div>
                <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: "900", letterSpacing: "-0.03em", margin: 0 }}>
                  See your game the way<br />your coach does.
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

                {/* Biomechanics */}
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px 16px" }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="40" r="2.5" fill="#1D9E75" opacity="0.5"/>
                    <line x1="22" y1="40" x2="22" y2="30" stroke="#1D9E75" strokeWidth="1.5" opacity="0.5"/>
                    <circle cx="22" cy="30" r="2.5" fill="#1D9E75" opacity="0.65"/>
                    <line x1="22" y1="30" x2="22" y2="20" stroke="#1D9E75" strokeWidth="1.5" opacity="0.65"/>
                    <circle cx="22" cy="20" r="2.5" fill="#1D9E75" opacity="0.8"/>
                    <line x1="22" y1="20" x2="32" y2="13" stroke="#1D9E75" strokeWidth="1.5" opacity="0.8"/>
                    <circle cx="32" cy="13" r="2.5" fill="#1D9E75" opacity="0.9"/>
                    <ellipse cx="38" cy="8" rx="5" ry="7" fill="none" stroke="#1D9E75" strokeWidth="1.8"/>
                    <circle cx="22" cy="14" r="4" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.4"/>
                  </svg>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#ddd", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>Biomechanics breakdown</div>
                  <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>Contact point, unit turn, swing path, follow-through — per shot type, with the kinetic chain explained.</div>
                </div>

                {/* Tactical patterns */}
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px 16px" }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="4" y="4" width="36" height="36" rx="2" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.3"/>
                    <line x1="4" y1="22" x2="40" y2="22" stroke="#1D9E75" strokeWidth="1.5" opacity="0.5"/>
                    <line x1="22" y1="11" x2="22" y2="22" stroke="#1D9E75" strokeWidth="0.7" opacity="0.25"/>
                    <line x1="22" y1="22" x2="22" y2="33" stroke="#1D9E75" strokeWidth="0.7" opacity="0.25"/>
                    <line x1="4" y1="11" x2="40" y2="11" stroke="#1D9E75" strokeWidth="0.7" opacity="0.25"/>
                    <line x1="4" y1="33" x2="40" y2="33" stroke="#1D9E75" strokeWidth="0.7" opacity="0.25"/>
                    <line x1="36" y1="30" x2="10" y2="10" stroke="#1D9E75" strokeWidth="1.5" opacity="0.8"/>
                    <polygon points="10,10 16,12 12,16" fill="#1D9E75" opacity="0.8"/>
                    <line x1="8" y1="12" x2="34" y2="30" stroke="#1D9E75" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
                    <polygon points="34,30 28,28 32,24" fill="#1D9E75" opacity="0.5"/>
                  </svg>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#ddd", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>Tactical patterns</div>
                  <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>Court positioning, recovery habits, short ball response — the patterns costing you games every match.</div>
                </div>

                {/* Priority fixes */}
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px 16px" }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.25"/>
                    <circle cx="22" cy="22" r="12" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.45"/>
                    <circle cx="22" cy="22" r="6" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.7"/>
                    <circle cx="22" cy="22" r="2.5" fill="#1D9E75"/>
                    <line x1="38" y1="6" x2="26" y2="18" stroke="#1D9E75" strokeWidth="1.8"/>
                    <polygon points="26,18 30,12 34,16" fill="#1D9E75"/>
                  </svg>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#ddd", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>Priority fixes</div>
                  <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>Your top 3 root-cause fixes ranked by impact. Fix the upstream fault and multiple problems resolve.</div>
                </div>

                {/* Training plan */}
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "20px 16px" }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="8" y="10" width="28" height="32" rx="3" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.6"/>
                    <rect x="16" y="6" width="12" height="8" rx="2" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.6"/>
                    <line x1="14" y1="22" x2="30" y2="22" stroke="#1D9E75" strokeWidth="1" opacity="0.3"/>
                    <polyline points="14,22 17,25 22,19" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.9"/>
                    <line x1="14" y1="30" x2="30" y2="30" stroke="#1D9E75" strokeWidth="1" opacity="0.3"/>
                    <polyline points="14,30 17,33 22,27" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.6"/>
                    <line x1="14" y1="38" x2="28" y2="38" stroke="#1D9E75" strokeWidth="1" opacity="0.2"/>
                    <circle cx="15" cy="38" r="1.5" fill="none" stroke="#1D9E75" strokeWidth="1" opacity="0.3"/>
                  </svg>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#ddd", margin: "12px 0 8px", letterSpacing: "-0.01em" }}>Training plan</div>
                  <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>Two specific drills plus a match rule simple enough to hold in your head during a point.</div>
                </div>

              </div>
            </div>
            </FadeIn>

            {/* ── HOW IT WORKS ── */}
            <FadeIn delay={0}>
            <div style={{ marginTop: "48px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>How it works</div>
                <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: "900", letterSpacing: "-0.03em", margin: 0 }}>Three steps to your report.</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { n: "01", h: "Upload your match video", b: "Any length, any file size. MP4 or MOV from your phone. The coaching engine samples one frame every 30 seconds across the full match.", color: "#1D9E75" },
                  { n: "02", h: "AI analyzes your game", b: "The coaching engine reads biomechanics, identifies recurring patterns, and cross-references against club-level benchmarks. Takes 2–3 minutes.", color: "#60a5fa" },
                  { n: "03", h: "Get your full report", b: "Technique scores, top fixes, drills, on-court cues — displayed instantly and emailed to you so you can reference it on court.", color: "#a78bfa" },
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
            </div>
            </FadeIn>

            {/* ── FILMING GUIDE ── */}
            <FadeIn delay={0}>
            <div style={{ marginTop: "48px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "10px" }}>Before you film</div>
                <h2 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: "900", letterSpacing: "-0.03em", margin: 0 }}>How to film for best results.</h2>
              </div>
              {/* Technique card */}
              <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "18px", marginBottom: "10px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0 }}>
                  <svg width="90" height="140" viewBox="0 0 100 150" fill="none">
                    <rect x="18" y="8" width="64" height="118" rx="2" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.35"/>
                    <line x1="18" y1="67" x2="82" y2="67" stroke="#1D9E75" strokeWidth="1.8" opacity="0.7"/>
                    <line x1="18" y1="28" x2="82" y2="28" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="18" y1="106" x2="82" y2="106" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="50" y1="28" x2="50" y2="67" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="50" y1="67" x2="50" y2="106" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <circle cx="50" cy="92" r="4" fill="#fff" opacity="0.85"/>
                    <rect x="1" y="60" width="13" height="9" rx="2" fill="#1D9E75" opacity="0.9"/>
                    <circle cx="14" cy="64" r="2.5" fill="#1D9E75"/>
                    <line x1="14" y1="64" x2="50" y2="80" stroke="#1D9E75" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
                    <line x1="14" y1="64" x2="50" y2="106" stroke="#1D9E75" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.4"/>
                    <text x="50" y="142" fontFamily="Inter,sans-serif" fontSize="7" fill="#1D9E75" textAnchor="middle" opacity="0.55">SIDE · MID-COURT</text>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>For technique</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#e0e0e0", marginBottom: "6px" }}>Film from the side</div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#444", lineHeight: "1.7" }}>Position at mid-court, zoomed in to show waist-up. Captures swing shape, contact point, hip rotation, and follow-through on every shot.</p>
                </div>
              </div>

              {/* Tactics card */}
              <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "18px", marginBottom: "10px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0 }}>
                  <svg width="90" height="140" viewBox="0 0 100 150" fill="none">
                    <rect x="18" y="8" width="64" height="100" rx="2" fill="none" stroke="#1D9E75" strokeWidth="1.2" opacity="0.35"/>
                    <line x1="18" y1="58" x2="82" y2="58" stroke="#1D9E75" strokeWidth="1.8" opacity="0.7"/>
                    <line x1="18" y1="25" x2="82" y2="25" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="18" y1="91" x2="82" y2="91" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="50" y1="25" x2="50" y2="58" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="50" y1="58" x2="50" y2="91" stroke="#1D9E75" strokeWidth="0.7" opacity="0.3"/>
                    <circle cx="50" cy="80" r="4" fill="#fff" opacity="0.85"/>
                    <rect x="40" y="118" width="20" height="12" rx="2" fill="#1D9E75" opacity="0.9"/>
                    <circle cx="50" cy="130" r="3" fill="#1D9E75"/>
                    <line x1="50" y1="118" x2="18" y2="8" stroke="#1D9E75" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.3"/>
                    <line x1="50" y1="118" x2="82" y2="8" stroke="#1D9E75" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.3"/>
                    <text x="50" y="146" fontFamily="Inter,sans-serif" fontSize="7" fill="#1D9E75" textAnchor="middle" opacity="0.55">BEHIND BASELINE</text>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>For tactics</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#e0e0e0", marginBottom: "6px" }}>Film from behind</div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#444", lineHeight: "1.7" }}>Stand behind the baseline, wide angle showing the full court. Best for court positioning, recovery habits, and net approach patterns.</p>
                </div>
              </div>

              {/* Bottom row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Camera</div>
                  <svg width="80" height="58" viewBox="0 0 80 58" fill="none">
                    <rect x="30" y="4" width="14" height="22" rx="3" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.8"/>
                    <line x1="37" y1="15" x2="68" y2="34" stroke="#1D9E75" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
                    <polygon points="68,34 62,30 65,40" fill="#1D9E75" opacity="0.5"/>
                    <line x1="37" y1="26" x2="37" y2="44" stroke="#444" strokeWidth="1.5"/>
                    <line x1="37" y1="44" x2="25" y2="54" stroke="#444" strokeWidth="1"/>
                    <line x1="37" y1="44" x2="49" y2="54" stroke="#444" strokeWidth="1"/>
                    <line x1="10" y1="4" x2="10" y2="26" stroke="#222" strokeWidth="1"/>
                    <line x1="7" y1="4" x2="13" y2="4" stroke="#222" strokeWidth="1"/>
                    <line x1="7" y1="26" x2="13" y2="26" stroke="#222" strokeWidth="1"/>
                    <text x="1" y="17" fontFamily="Inter,sans-serif" fontSize="6" fill="#333">1.5m</text>
                  </svg>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#e0e0e0", margin: "8px 0 4px" }}>Camera position</div>
                  <p style={{ margin: 0, fontSize: "10px", color: "#444", lineHeight: "1.65" }}>1–1.5m high, slight downward angle. Tripod or fence. Keep it steady.</p>
                </div>
                <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ fontSize: "9px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Format</div>
                  <svg width="80" height="58" viewBox="0 0 80 58" fill="none">
                    <rect x="28" y="2" width="24" height="38" rx="4" fill="none" stroke="#1D9E75" strokeWidth="1.4" opacity="0.7"/>
                    <rect x="31" y="6" width="18" height="26" rx="1" fill="#0a0a0a" stroke="#1D9E75" strokeWidth="0.5" opacity="0.5"/>
                    <circle cx="40" cy="19" r="7" fill="none" stroke="#1D9E75" strokeWidth="1" opacity="0.7"/>
                    <line x1="40" y1="19" x2="40" y2="13" stroke="#1D9E75" strokeWidth="1.2" opacity="0.9"/>
                    <line x1="40" y1="19" x2="45" y2="19" stroke="#1D9E75" strokeWidth="1.2" opacity="0.9"/>
                  </svg>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#e0e0e0", margin: "8px 0 4px" }}>Length & format</div>
                  <p style={{ margin: 0, fontSize: "10px", color: "#444", lineHeight: "1.65" }}>10–20 min match play. 720p or 1080p MP4/MOV. No slow-mo.</p>
                </div>
              </div>
            </div>
            </FadeIn>

            {/* ── PRO WAITLIST SECTION ── */}
            <FadeIn delay={0}>
            <div style={{ marginTop: "48px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "28px 24px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1D9E7518", border: "1px solid #1D9E7530", borderRadius: "20px", padding: "4px 14px", marginBottom: "16px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.5s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.15em" }}>Coming soon</span>
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-0.02em", margin: "0 0 10px", color: "#e8e8e8" }}>
                Forty Fifteen gets smarter every match.
              </h3>
              <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#444", lineHeight: "1.7", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
                Every analysis sharpens the coaching engine — pattern recognition improves, benchmarks get more accurate, and new tactical frameworks get added continuously.
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#333", lineHeight: "1.7", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
                The brain behind Forty Fifteen is continuously trained on the best coaching science available — peer-reviewed biomechanics, ITF coaching publications, professional match pattern data, and real-world coaching methodology from certified professionals.
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#2a2a2a", lineHeight: "1.7" }}>
                Pro members get unlimited analyses, session history, progress tracking, coach sharing, and first access to every new capability as it launches.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                {/* Tennis pill */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1D9E7518", border: "1px solid #1D9E7530", borderRadius: "20px", padding: "6px 14px" }}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="#1D9E75" strokeWidth="2" fill="none"/>
                    <path d="M 6 20 Q 13 10 20 20 Q 27 30 34 20" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                    <path d="M 6 20 Q 13 30 20 20 Q 27 10 34 20" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <span style={{ fontSize: "11px", color: "#1D9E75" }}>Tennis</span>
                </div>
                {/* Padel pill */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "6px 14px" }}>
                  <svg width="12" height="16" viewBox="0 0 32 48" fill="none">
                    <path d="M 16 2 C 9 2 2 7 2 14 C 2 21 5 27 16 33 C 27 27 30 21 30 14 C 30 7 23 2 16 2 Z" stroke="#444" strokeWidth="2" fill="none"/>
                    <circle cx="10" cy="8"  r="1.3" fill="#444"/>
                    <circle cx="16" cy="7"  r="1.3" fill="#444"/>
                    <circle cx="22" cy="8"  r="1.3" fill="#444"/>
                    <circle cx="13" cy="14" r="1.3" fill="#444"/>
                    <circle cx="19" cy="14" r="1.3" fill="#444"/>
                    <circle cx="13" cy="20" r="1.3" fill="#444"/>
                    <circle cx="19" cy="20" r="1.3" fill="#444"/>
                    <path d="M 12 33 L 12 36 L 16 34.5 L 20 36 L 20 33" stroke="#444" strokeWidth="1.5" fill="none"/>
                    <rect x="13" y="36" width="6" height="9" rx="3" stroke="#444" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <span style={{ fontSize: "11px", color: "#333" }}>Padel</span>
                  <span style={{ fontSize: "9px", color: "#2a2a2a" }}>soon</span>
                </div>
                {/* Pickleball pill */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "6px 14px" }}>
                  <svg width="11" height="16" viewBox="0 0 32 48" fill="none">
                    <rect x="2" y="2" width="28" height="26" rx="8" stroke="#444" strokeWidth="2" fill="none"/>
                    <line x1="8"  y1="8"  x2="8"  y2="24" stroke="#333" strokeWidth="0.8" strokeLinecap="round"/>
                    <line x1="13" y1="6"  x2="13" y2="25" stroke="#333" strokeWidth="0.8" strokeLinecap="round"/>
                    <line x1="18" y1="6"  x2="18" y2="25" stroke="#333" strokeWidth="0.8" strokeLinecap="round"/>
                    <line x1="23" y1="8"  x2="23" y2="24" stroke="#333" strokeWidth="0.8" strokeLinecap="round"/>
                    <path d="M 10 28 C 10 30 13 32 16 32 C 19 32 22 30 22 28" stroke="#444" strokeWidth="1.5" fill="none"/>
                    <line x1="10" y1="28" x2="10" y2="32" stroke="#444" strokeWidth="1.5"/>
                    <line x1="22" y1="28" x2="22" y2="32" stroke="#444" strokeWidth="1.5"/>
                    <rect x="12" y="32" width="8" height="14" rx="4" stroke="#444" strokeWidth="1.5" fill="none"/>
                  </svg>
                  <span style={{ fontSize: "11px", color: "#333" }}>Pickleball</span>
                  <span style={{ fontSize: "9px", color: "#2a2a2a" }}>soon</span>
                </div>
              </div>
              <a href="https://tally.so/r/RG2pGj" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", background: "#1D9E75", color: "#060606", borderRadius: "10px", padding: "13px 28px", fontWeight: "900", fontSize: "14px", textDecoration: "none", letterSpacing: "0.01em" }}>
                Join the Pro waitlist →
              </a>
              <p style={{ margin: "12px 0 0", fontSize: "11px", color: "#1e1e1e" }}>
                Early members get founding pricing. No spam. One email when Pro launches.
              </p>
            </div>
            </FadeIn>

            {/* ── TRUST FOOTER ── */}
            <FadeIn delay={0}>
            <div style={{ marginTop: "32px", textAlign: "center", paddingBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#222", lineHeight: "1.9" }}>
                Made in Canada 🍁 by a Tennis Canada certified Club Pro<br />
                <span style={{ fontStyle: "italic", color: "#1a1a1a" }}>who got tired of guessing what was wrong with his game.</span>
              </p>
              <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#1e1e1e", lineHeight: "1.8" }}>
                Got a question? Even Federer asked his coach things.{" "}
                <a href="mailto:coach@fortyfifteen.app" style={{ color: "#1D9E75", textDecoration: "none", borderBottom: "1px solid #1D9E7540" }}>
                  coach@fortyfifteen.app
                </a>
              </p>
              <p style={{ margin: "12px 0 0", fontSize: "10px", color: "#141414", lineHeight: "1.6", letterSpacing: "0.04em" }}>
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
              <div style={{ marginTop: "12px", background: "#120808", border: "1px solid #2e1010", borderRadius: "12px", padding: "18px 20px" }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>🎾</div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#e8e8e8", marginBottom: "6px" }}>
                  Oops — your AI coach hit one into the net.
                </div>
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
                  Something went wrong during analysis. This is usually a one-time glitch — hit the button again and it should work.
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#333", lineHeight: "1.6" }}>
                  If this keeps happening, reach out at{" "}
                  <a href="mailto:coach@fortyfifteen.app" style={{ color: "#1D9E75", textDecoration: "none" }}>coach@fortyfifteen.app</a>
                  {" "}and we'll sort it out.
                </p>
              </div>
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
                  {framesTotal > 0 ? `${framesTotal} frames` : "Frames"} sent · Your digital coach is studying the film…
                </div>
              )}
              <p style={{ color: "#2a2a2a", fontSize: "12px", margin: "6px 0 0" }}>Keep this tab open and your screen unlocked — your report is being built</p>
              <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "#1a1000", border: "1px solid #2a1e00", borderRadius: "8px", padding: "7px 14px" }}>
                <span style={{ fontSize: "13px" }}>📱</span>
                <span style={{ fontSize: "11px", color: "#a07020" }}>On mobile: turn off auto-lock or keep tapping the screen</span>
              </div>
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
                <a href="https://tally.so/r/RG2pGj" target="_blank" rel="noopener noreferrer"
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
