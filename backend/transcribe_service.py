"""Audio extraction + Whisper transcription."""
import os
import subprocess
from pathlib import Path
from typing import Any

from emergentintegrations.llm.openai import OpenAISpeechToText


def extract_audio(video_path: Path, audio_path: Path) -> None:
    """Use ffmpeg to extract a 16kHz mono wav for Whisper."""
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vn", "-ac", "1", "-ar", "16000",
        "-f", "wav", str(audio_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


async def transcribe_audio(audio_path: Path) -> dict[str, Any]:
    """Transcribe with whisper-1 and return {text, segments:[{start,end,text}]}."""
    stt = OpenAISpeechToText(api_key=os.environ["EMERGENT_LLM_KEY"])
    with open(audio_path, "rb") as f:
        response = await stt.transcribe(
            file=f,
            model="whisper-1",
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    segments: list[dict[str, Any]] = []
    raw_segments = getattr(response, "segments", None) or []
    for seg in raw_segments:
        start = getattr(seg, "start", None)
        end = getattr(seg, "end", None)
        text = getattr(seg, "text", None)
        if start is None and isinstance(seg, dict):
            start = seg.get("start")
            end = seg.get("end")
            text = seg.get("text")
        segments.append({
            "start": float(start or 0.0),
            "end": float(end or 0.0),
            "text": (text or "").strip(),
        })

    full_text = getattr(response, "text", None) or " ".join(s["text"] for s in segments)
    return {"text": full_text, "segments": segments}


def get_video_duration(video_path: Path) -> float:
    """Return duration in seconds via ffprobe."""
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(video_path),
    ]
    out = subprocess.run(cmd, check=True, capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0
