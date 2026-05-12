import { useMemo } from "react";

function fmt(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export default function Timeline({ duration, currentTime, editPlan, transcript, onSeek }) {
  const d = Math.max(duration || 0, 1);
  const trim = editPlan?.trim || null;
  const removes = editPlan?.remove_segments || [];
  const overlays = editPlan?.text_overlays || [];
  const segments = transcript?.segments || [];
  const captionsOn = editPlan?.captions?.enabled;

  const ticks = useMemo(() => {
    const arr = [];
    const step = d > 120 ? 30 : d > 30 ? 10 : 5;
    for (let t = 0; t <= d; t += step) arr.push(t);
    return arr;
  }, [d]);

  const pct = (t) => `${Math.min(100, Math.max(0, (t / d) * 100))}%`;

  return (
    <section className="h-[230px] border-t border-line bg-obsidian flex flex-col shrink-0" data-testid="timeline-panel">
      <div className="h-9 px-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="uppercase-label">Timeline</span>
          <span className="mono text-[11px] text-zinc-500">
            {fmt(currentTime)} / {fmt(d)} · {d.toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center gap-4 mono text-[10px] text-zinc-500">
          <Legend color="#FFCC00" label="VIDEO" />
          <Legend color="#0055FF" label="AUDIO" />
          {captionsOn && <Legend color="#22C55E" label="CAPTIONS" />}
          {overlays.length > 0 && <Legend color="#A855F7" label="OVERLAY" />}
          {removes.length > 0 && <Legend color="#FF3333" label="REMOVE" />}
        </div>
      </div>

      <div className="flex-1 relative cursor-pointer overflow-hidden" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const t = ((e.clientX - r.left) / r.width) * d;
        onSeek(t);
      }}>
        {/* Ruler */}
        <div className="absolute inset-x-0 top-0 h-6 border-b border-line bg-obsidian">
          {ticks.map((t) => (
            <div key={t} className="absolute top-0 bottom-0 border-l border-line/70 mono text-[9px] text-zinc-500 pl-1" style={{ left: pct(t) }}>
              {fmt(t)}
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="absolute inset-x-0 top-6 bottom-0">
          <Track top="0%" h="34px" bg="bg-zinc-900" label="V1">
            {/* Base video clip */}
            <Clip left="0%" width="100%" color="#3F3F46" />
            {/* Trim overlay (dim out non-trim parts) */}
            {trim && (
              <>
                {trim.start > 0 && <Clip left="0%" width={pct(trim.start)} color="#0a0a0a" opacity={0.85} />}
                {trim.end < d && <Clip left={pct(trim.end)} width={pct(d - trim.end)} color="#0a0a0a" opacity={0.85} />}
              </>
            )}
            {/* Removed segments */}
            {removes.map((r, i) => (
              <Clip key={i} left={pct(r.start)} width={pct(Math.max(0, r.end - r.start))} color="#FF3333" opacity={0.55} dataTestId={`remove-segment-${i}`} />
            ))}
          </Track>

          <Track top="34px" h="34px" bg="bg-zinc-950" label="A1">
            <Clip left="0%" width="100%" color="#0055FF" opacity={0.45} />
            {/* Audio waveform faux */}
            <div className="absolute inset-0 flex items-center px-1 gap-[1px] pointer-events-none opacity-70">
              {Array.from({ length: 120 }).map((_, i) => (
                <div key={i} className="w-px bg-signalBlue" style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 18}%` }} />
              ))}
            </div>
          </Track>

          <Track top="68px" h="28px" bg="bg-zinc-900" label="CC">
            {captionsOn && segments.map((seg, i) => (
              <Clip
                key={i}
                left={pct(seg.start)}
                width={pct(Math.max(0.2, seg.end - seg.start))}
                color="#22C55E"
                opacity={0.5}
                dataTestId={`caption-clip-${i}`}
              />
            ))}
            {!captionsOn && (
              <div className="absolute inset-0 flex items-center pl-2 mono text-[10px] text-zinc-600">CAPTIONS DISABLED</div>
            )}
          </Track>

          <Track top="96px" h="28px" bg="bg-zinc-950" label="TXT">
            {overlays.map((ov, i) => (
              <div
                key={i}
                data-testid={`overlay-clip-${i}`}
                className="absolute top-1 bottom-1 border border-purple-500 bg-purple-500/30 flex items-center px-2"
                style={{ left: pct(ov.start), width: pct(Math.max(0.3, ov.end - ov.start)) }}
              >
                <span className="text-[10px] text-purple-200 truncate">{ov.text}</span>
              </div>
            ))}
            {overlays.length === 0 && (
              <div className="absolute inset-0 flex items-center pl-2 mono text-[10px] text-zinc-600">NO OVERLAYS</div>
            )}
          </Track>
        </div>

        {/* Playhead */}
        <div className="playhead" style={{ left: pct(currentTime) }} data-testid="timeline-playhead" />
      </div>
    </section>
  );
}

function Track({ top, h, bg, label, children }) {
  return (
    <div className={`absolute inset-x-0 ${bg} border-b border-line/70`} style={{ top, height: h }}>
      <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-line bg-obsidian flex items-center justify-center mono text-[10px] text-zinc-500 z-10">{label}</div>
      <div className="absolute left-10 right-0 top-0 bottom-0">{children}</div>
    </div>
  );
}

function Clip({ left, width, color, opacity = 1, dataTestId }) {
  return (
    <div
      data-testid={dataTestId}
      className="absolute top-1 bottom-1"
      style={{ left, width, background: color, opacity }}
    />
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2.5 h-2.5" style={{ background: color }} />
      {label}
    </span>
  );
}
