"""FFmpeg rendering based on edit_plan."""
from __future__ import annotations

import math
import shlex
import subprocess
from pathlib import Path
from typing import Any


def _fmt_time_srt(seconds: float) -> str:
    seconds = max(0.0, float(seconds))
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - math.floor(seconds)) * 1000))
    if ms == 1000:
        ms = 0
        s += 1
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _build_srt(segments: list[dict[str, Any]], srt_path: Path, time_offset: float = 0.0) -> None:
    lines: list[str] = []
    idx = 1
    for seg in segments:
        start = float(seg.get("start", 0.0)) - time_offset
        end = float(seg.get("end", 0.0)) - time_offset
        text = (seg.get("text") or "").strip()
        if end <= 0 or not text:
            continue
        start = max(0.0, start)
        lines.append(str(idx))
        lines.append(f"{_fmt_time_srt(start)} --> {_fmt_time_srt(end)}")
        lines.append(text)
        lines.append("")
        idx += 1
    srt_path.write_text("\n".join(lines), encoding="utf-8")


def _escape_drawtext(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace(":", "\\:")
        .replace("'", "\\'")
        .replace(",", "\\,")
    )


def render(
    *,
    source_video: Path,
    output_video: Path,
    edit_plan: dict[str, Any],
    transcript_segments: list[dict[str, Any]],
    duration: float,
) -> None:
    """Render output_video by applying edit_plan to source_video."""
    output_video.parent.mkdir(parents=True, exist_ok=True)
    work_dir = output_video.parent / "_work"
    work_dir.mkdir(exist_ok=True)

    # 1. Determine keep ranges from trim + remove_segments.
    trim = edit_plan.get("trim") or {}
    src_start = float(trim.get("start", 0.0)) if trim else 0.0
    src_end = float(trim.get("end", duration)) if trim else duration
    src_start = max(0.0, min(src_start, duration))
    src_end = max(src_start, min(src_end, duration or src_end))

    removes = sorted(
        [
            (max(src_start, float(r["start"])), min(src_end, float(r["end"])))
            for r in edit_plan.get("remove_segments", [])
            if float(r["end"]) > src_start and float(r["start"]) < src_end
        ],
        key=lambda x: x[0],
    )

    # Build keep ranges by subtracting removes from [src_start, src_end]
    keep: list[tuple[float, float]] = []
    cursor = src_start
    for rs, re_ in removes:
        if rs > cursor:
            keep.append((cursor, rs))
        cursor = max(cursor, re_)
    if cursor < src_end:
        keep.append((cursor, src_end))
    if not keep:
        keep = [(src_start, src_end)]

    # 2. Aspect ratio target.
    aspect = edit_plan.get("aspect_ratio", "original")
    aspect_filter = ""
    if aspect == "9:16":
        aspect_filter = "scale=-2:1920,crop=1080:1920"
    elif aspect == "1:1":
        aspect_filter = "scale=-2:1080,crop=1080:1080"
    elif aspect == "16:9":
        aspect_filter = "scale=1920:-2,crop=1920:1080"

    # 3. Build filter_complex: per-segment trim + concat + post processing.
    n = len(keep)
    parts: list[str] = []
    for i, (s, e) in enumerate(keep):
        parts.append(
            f"[0:v]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS[v{i}]"
        )
        parts.append(
            f"[0:a]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS[a{i}]"
        )
    concat_inputs = "".join(f"[v{i}][a{i}]" for i in range(n))
    parts.append(f"{concat_inputs}concat=n={n}:v=1:a=1[vc][ac]")

    last_v = "vc"
    if aspect_filter:
        parts.append(f"[{last_v}]{aspect_filter}[vasp]")
        last_v = "vasp"

    # 4. Captions via SRT subtitles filter (timeline of kept content).
    captions = edit_plan.get("captions") or {}
    if captions.get("enabled") and transcript_segments:
        # Re-time segments onto the kept timeline.
        retimed: list[dict[str, Any]] = []
        offset_out = 0.0
        for s, e in keep:
            for seg in transcript_segments:
                seg_s = float(seg.get("start", 0.0))
                seg_e = float(seg.get("end", 0.0))
                if seg_e <= s or seg_s >= e:
                    continue
                ns = max(seg_s, s) - s + offset_out
                ne = min(seg_e, e) - s + offset_out
                retimed.append({"start": ns, "end": ne, "text": seg.get("text", "")})
            offset_out += (e - s)
        srt_path = work_dir / "captions.srt"
        _build_srt(retimed, srt_path, time_offset=0.0)
        # FontName must be available; use a default and style.
        force_style = "FontName=Sans,FontSize=22,PrimaryColour=&HFFFFFF&,OutlineColour=&H80000000&,Outline=2,Shadow=0,Alignment=2,MarginV=40"
        srt_escaped = str(srt_path).replace(":", "\\:")
        parts.append(f"[{last_v}]subtitles='{srt_escaped}':force_style='{force_style}'[vcap]")
        last_v = "vcap"

    # 5. Text overlays via drawtext.
    overlays = edit_plan.get("text_overlays", []) or []
    for i, ov in enumerate(overlays):
        text = _escape_drawtext(str(ov.get("text", "")))
        if not text:
            continue
        pos = ov.get("position", "bottom")
        ov_start = max(0.0, float(ov.get("start", 0.0)))
        ov_end = max(ov_start, float(ov.get("end", ov_start + 3.0)))
        y_expr = {"top": "h*0.08", "center": "(h-text_h)/2", "bottom": "h*0.85"}.get(pos, "h*0.85")
        drawtext = (
            f"drawtext=text='{text}':fontcolor=white:fontsize=42:"
            f"box=1:boxcolor=black@0.5:boxborderw=12:"
            f"x=(w-text_w)/2:y={y_expr}:"
            f"enable='between(t,{ov_start:.3f},{ov_end:.3f})'"
        )
        parts.append(f"[{last_v}]{drawtext}[vov{i}]")
        last_v = f"vov{i}"

    filter_complex = ";".join(parts)

    cmd = [
        "ffmpeg", "-y", "-i", str(source_video),
        "-filter_complex", filter_complex,
        "-map", f"[{last_v}]", "-map", "[ac]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        str(output_video),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {proc.stderr[-2000:]}")
