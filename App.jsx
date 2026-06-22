import { useState, useRef, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
// In production this points to your Vercel backend proxy (see api/analyze.js)
// In development it calls the proxy locally
const API_URL = "/api/analyze";

const FRAME_INTERVAL = 30;
const FRAME_W = 640;
const FRAME_H = 360;
const FRAME_QUALITY = 0.72;
const MAX_FRAMES = 40;

// ─── Frame extractor (runs entirely in browser) ───────────────────────────────
function extractFrames(file, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    canvas.width = FRAME_W;
    canvas.height = FRAME_H;
    const ctx = canvas.getContext("2d");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      const duration = video.duration;
      const times = [];
      for (let t = 2; t < duration - 2; t += FRAME_INTERVAL) {
        times.push(parseFloat(t.toFixed(1)));
        if (times.length >= MAX_FRAMES) break;
      }
      if (duration > 10) times.push(parseFloat((duration - 3).toFixed(1)));

      const frames = [];
      let idx = 0;

      const grabNext = () => {
        if (idx >= times.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        video.currentTime = times[idx];
      };

      video.addEventListener("seeked", () => {
        ctx.drawImage(video, 0, 0, FRAME_W, FRAME_H);
        frames.push({
          base64: canvas.toDataURL("image/jpeg", FRAME_QUALITY).split(",")[1],
          timestamp: Math.round(times[idx]),
        });
        onProgress?.(Math.round(((idx + 1) / times.length) * 100));
        idx++;
        grabNext();
      });

      grabNext();
    });

    video.addEventListener("error", () => reject(new Error("Could not load video. Try MP4 or MOV format.")));
  });
}

