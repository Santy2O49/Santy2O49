# PromptCut — PRD

## Problem
Build an AI-first video editing web app called PromptCut. Users upload a video, get a transcript with timestamps, chat with an AI editor that produces a structured edit_plan JSON, preview edits, revise through chat, and export the final video rendered by FFmpeg.

## Tech
- Frontend: React (CRA), Tailwind CSS, lucide-react, sonner toasts
- Backend: FastAPI (Python), MongoDB (motor)
- AI: Claude Sonnet 4.5 (via Emergent Universal LLM Key) for chat + edit_plan generation
- Transcription: OpenAI Whisper (whisper-1) via Emergent Universal LLM Key
- Rendering: FFmpeg pipeline (trim, concat, scale/crop for 9:16/16:9/1:1, drawtext overlays, SRT subtitles)
- Storage: local filesystem at `/app/backend/storage/{project_id}/`
- Auth: none (MVP)

## User personas
- Solo creator iterating on a short clip
- Marketer cutting horizontal footage into 9:16 shorts
- Podcaster auto-captioning episodes

## Core requirements (static)
1. Upload video (local storage)
2. Auto-extract audio + Whisper transcription with timestamps
3. Chat panel where user instructs the AI
4. AI returns assistant message AND structured edit_plan JSON
5. Edit plan supports: trim, remove_segments, aspect_ratio (9:16 / 16:9 / 1:1 / original), captions, text_overlays, background_music placeholder
6. Live preview (video player, overlay rendered on top, aspect-ratio frame)
7. Bottom timeline visualizes video / audio / captions / overlays / removes tracks with playhead
8. Render via FFmpeg, expose download button
9. Layout: media/transcript left, video center, AI chat right, timeline bottom

## What's been implemented (2026-02-12)
### Backend
- `POST /api/projects` — create project
- `GET /api/projects` — list projects
- `GET /api/projects/{id}` — project state
- `POST /api/projects/{id}/upload` — store video locally + compute duration
- `POST /api/projects/{id}/transcribe` — extract audio with ffmpeg, transcribe via whisper-1, persist segments
- `GET /api/projects/{id}/transcript` — fetch transcript
- `POST /api/projects/{id}/chat` — Claude Sonnet 4.5 returns message + updated edit_plan
- `GET /api/projects/{id}/messages` — chat history
- `GET /api/projects/{id}/edit_plan` / `PUT` — view + override edit plan
- `POST /api/projects/{id}/render` — FFmpeg render with trim/concat/aspect/captions/overlays
- `GET /api/projects/{id}/video` — serve source video
- `GET /api/projects/{id}/output` — serve rendered output
- MongoDB collections: `projects`, `messages`, `transcripts`
- 13/13 backend tests passing end-to-end (real Claude + Whisper + ffmpeg)

### Frontend
- Home: drop zone, upload, recent projects list, "Control Room" dark aesthetic (Outfit + IBM Plex Sans + JetBrains Mono)
- Editor: 3-column layout + bottom timeline
  - Left: MediaPanel — source card + clickable transcript with auto-scroll to active segment
  - Center: VideoPlayer — playback controls, aspect-ratio frame, text overlay preview, toggle Source/Rendered
  - Right: ChatPanel — quick prompts, message stream with shimmer "Generating edit plan…" state, collapsible Edit Plan JSON viewer
  - Bottom: Timeline — V1/A1/CC/TXT tracks with playhead, click-to-seek, clip visualization for removes/captions/overlays
- Auto-transcribe on first load when video is uploaded
- Export button + Download button once rendered

## Backlog / Next
- P0: Background job + status polling for long-running transcribe + render (current calls block the request)
- P1: Drag-to-resize segments on the timeline; click-and-drag remove on timeline
- P1: Real background music upload (currently placeholder)
- P1: Multi-clip projects (concatenate multiple uploads)
- P2: Auth + cloud storage so projects survive container restarts
- P2: Word-level karaoke captions
- P2: Share/preview links
