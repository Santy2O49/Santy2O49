"""Claude Sonnet 4.5 chat + edit plan generation."""
import json
import os
import re
from typing import Any

from emergentintegrations.llm.chat import LlmChat, UserMessage


SYSTEM_PROMPT = """You are PromptCut's AI video editor. The user uploads a video, gets a transcript with timestamps, and chats with you to apply edits.

Your job:
1. Read the user's instruction.
2. Look at the current edit_plan and transcript (if provided).
3. Reply with a SHORT friendly confirmation (1-3 sentences) of what you changed.
4. Return an UPDATED edit_plan JSON that reflects ALL prior + new edits.

The edit_plan schema (always return ALL fields, even if unchanged):
{
  "trim": { "start": number, "end": number } | null,         // overall trim in seconds; null = keep full
  "remove_segments": [ { "start": number, "end": number } ], // cut these ranges out (seconds)
  "aspect_ratio": "original" | "9:16" | "16:9" | "1:1",       // output aspect; "9:16" = vertical
  "captions": { "enabled": boolean, "style": "default" | "bold" | "minimal" },
  "text_overlays": [
    { "text": string, "start": number, "end": number, "position": "top" | "center" | "bottom" }
  ],
  "background_music": { "enabled": boolean, "label": string } | null  // placeholder only
}

RULES:
- Always reference timestamps in seconds (float, 2-decimal).
- Use the transcript segments to find correct timestamps when the user references words/phrases.
- Keep removed segments NON-OVERLAPPING and sorted by start.
- If the user says "make it vertical" set aspect_ratio = "9:16".
- If the user says "add captions" set captions.enabled = true.
- Always merge changes onto the existing edit_plan; do not silently drop prior edits.

OUTPUT FORMAT (STRICT):
Return a single JSON object on its own line wrapped in <plan> ... </plan> tags, preceded by your message.

Example:
Sure! I trimmed the first 5 seconds and made it vertical.
<plan>{"trim":{"start":5.0,"end":120.5},"remove_segments":[],"aspect_ratio":"9:16","captions":{"enabled":false,"style":"default"},"text_overlays":[],"background_music":null}</plan>
"""


DEFAULT_EDIT_PLAN: dict[str, Any] = {
    "trim": None,
    "remove_segments": [],
    "aspect_ratio": "original",
    "captions": {"enabled": False, "style": "default"},
    "text_overlays": [],
    "background_music": None,
}


def _extract_plan(text: str) -> tuple[str, dict[str, Any] | None]:
    """Pull the <plan>...</plan> JSON out and return (visible_message, plan_or_None)."""
    match = re.search(r"<plan>\s*(\{.*?\})\s*</plan>", text, re.DOTALL)
    if not match:
        return text.strip(), None
    raw = match.group(1)
    visible = (text[: match.start()] + text[match.end() :]).strip()
    try:
        plan = json.loads(raw)
    except json.JSONDecodeError:
        return visible or text.strip(), None
    return visible or "Updated your edit plan.", plan


async def generate_edit_plan(
    *,
    project_id: str,
    user_message: str,
    current_plan: dict[str, Any],
    transcript_segments: list[dict[str, Any]],
    history: list[dict[str, str]],
) -> tuple[str, dict[str, Any]]:
    """Send message + context to Claude Sonnet 4.5 and return (assistant_text, new_plan)."""
    api_key = os.environ["EMERGENT_LLM_KEY"]

    # Trim transcript context to keep prompt small.
    short_segments = [
        {"start": round(s.get("start", 0.0), 2), "end": round(s.get("end", 0.0), 2), "text": s.get("text", "")}
        for s in transcript_segments[:200]
    ]

    context_block = (
        "CURRENT EDIT PLAN:\n"
        + json.dumps(current_plan, indent=2)
        + "\n\nTRANSCRIPT SEGMENTS (start,end,text):\n"
        + json.dumps(short_segments)
        + "\n\nCONVERSATION SO FAR:\n"
        + "\n".join([f"{m['role']}: {m['content']}" for m in history[-10:]])
        + f"\n\nNEW USER INSTRUCTION:\n{user_message}"
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"promptcut-{project_id}",
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    response = await chat.send_message(UserMessage(text=context_block))
    visible, plan = _extract_plan(response if isinstance(response, str) else str(response))
    if plan is None:
        plan = current_plan
    else:
        plan = _normalize_plan(plan)
    return visible, plan


def _normalize_plan(plan: dict[str, Any]) -> dict[str, Any]:
    out = {**DEFAULT_EDIT_PLAN, **plan}
    if out.get("trim") and not (isinstance(out["trim"], dict) and "start" in out["trim"] and "end" in out["trim"]):
        out["trim"] = None
    if not isinstance(out.get("remove_segments"), list):
        out["remove_segments"] = []
    if out["aspect_ratio"] not in {"original", "9:16", "16:9", "1:1"}:
        out["aspect_ratio"] = "original"
    if not isinstance(out.get("captions"), dict):
        out["captions"] = {"enabled": False, "style": "default"}
    if not isinstance(out.get("text_overlays"), list):
        out["text_overlays"] = []
    return out
