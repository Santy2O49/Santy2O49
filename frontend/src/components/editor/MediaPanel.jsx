import { useEffect, useRef } from "react";
import { Captions, Loader2, RefreshCw, FileVideo } from "lucide-react";

function formatTs(s) {
  if (!s && s !== 0) return "00:00";
  const sec = Math.max(0, Math.floor(s));
  const m = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export default function MediaPanel({ transcript, transcribing, currentTime, onSeek, onRetranscribe, project }) {
  const activeRef = useRef(null);
  const segments = transcript?.segments || [];
  const activeIdx = segments.findIndex((s) => currentTime >= s.start && currentTime < s.end);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIdx]);

  return (
    <aside className="w-[280px] lg:w-[320px] border-r border-line bg-obsidian flex flex-col min-h-0 shrink-0" data-testid="media-panel">
      <div className="px-3 h-10 flex items-center justify-between border-b border-line">
        <span className="uppercase-label">Media · Transcript</span>
        <button
          data-testid="retranscribe-button"
          onClick={onRetranscribe}
          disabled={transcribing}
          className="text-zinc-500 hover:text-white transition disabled:opacity-50"
          title="Re-transcribe"
        >
          <RefreshCw size={13} className={transcribing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Source card */}
      <div className="border-b border-line p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-surface border border-line flex items-center justify-center">
            <FileVideo size={16} className="text-zinc-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate" data-testid="source-filename">{project?.video_filename || "source.mp4"}</div>
            <div className="mono text-[11px] text-zinc-500">
              {project?.duration ? `${formatTs(project.duration)} · ${project.duration.toFixed(2)}s` : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 h-8 flex items-center gap-1.5 border-b border-line">
        <Captions size={12} className="text-zinc-500" />
        <span className="uppercase-label">Transcript</span>
        {transcribing && (
          <span className="ml-auto mono text-[10px] shimmer-text">RUNNING</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto" data-testid="transcript-list">
        {transcribing && segments.length === 0 && (
          <div className="p-4 text-zinc-500 text-sm flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Transcribing with whisper-1…
          </div>
        )}
        {!transcribing && segments.length === 0 && (
          <div className="p-4 text-zinc-500 text-sm">No transcript yet.</div>
        )}
        {segments.map((seg, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={i}
              ref={active ? activeRef : null}
              data-testid={`transcript-line-${i}`}
              onClick={() => onSeek(seg.start)}
              className={`w-full text-left px-3 py-2 border-b border-line/60 transition-colors hover:bg-surface ${active ? "bg-surface" : ""}`}
            >
              <div className="mono text-[10px] text-warningYellow flex items-center justify-between">
                <span>{formatTs(seg.start)} → {formatTs(seg.end)}</span>
                <span className="text-zinc-600">#{i + 1}</span>
              </div>
              <div className={`text-sm leading-snug mt-1 ${active ? "text-white" : "text-zinc-400"}`}>
                {seg.text}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
