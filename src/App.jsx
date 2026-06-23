import { useState, useRef, useCallback } from "react";

const API_URL = "/api/analyze";
const FRAME_INTERVAL = 30;
const FRAME_W = 640;
const FRAME_H = 360;
const FRAME_QUALITY = 0.72;
const MAX_FRAMES = 40;

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
        onProgress?.(Math.round(((idx + 1) / times.length) * 100));
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
const CourtLine = ({ color = "#e8ff3a" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }}/>
    <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}/>
  </div>
);

// ── Section Label ──────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color = "#e8ff3a", icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
    {icon && <span style={{ fontSize: "22px" }}>{icon}</span>}
    <span style={{ fontSize: "10px", color, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: "700" }}>{children}</span>
  </div>
);

// ── Expand Panel ───────────────────────────────────────────────────────────────
const Panel = ({ title, badge, accent = "#e8ff3a", children }) => {
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
          {badge && (
            <div style={{ width: "4px", height: "36px", borderRadius: "2px", background: accent, flexShrink: 0 }}/>
          )}
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
        <div style={{ background: "#0a0a0a", padding: "0 18px 18px", borderTop: `1px solid #141414` }}>
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

// ── Main App ───────────────────────────────────────────────────────────────────
export default function Rallytics() {
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
  const [frameCount, setFrameCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  // Email gate
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [gateError, setGateError] = useState("");
  const fileRef = useRef();

  const fmt = s => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const estFrames = d => Math.min(MAX_FRAMES, Math.floor(Math.max(0, d - 4) / FRAME_INTERVAL) + 1);

  const handleFile = f => {
    if (!f?.type.startsWith("video/")) { setError("Please upload a video file — MP4 or MOV works best."); return; }
    setError(null); setVideoFile(f); setVideoUrl(URL.createObjectURL(f)); setStage("context");
  };

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);

  // After context screen — show email gate before analysis
  const proceedToGate = () => {
    setGateError("");
    setStage("gate");
  };

  // Validate gate then start analysis
  const proceedToAnalysis = () => {
    if (!firstName.trim()) { setGateError("Please enter your first name."); return; }
    if (!email.trim() || !email.includes("@")) { setGateError("Please enter a valid email address."); return; }
    if (!level) { setGateError("Please select your playing level."); return; }
    setGateError("");
    analyze();
  };

  const analyze = async () => {
    setStage("working"); setPct(0); setError(null);
    try {
      setStatusMsg("Extracting frames from your video…");
      const frames = await extractFrames(videoFile, p => setPct(p));
      setFrameCount(frames.length);
      setStatusMsg(`Sending ${frames.length} frames to your AI coach…`);
      setPct(100);
      const dLabel = duration > 60 ? `${Math.round(duration / 60)}-minute` : `${Math.round(duration)}-second`;
      const res = await fetch(API_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames: frames.map(f => f.base64), context: context.trim(), playerId: playerId.trim(), frameCount: frames.length, durationLabel: dLabel, firstName: firstName.trim(), email: email.trim(), level }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`); }
      setResult(await res.json());
      setStage("result");
    } catch (e) {
      setError(e.message || "Analysis failed. Try again."); setStage("context");
    }
  };

  const reset = () => {
    setStage("upload"); setVideoFile(null); setVideoUrl(null); setContext(""); setPlayerId(""); setResult(null);
    setError(null); setPct(0); setFrameCount(0); setDuration(0); setTab("technique");
    setFirstName(""); setEmail(""); setLevel(""); setGateError("");
  };

  const lc = l => !l ? "#888" : l.includes("Beginner") ? "#5bc85b" : l.includes("Developing") ? "#a3e635" : l.includes("Intermediate") ? "#f5c842" : "#f97316";

  const steps = [
    { label: "Sample frames every 30 seconds", done: pct >= 30 },
    { label: "Compress & resize frames", done: pct >= 70 },
    { label: "Send sequence to AI coach", done: pct >= 100 },
    { label: "Pattern analysis across full match", done: stage === "result" },
    { label: "Build your coaching report", done: stage === "result" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060606", fontFamily: "'Inter','Helvetica Neue',sans-serif", color: "#f0f0f0" }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        button:focus-visible { outline: 2px solid #e8ff3a; outline-offset: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes courtScan { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
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
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="13" stroke="#e8ff3a" strokeWidth="2"/>
            <circle cx="15" cy="15" r="13" stroke="#e8ff3a" strokeWidth="2" strokeDasharray="4 3" opacity="0.3"/>
            <path d="M6 21 Q12 5 24 9" stroke="#e8ff3a" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: "900", fontSize: "17px", letterSpacing: "-0.03em" }}>
            Rally<span style={{ color: "#e8ff3a" }}>tics</span>
          </span>
        </div>
        {!["upload","working"].includes(stage) && (
          <button onClick={reset} style={{
            background: "none", border: "1px solid #1e1e1e", borderRadius: "8px",
            color: "#555", fontSize: "12px", padding: "7px 16px", cursor: "pointer",
            letterSpacing: "0.04em", transition: "border-color 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#e8ff3a"; e.target.style.color = "#e8ff3a"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#1e1e1e"; e.target.style.color = "#555"; }}
          >
            ← New match
          </button>
        )}
      </nav>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 100px" }}>

        {/* ══════════════════ UPLOAD ══════════════════ */}
        {stage === "upload" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Hero */}
            <div style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e8ff3a", boxShadow: "0 0 10px #e8ff3a" }}/>
                <span style={{ fontSize: "10px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.2em" }}>AI Match Analysis</span>
              </div>
              <h1 style={{ fontSize: "clamp(36px,8vw,64px)", fontWeight: "900", letterSpacing: "-0.035em", lineHeight: 0.95, margin: "0 0 20px" }}>
                Your game<br />is leaking points.<br /><span style={{ color: "#e8ff3a" }}>Find out where.</span>
              </h1>
              <p style={{ color: "#3a3a3a", fontSize: "15px", lineHeight: "1.7", maxWidth: "340px", margin: 0 }}>
                Upload your match. Get your technique and tactics broken down by AI — shot by shot, pattern by pattern.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#e8ff3a" : "#1c1c1c"}`,
                borderRadius: "20px", padding: "64px 24px 56px", textAlign: "center",
                cursor: "pointer", background: dragging ? "#0c1000" : "#080808",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
            >
              {/* Animated court line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, transparent, #e8ff3a, transparent)",
                animation: dragging ? "none" : "courtScan 3s linear infinite",
                opacity: 0.4,
              }}/>

              <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>🎾</div>
              <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                Film don't lie. Neither does your technique.
              </div>
              <div style={{ color: "#2e2e2e", fontSize: "13px", marginBottom: "6px" }}>
                Technique. Tactics. Patterns. All in one report.
              </div>
              <div style={{ color: "#1e1e1e", fontSize: "11px", marginBottom: "28px" }}>
                MP4 or MOV · any file size · no account needed
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#e8ff3a", color: "#060606", borderRadius: "10px",
                padding: "13px 32px", fontWeight: "900", fontSize: "14px",
                letterSpacing: "0.02em",
              }}>
                <span style={{ fontSize: "16px" }}>↑</span> Choose video
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {error && (
              <div style={{ marginTop: "16px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                ⚠ {error}
              </div>
            )}

            <CourtLine />

            {/* How to film */}
            <SectionLabel icon="📹" color="#e8ff3a">How to film yourself</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "32px" }}>
              <FilmCard emoji="📱" title="Camera position"
                body="Back fence, 1–2 metres high, angled slightly down. Film from behind one baseline for the clearest view of stance, contact point, and court position." />
              <FilmCard emoji="⏱️" title="Length & format"
                body="10–20 minutes ideal. iPhone users: Settings → Camera → Formats → Most Compatible to record as MP4. Any file size works — no compression needed." />
              <FilmCard emoji="🎾" title="What to record"
                body="Full practice match or 15+ minutes of real rallying. Include points, not just warmup groundstrokes — strategy patterns need full points to read." />
              <FilmCard emoji="☀️" title="Lighting"
                body="Good daylight or bright indoor lights. Avoid backlit setups (sun behind the player). Standard video mode — not slow-mo, not portrait mode." />
            </div>

            <CourtLine />

            {/* How it works */}
            <SectionLabel icon="🔬" color="#e8ff3a">How the analysis works</SectionLabel>
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
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#e8ff3a", letterSpacing: "-0.02em" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Player ID field */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
                Which player should I analyze?
              </div>
              <input
                value={playerId} onChange={e => setPlayerId(e.target.value)}
                placeholder="e.g. Red shirt, black shorts, far side of the court — leave blank if it's only you in the video"
                style={{
                  width: "100%", background: "#080808",
                  border: "1px solid #1a1a1a", borderRadius: "12px",
                  padding: "13px 16px", color: "#f0f0f0", fontSize: "14px",
                  lineHeight: "1.5", outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#e8ff3a"}
                onBlur={e => e.target.style.borderColor = "#1a1a1a"}
              />
            </div>

            {/* Context field */}
            <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
              Anything else I should know? <span style={{ color: "#2a2a2a" }}>(optional)</span>
            </div>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. My backhand keeps going wide under pressure. Playing against a big server. Focus on my serve and net approach."
              style={{
                width: "100%", minHeight: "80px", background: "#080808",
                border: "1px solid #1a1a1a", borderRadius: "12px",
                padding: "14px 16px", color: "#f0f0f0", fontSize: "14px",
                lineHeight: "1.7", resize: "vertical", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#e8ff3a"}
              onBlur={e => e.target.style.borderColor = "#1a1a1a"} />

            {error && (
              <div style={{ marginTop: "12px", background: "#120808", border: "1px solid #2e1010", borderRadius: "10px", padding: "14px 18px", color: "#e05555", fontSize: "13px" }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={reset} style={{
                flex: 1, background: "none", border: "1px solid #1a1a1a", borderRadius: "10px",
                color: "#3a3a3a", fontSize: "14px", padding: "14px", cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.target.style.borderColor = "#333"}
                onMouseLeave={e => e.target.style.borderColor = "#1a1a1a"}
              >← Change video</button>
              <button onClick={proceedToGate} style={{
                flex: 3, background: "#e8ff3a", border: "none", borderRadius: "10px",
                color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px",
                cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.target.style.opacity = "0.88"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
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
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e8ff3a", boxShadow: "0 0 10px #e8ff3a" }}/>
                <span style={{ fontSize: "10px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.2em" }}>Almost there</span>
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.025em", margin: "0 0 8px" }}>
                Where should we send your report?
              </h2>
              <p style={{ color: "#3a3a3a", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                Your full coaching report will be emailed to you instantly so you can reference it on court. We respect your inbox — no spam, ever. Unsubscribe anytime with one click.
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* First name */}
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>First name</div>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. William"
                  style={{
                    width: "100%", background: "#080808", border: "1px solid #1a1a1a",
                    borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0",
                    fontSize: "15px", outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#e8ff3a"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
              </div>

              {/* Email */}
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>Email address</div>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="e.g. you@gmail.com"
                  style={{
                    width: "100%", background: "#080808", border: "1px solid #1a1a1a",
                    borderRadius: "12px", padding: "14px 16px", color: "#f0f0f0",
                    fontSize: "15px", outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#e8ff3a"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"} />
              </div>

              {/* Playing level */}
              <div>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Your playing level</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                  {[
                    { id: "beginner", label: "Beginner", sub: "Just starting out" },
                    { id: "intermediate", label: "Intermediate", sub: "Club / league player" },
                    { id: "advanced", label: "Advanced", sub: "Competitive / tournament" },
                  ].map(l => (
                    <button key={l.id} onClick={() => setLevel(l.id)} style={{
                      background: level === l.id ? "#e8ff3a" : "#080808",
                      border: `1px solid ${level === l.id ? "#e8ff3a" : "#1a1a1a"}`,
                      borderRadius: "10px", padding: "14px 10px", cursor: "pointer",
                      textAlign: "center", transition: "all 0.18s",
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

            {/* Privacy note */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "16px", padding: "12px 14px", background: "#080808", border: "1px solid #111", borderRadius: "10px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🔒</span>
              <p style={{ margin: 0, fontSize: "12px", color: "#2e2e2e", lineHeight: "1.6" }}>
                Your email is used only to send your coaching report. We will never share your data or send unsolicited emails. Every email includes a one-click unsubscribe link.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setStage("context")} style={{
                flex: 1, background: "none", border: "1px solid #1a1a1a", borderRadius: "10px",
                color: "#3a3a3a", fontSize: "14px", padding: "14px", cursor: "pointer",
              }}>← Back</button>
              <button onClick={proceedToAnalysis} style={{
                flex: 3, background: "#e8ff3a", border: "none", borderRadius: "10px",
                color: "#060606", fontSize: "15px", fontWeight: "900", padding: "14px",
                cursor: "pointer", letterSpacing: "-0.01em", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.target.style.opacity = "0.88"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Analyze my match →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════ WORKING ══════════════════ */}
        {stage === "working" && (
          <div style={{ animation: "fadeUp 0.3s ease", paddingTop: "20px" }}>
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e8ff3a", animation: "pulse 1.5s infinite" }}/>
                <span style={{ fontSize: "10px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.2em" }}>Processing</span>
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-0.025em", margin: "0 0 8px" }}>{statusMsg}</h2>
              <p style={{ color: "#2e2e2e", fontSize: "13px", margin: 0 }}>20–40 seconds for a full match. Do not close this tab.</p>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#0e0e0e", borderRadius: "4px", height: "3px", overflow: "hidden", marginBottom: "36px" }}>
              <div style={{ height: "100%", background: "#e8ff3a", borderRadius: "4px", width: `${pct}%`, transition: "width 0.6s ease", boxShadow: "0 0 8px #e8ff3a" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                    background: s.done ? "#e8ff3a" : "#0e0e0e",
                    border: `1px solid ${s.done ? "#e8ff3a" : "#1e1e1e"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#060606", fontWeight: "900",
                    transition: "all 0.4s", boxShadow: s.done ? "0 0 12px #e8ff3a66" : "none",
                  }}>
                    {s.done ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "14px", color: s.done ? "#bbb" : "#252525", transition: "color 0.4s" }}>{s.label}</span>
                </div>
              ))}
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
                    {result.frames_analyzed || frameCount} frames · {fmt(duration)}
                  </span>
                </div>

                {/* Level badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: lcolor + "14", border: `1px solid ${lcolor}30`, borderRadius: "8px", padding: "6px 16px", marginBottom: "20px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: lcolor }}/>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: lcolor, letterSpacing: "0.04em" }}>{result.player_level}</span>
                </div>

                <p style={{ fontSize: "15px", color: "#888", lineHeight: "1.75", margin: "0 0 20px", maxWidth: "580px" }}>
                  {result.match_overview}
                </p>

                {/* Score arcs */}
                <div style={{ display: "flex", gap: "28px", marginBottom: "20px" }}>
                  <ScoreArc score={tech.score || 5} label="Technique" color="#60a5fa" />
                  <ScoreArc score={strat.score || 5} label="Strategy" color="#f59e0b" />
                </div>

                {/* Coach verdict */}
                {result.coach_verdict && (
                  <div style={{
                    background: "#080808", borderLeft: "3px solid #e8ff3a",
                    borderRadius: "0 10px 10px 0", padding: "16px 20px",
                  }}>
                    <div style={{ fontSize: "9px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>Coach verdict</div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#777", fontStyle: "italic", lineHeight: "1.65" }}>"{result.coach_verdict}"</p>
                  </div>
                )}
              </div>

              <CourtLine />

              {/* ── Priority Fixes ── */}
              {result.priority_fixes?.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <SectionLabel icon="⚡" color="#e8ff3a">Top 3 fixes</SectionLabel>
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
                          background: p.rank === 1 ? "#e8ff3a" : "#0e0e0e",
                          color: p.rank === 1 ? "#060606" : "#2e2e2e",
                          border: `1px solid ${p.rank === 1 ? "#e8ff3a" : "#1a1a1a"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: "900",
                        }}>{p.rank}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#e0e0e0", marginBottom: "4px", lineHeight: "1.4" }}>{p.fix}</div>
                          {p.why && <div style={{ fontSize: "12px", color: "#3a3a3a", marginBottom: p.on_court_cue ? "8px" : 0 }}>{p.why}</div>}
                          {p.on_court_cue && (
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "8px 12px", display: "inline-block" }}>
                              <span style={{ fontSize: "9px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.15em" }}>Say on court: </span>
                              <span style={{ fontSize: "12px", color: "#e8ff3a", fontStyle: "italic", fontWeight: "600" }}>"{p.on_court_cue}"</span>
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
                    background: tab === t.id ? "#e8ff3a" : "#080808",
                    border: `1px solid ${tab === t.id ? "#e8ff3a" : "#141414"}`,
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
                          <div key={i} style={{ background: "#0b180b", border: "1px solid #1a3a1a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>
                            ✓ {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tech.shot_breakdown && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="🔬" color="#60a5fa">Shot-by-shot breakdown</SectionLabel>
                      {Object.entries(tech.shot_breakdown).map(([k, v]) => (
                        <Block key={k} label={k.replace(/_/g, " ")} value={v} />
                      ))}
                    </div>
                  )}

                  {tech.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#e8ff3a">Recurring patterns</SectionLabel>
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
                          <div key={i} style={{ background: "#0b180b", border: "1px solid #1a3a1a", borderRadius: "6px", padding: "7px 14px", fontSize: "13px", color: "#5bc85b", fontWeight: "600" }}>
                            ✓ {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strat.patterns?.length > 0 && (
                    <div>
                      <SectionLabel color="#e8ff3a">Tactical patterns</SectionLabel>
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
                        <div style={{ fontSize: "9px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "6px" }}>Match rule</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#bbb", lineHeight: "1.65" }}>{result.training_plan.match_focus}</p>
                      </div>
                    )}
                  </div>

                  {/* On-court cues */}
                  {result.priority_fixes?.some(p => p.on_court_cue) && (
                    <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "18px" }}>
                      <SectionLabel icon="💬" color="#e8ff3a">On-court cues</SectionLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {result.priority_fixes.filter(p => p.on_court_cue).map(p => (
                          <div key={p.rank} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                              background: p.rank === 1 ? "#e8ff3a" : "#0e0e0e",
                              color: p.rank === 1 ? "#060606" : "#333",
                              border: `1px solid ${p.rank === 1 ? "#e8ff3a" : "#1a1a1a"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px", fontWeight: "900",
                            }}>{p.rank}</div>
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 14px", flex: 1 }}>
                              <p style={{ margin: 0, fontSize: "14px", color: "#e8ff3a", fontStyle: "italic", fontWeight: "700" }}>"{p.on_court_cue}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drills */}
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

            </div>
          );
        })()}
      </main>
    </div>
  );
}