// ─── Small components ─────────────────────────────────────────────────────────
const Ring = ({ score, color }) => {
  const r = 24, c = 2 * Math.PI * r;
  return (
    <svg width="62" height="62" viewBox="0 0 62 62">
      <circle cx="31" cy="31" r={r} fill="none" stroke="#1c1c1c" strokeWidth="5" />
      <circle cx="31" cy="31" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${(score / 10) * c} ${c}`} strokeLinecap="round"
        transform="rotate(-90 31 31)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="31" y="31" textAnchor="middle" dominantBaseline="central"
        fill="#fff" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">{score}</text>
    </svg>
  );
};

const Chip = ({ label, positive }) => (
  <span style={{
    background: positive ? "#0d1f0d" : "#1a0d0d",
    border: `1px solid ${positive ? "#1e3d1e" : "#3d1e1e"}`,
    color: positive ? "#5bc85b" : "#e05555",
    borderRadius: "20px", padding: "4px 12px",
    fontSize: "12px", display: "inline-block",
  }}>
    {positive ? "✓" : "✗"} {label}
  </span>
);

const ExpandCard = ({ title, subtitle, accent, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "10px", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 16px", display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", textAlign: "left", gap: "10px",
      }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#e8e8e8" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{subtitle}</div>}
        </div>
        <span style={{ color: accent, fontSize: "20px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
};

const InfoRow = ({ label, value, highlight, accent }) => (
  <div style={{
    background: highlight ? "#0c180c" : "#131313",
    border: `1px solid ${highlight ? "#1c3a1c" : "#1c1c1c"}`,
    borderRadius: "7px", padding: "10px 13px", marginBottom: "7px",
  }}>
    <div style={{ fontSize: "10px", color: highlight ? (accent || "#5bc85b") : "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{label}</div>
    <p style={{ margin: 0, fontSize: "13px", color: "#bbb", lineHeight: "1.65" }}>{value}</p>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Rallytics() {
  const [stage, setStage] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState("technique");
  const [extractPct, setExtractPct] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef();

  const fmt = s => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const estFrames = dur => Math.min(MAX_FRAMES, Math.floor(Math.max(0, dur - 4) / FRAME_INTERVAL) + 1);

  const handleFile = (file) => {
    if (!file?.type.startsWith("video/")) { setError("Please upload a video file — MP4 or MOV works best."); return; }
    setError(null);
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setStage("context");
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);

  const analyze = async () => {
    setStage("working");
    setExtractPct(0);
    setError(null);

    try {
      setStatusMsg("Extracting frames from your video…");
      const frames = await extractFrames(videoFile, pct => setExtractPct(pct));
      setFrameCount(frames.length);

      setStatusMsg(`Sending ${frames.length} frames to your AI coach…`);
      setExtractPct(100);

      const durationLabel = duration > 60 ? `${Math.round(duration / 60)}-minute` : `${Math.round(duration)}-second`;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: frames.map(f => f.base64),
          context: context.trim(),
          frameCount: frames.length,
          durationLabel,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setStage("result");

    } catch (err) {
      setError(err.message || "Analysis failed. Check your connection and try again.");
      setStage("context");
    }
  };

  const reset = () => {
    setStage("upload"); setVideoFile(null); setVideoUrl(null);
    setContext(""); setResult(null); setError(null);
    setExtractPct(0); setFrameCount(0); setDuration(0); setTab("technique");
  };

  const levelColor = l => {
    if (!l) return "#888";
    if (l.includes("Beginner")) return "#5bc85b";
    if (l.includes("Developing")) return "#a3e635";
    if (l.includes("Intermediate")) return "#f5c842";
    return "#f97316";
  };

  // Steps for the progress screen
  const steps = [
    { label: "Sample frames every 30 seconds", done: extractPct >= 30 },
    { label: "Compress & resize each frame", done: extractPct >= 70 },
    { label: "Send frame sequence to AI coach", done: extractPct >= 100 },
    { label: "Pattern analysis across full match", done: stage === "result" },
    { label: "Build your coaching report", done: stage === "result" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Inter','Helvetica Neue',sans-serif", color: "#f0f0f0" }}>
      <style>{`
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::placeholder { color: #333; }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #111", padding: "0 20px", height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#080808", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {/* Logo mark — two arcs like a rally path */}
          <svg width="26" height="26" viewBox="0 0 26 26">
            <circle cx="13" cy="13" r="12" fill="none" stroke="#e8ff3a" strokeWidth="2" />
            <path d="M5 18 Q10 6 21 8" stroke="#e8ff3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "-0.02em" }}>
            Rally<span style={{ color: "#e8ff3a" }}>tics</span>
          </span>
        </div>
        {!["upload", "working"].includes(stage) && (
          <button onClick={reset} style={{ background: "none", border: "1px solid #1e1e1e", borderRadius: "6px", color: "#555", fontSize: "12px", padding: "6px 14px", cursor: "pointer" }}>
            New match
          </button>
        )}
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 18px 80px" }}>

        {/* ── UPLOAD ── */}
        {stage === "upload" && (
          <>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "11px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "10px" }}>AI Match Analysis</div>
              <h1 style={{ fontSize: "clamp(28px,7vw,46px)", fontWeight: "800", letterSpacing: "-0.025em", lineHeight: 1.06, margin: "0 0 14px" }}>
                Your match.<br />Every pattern.<br /><span style={{ color: "#e8ff3a" }}>Coached.</span>
              </h1>
              <p style={{ color: "#4a4a4a", fontSize: "14px", lineHeight: "1.6", maxWidth: "400px", margin: 0 }}>
                Upload 10–20 minutes of play. Rallytics samples a frame every 30 seconds, spots your recurring habits, and gives you a real coaching breakdown — technique and strategy.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragging ? "#e8ff3a" : "#1e1e1e"}`,
                borderRadius: "14px", padding: "52px 20px", textAlign: "center",
                cursor: "pointer", background: dragging ? "#0e1100" : "#0b0b0b",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "14px", lineHeight: 1 }}>🎾</div>
              <div style={{ fontWeight: "700", fontSize: "17px", marginBottom: "6px" }}>Drop your match video here</div>
              <div style={{ color: "#444", fontSize: "13px", marginBottom: "22px" }}>MP4 or MOV · any file size · no account needed</div>
              <div style={{ display: "inline-block", background: "#e8ff3a", color: "#080808", borderRadius: "8px", padding: "11px 30px", fontWeight: "800", fontSize: "14px", letterSpacing: "0.01em" }}>
                Choose video
              </div>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

            {error && <div style={{ marginTop: "14px", background: "#160808", border: "1px solid #3a1414", borderRadius: "8px", padding: "12px 16px", color: "#e05555", fontSize: "13px" }}>{error}</div>}

            {/* How it works */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "32px" }}>
              {[
                { icon: "📹", h: "Any length", b: "10–20 min matches work best. No compression before uploading." },
                { icon: "🔬", h: "Frame sampling", b: "1 frame every 30s finds patterns, not just one moment." },
                { icon: "🎯", h: "Full breakdown", b: "Technique skull + strategy patterns + top 3 fixes." },
              ].map(c => (
                <div key={c.h} style={{ background: "#0b0b0b", border: "1px solid #141414", borderRadius: "10px", padding: "16px 14px" }}>
                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>{c.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "4px", color: "#ddd" }}>{c.h}</div>
                  <div style={{ fontSize: "12px", color: "#444", lineHeight: "1.5" }}>{c.b}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CONTEXT ── */}
        {stage === "context" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: "6px" }}>Video ready</div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.015em", margin: "0 0 4px" }}>Anything I should know?</h2>
              <p style={{ color: "#444", fontSize: "13px", margin: 0 }}>Optional — but specific context means sharper feedback.</p>
            </div>

            <video src={videoUrl} controls playsInline
              style={{ width: "100%", borderRadius: "10px", background: "#000", maxHeight: "230px", objectFit: "contain", marginBottom: "14px" }}
              onLoadedMetadata={e => setDuration(e.target.duration)} />

            {duration > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "14px" }}>
                {[
                  { l: "Video length", v: fmt(duration) },
                  { l: "Frames to extract", v: `~${estFrames(duration)}` },
                  { l: "Data sent to AI", v: `~${estFrames(duration) * 40}KB` },
                ].map(s => (
                  <div key={s.l} style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{s.l}</div>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#e8ff3a" }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. I keep losing points from the baseline under pressure. Playing a pusher. Focus on my backhand."
              style={{ width: "100%", minHeight: "76px", background: "#0e0e0e", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "13px 14px", color: "#f0f0f0", fontSize: "14px", lineHeight: "1.6", resize: "vertical", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#e8ff3a"}
              onBlur={e => e.target.style.borderColor = "#1e1e1e"} />

            {error && <div style={{ marginTop: "10px", background: "#160808", border: "1px solid #3a1414", borderRadius: "8px", padding: "12px 16px", color: "#e05555", fontSize: "13px" }}>{error}</div>}

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button onClick={reset} style={{ flex: 1, background: "none", border: "1px solid #1e1e1e", borderRadius: "8px", color: "#555", fontSize: "14px", padding: "13px", cursor: "pointer" }}>← Change video</button>
              <button onClick={analyze} style={{ flex: 2, background: "#e8ff3a", border: "none", borderRadius: "8px", color: "#080808", fontSize: "15px", fontWeight: "800", padding: "13px", cursor: "pointer", letterSpacing: "-0.01em" }}>
                Analyze full match →
              </button>
            </div>
          </>
        )}

        {/* ── WORKING ── */}
        {stage === "working" && (
          <div style={{ paddingTop: "20px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: "8px", animation: "pulse 2s infinite" }}>
                Processing
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.015em", margin: "0 0 6px" }}>{statusMsg}</h2>
              <p style={{ color: "#444", fontSize: "13px", margin: 0 }}>This takes 20–40 seconds for a full match video.</p>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#141414", borderRadius: "4px", height: "5px", overflow: "hidden", marginBottom: "28px" }}>
              <div style={{ height: "100%", background: "#e8ff3a", borderRadius: "4px", width: `${extractPct}%`, transition: "width 0.5s ease" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                    background: s.done ? "#e8ff3a" : "#141414",
                    border: `1px solid ${s.done ? "#e8ff3a" : "#2a2a2a"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#080808", fontWeight: "800",
                    transition: "all 0.3s",
                  }}>
                    {s.done ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: "13px", color: s.done ? "#aaa" : "#333" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {stage === "result" && result && (() => {
          const tech = result.technique || {};
          const strat = result.strategy || {};
          const lc = levelColor(result.player_level);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Header card */}
              <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "7px" }}>
                      {result.frames_analyzed || frameCount} frames · {fmt(duration)}
                    </div>
                    <span style={{ background: lc + "18", color: lc, border: `1px solid ${lc}40`, borderRadius: "6px", padding: "5px 14px", fontSize: "13px", fontWeight: "700" }}>
                      {result.player_level}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "14px" }}>
                    <div style={{ textAlign: "center" }}>
                      <Ring score={tech.score || 5} color="#60a5fa" />
                      <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>Technique</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <Ring score={strat.score || 5} color="#f59e0b" />
                      <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>Strategy</div>
                    </div>
                  </div>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#bbb", lineHeight: "1.7" }}>{result.match_overview}</p>
                {result.coach_verdict && (
                  <div style={{ borderLeft: "3px solid #e8ff3a", paddingLeft: "12px" }}>
                    <span style={{ fontSize: "10px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Coach says  </span>
                    <span style={{ fontSize: "13px", color: "#777", fontStyle: "italic" }}>"{result.coach_verdict}"</span>
                  </div>
                )}
              </div>

              {/* Priority fixes */}
              {result.priority_fixes?.length > 0 && (
                <div style={{ background: "#0b1300", border: "1px solid #182000", borderRadius: "12px", padding: "18px 20px" }}>
                  <div style={{ fontSize: "11px", color: "#e8ff3a", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: "14px" }}>Top 3 fixes</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {result.priority_fixes.map(p => (
                      <div key={p.rank} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{
                          width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                          background: p.rank === 1 ? "#e8ff3a" : "#161616",
                          color: p.rank === 1 ? "#080808" : "#555",
                          border: `1px solid ${p.rank === 1 ? "#e8ff3a" : "#2a2a2a"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: "800",
                        }}>{p.rank}</div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#e0e0e0", marginBottom: "2px" }}>{p.fix}</div>
                          {p.why && <div style={{ fontSize: "12px", color: "#4a4a4a" }}>{p.why}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { id: "technique", label: "🎯 Technique", ac: "#60a5fa", ab: "#0c1826", ab2: "#1e3a5a" },
                  { id: "strategy", label: "🧠 Strategy", ac: "#f59e0b", ab: "#1a1400", ab2: "#3d3000" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, padding: "11px 8px",
                    background: tab === t.id ? t.ab : "#0e0e0e",
                    border: `1px solid ${tab === t.id ? t.ab2 : "#1a1a1a"}`,
                    borderRadius: "8px", color: tab === t.id ? t.ac : "#444",
                    fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s",
                  }}>{t.label}</button>
                ))}
              </div>

              {/* Technique tab */}
              {tab === "technique" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Strengths */}
                  {tech.strengths?.length > 0 && (
                    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "10px", padding: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>What's working</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                        {tech.strengths.map((s, i) => <Chip key={i} label={s} positive />)}
                      </div>
                    </div>
                  )}

                  {/* Shot breakdown */}
                  {tech.shot_breakdown && (
                    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "10px", padding: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Shot-by-shot skull</div>
                      {Object.entries(tech.shot_breakdown).map(([k, v]) => (
                        <InfoRow key={k} label={k} value={v} accent="#60a5fa" />
                      ))}
                    </div>
                  )}

                  {/* Patterns */}
                  {tech.patterns?.length > 0 && (
                    <>
                      <div style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recurring patterns</div>
                      {tech.patterns.map((p, i) => (
                        <ExpandCard key={i} title={p.pattern} subtitle={p.frequency} accent="#60a5fa">
                          <InfoRow label="What I see" value={p.what_it_looks_like} />
                          {p.root_cause && <InfoRow label="Root cause" value={p.root_cause} />}
                          <InfoRow label="Impact" value={p.impact} />
                          <InfoRow label="Fix" value={p.fix} highlight accent="#5bc85b" />
                          {p.drill && <InfoRow label="Drill" value={p.drill} accent="#818cf8" />}
                        </ExpandCard>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Strategy tab */}
              {tab === "strategy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {strat.strengths?.length > 0 && (
                    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "10px", padding: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>What's working</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                        {strat.strengths.map((s, i) => <Chip key={i} label={s} positive />)}
                      </div>
                    </div>
                  )}
                  {strat.headline && (
                    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "10px", padding: "14px 16px" }}>
                      <div style={{ fontSize: "11px", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Playing style</div>
                      <div style={{ fontWeight: "700", fontSize: "16px" }}>{strat.headline}</div>
                    </div>
                  )}
                  {strat.patterns?.map((p, i) => (
                    <ExpandCard key={i} title={p.pattern} subtitle={p.frequency} accent="#f59e0b">
                      <InfoRow label="What I see" value={p.what_it_looks_like} />
                      <InfoRow label="Impact" value={p.impact} />
                      <InfoRow label="Fix" value={p.fix} highlight accent="#5bc85b" />
                    </ExpandCard>
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
