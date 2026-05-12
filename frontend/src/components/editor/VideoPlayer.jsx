import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

function fmt(t) {
  if (!t && t !== 0) return "00:00.00";
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(2).padStart(5, "0");
  return `${m.toString().padStart(2, "0")}:${s}`;
}

export default function VideoPlayer({ videoRef, src, outputSrc, onTime, onDuration, editPlan }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const containerRef = useRef(null);

  const activeSrc = showOutput && outputSrc ? outputSrc : src;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onT = () => { setTime(v.currentTime); onTime?.(v.currentTime); };
    const onD = () => { setDuration(v.duration || 0); onDuration?.(v.duration || 0); };
    const onP = () => setPlaying(true);
    const onPa = () => setPlaying(false);
    v.addEventListener("timeupdate", onT);
    v.addEventListener("loadedmetadata", onD);
    v.addEventListener("play", onP);
    v.addEventListener("pause", onPa);
    return () => {
      v.removeEventListener("timeupdate", onT);
      v.removeEventListener("loadedmetadata", onD);
      v.removeEventListener("play", onP);
      v.removeEventListener("pause", onPa);
    };
  }, [videoRef, onTime, onDuration, activeSrc]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const aspectClass = (() => {
    if (!editPlan) return "aspect-video";
    if (editPlan.aspect_ratio === "9:16") return "aspect-[9/16]";
    if (editPlan.aspect_ratio === "1:1") return "aspect-square";
    if (editPlan.aspect_ratio === "16:9") return "aspect-video";
    return "aspect-video";
  })();

  // Find active text overlay
  const activeOverlay = (editPlan?.text_overlays || []).find(
    (o) => time >= o.start && time <= o.end
  );

  return (
    <main className="flex-1 bg-obsidian flex flex-col min-w-0" data-testid="video-player-panel">
      <div className="h-10 px-4 border-b border-line flex items-center justify-between">
        <span className="uppercase-label">Preview</span>
        <div className="flex items-center gap-3">
          <span className="mono text-[11px] text-zinc-500">
            {editPlan?.aspect_ratio?.toUpperCase() || "ORIGINAL"} ·
            {editPlan?.captions?.enabled ? " CC ON" : " CC OFF"}
          </span>
          {outputSrc && (
            <button
              data-testid="toggle-output-button"
              onClick={() => setShowOutput((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-2 h-7 border border-line text-xs transition-colors ${showOutput ? "bg-warningYellow text-black" : "bg-surface text-zinc-300 hover:bg-surfaceHover"}`}
            >
              {showOutput ? <Eye size={12} /> : <EyeOff size={12} />}
              {showOutput ? "Rendered" : "Source"}
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className={`relative ${aspectClass} max-h-full max-w-full bg-black border border-line`} style={{ height: "100%" }}>
          <video
            ref={videoRef}
            src={activeSrc}
            data-testid="video-element"
            className="w-full h-full object-contain bg-black"
            muted={muted}
            playsInline
          />
          {!showOutput && activeOverlay && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white font-heading ${
                activeOverlay.position === "top" ? "top-[8%]" :
                activeOverlay.position === "center" ? "top-1/2 -translate-y-1/2" : "bottom-[8%]"
              }`}
              data-testid="overlay-preview"
            >
              {activeOverlay.text}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="h-12 border-t border-line flex items-center gap-3 px-4 shrink-0">
        <button
          data-testid="play-pause-button"
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center bg-surface border border-line hover:bg-surfaceHover transition"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="mono text-xs text-zinc-400 w-44">
          <span className="text-white">{fmt(time)}</span>
          <span className="text-zinc-600 mx-1.5">/</span>
          {fmt(duration)}
        </div>
        <div className="flex-1 relative h-[3px] bg-line cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const r = (e.clientX - rect.left) / rect.width;
          if (videoRef.current) videoRef.current.currentTime = r * duration;
        }}>
          <div className="absolute inset-y-0 left-0 bg-warningYellow" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
        </div>
        <button
          data-testid="mute-button"
          onClick={() => setMuted((m) => !m)}
          className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </main>
  );
}
