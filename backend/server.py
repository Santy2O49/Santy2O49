"""PromptCut FastAPI backend."""
from __future__ import annotations

import logging
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from llm_service import DEFAULT_EDIT_PLAN, generate_edit_plan
from render_service import render
from transcribe_service import extract_audio, get_video_duration, transcribe_audio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
STORAGE_DIR = ROOT_DIR / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    created_at: str
    has_video: bool = False
    video_filename: str | None = None
    duration: float = 0.0
    transcript_status: str = "pending"  # pending | running | done | error
    transcript_error: str | None = None
    render_status: str = "idle"  # idle | running | done | error
    render_error: str | None = None
    edit_plan: dict[str, Any] = Field(default_factory=lambda: dict(DEFAULT_EDIT_PLAN))


class ChatRequest(BaseModel):
    message: str


class EditPlanUpdate(BaseModel):
    edit_plan: dict[str, Any]


# ---------- Helpers ----------

def _project_dir(project_id: str) -> Path:
    p = STORAGE_DIR / project_id
    p.mkdir(parents=True, exist_ok=True)
    return p


async def _get_project(project_id: str) -> dict[str, Any]:
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    doc.setdefault("edit_plan", dict(DEFAULT_EDIT_PLAN))
    return doc


# ---------- Routes ----------

@api_router.get("/")
async def root() -> dict[str, str]:
    return {"app": "PromptCut", "status": "ok"}


@api_router.post("/projects", response_model=Project)
async def create_project(payload: dict[str, Any] | None = None) -> Project:
    title = (payload or {}).get("title") or "Untitled project"
    project = Project(
        id=str(uuid.uuid4()),
        title=title,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    await db.projects.insert_one(project.model_dump())
    return project


@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str) -> Project:
    doc = await _get_project(project_id)
    return Project(**doc)


@api_router.post("/projects/{project_id}/upload", response_model=Project)
async def upload_video(project_id: str, file: UploadFile = File(...)) -> Project:
    await _get_project(project_id)
    pdir = _project_dir(project_id)
    suffix = Path(file.filename or "video.mp4").suffix or ".mp4"
    dest = pdir / f"source{suffix}"
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    duration = get_video_duration(dest)
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "has_video": True,
            "video_filename": file.filename,
            "duration": duration,
            "transcript_status": "pending",
        }},
    )
    doc = await _get_project(project_id)
    return Project(**doc)


def _find_source(project_id: str) -> Path:
    pdir = _project_dir(project_id)
    for f in pdir.iterdir():
        if f.stem == "source":
            return f
    raise HTTPException(status_code=400, detail="No video uploaded yet")


@api_router.get("/projects/{project_id}/video")
async def serve_video(project_id: str) -> FileResponse:
    src = _find_source(project_id)
    return FileResponse(src, media_type="video/mp4")


@api_router.get("/projects/{project_id}/output")
async def serve_output(project_id: str) -> FileResponse:
    out = _project_dir(project_id) / "output.mp4"
    if not out.exists():
        raise HTTPException(status_code=404, detail="No rendered output yet")
    return FileResponse(out, media_type="video/mp4", filename="promptcut-export.mp4")


@api_router.post("/projects/{project_id}/transcribe")
async def transcribe(project_id: str) -> dict[str, Any]:
    await _get_project(project_id)
    src = _find_source(project_id)
    await db.projects.update_one({"id": project_id}, {"$set": {"transcript_status": "running", "transcript_error": None}})
    try:
        audio_path = _project_dir(project_id) / "audio.wav"
        extract_audio(src, audio_path)
        result = await transcribe_audio(audio_path)
        await db.transcripts.update_one(
            {"project_id": project_id},
            {"$set": {"project_id": project_id, "text": result["text"], "segments": result["segments"]}},
            upsert=True,
        )
        await db.projects.update_one({"id": project_id}, {"$set": {"transcript_status": "done"}})
        return {"status": "done", "segments": result["segments"], "text": result["text"]}
    except Exception as exc:  # noqa: BLE001
        logging.exception("transcribe failed")
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"transcript_status": "error", "transcript_error": str(exc)[:500]}},
        )
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")


@api_router.get("/projects/{project_id}/transcript")
async def get_transcript(project_id: str) -> dict[str, Any]:
    doc = await db.transcripts.find_one({"project_id": project_id}, {"_id": 0})
    if not doc:
        return {"project_id": project_id, "text": "", "segments": []}
    return doc


@api_router.get("/projects/{project_id}/messages")
async def get_messages(project_id: str) -> list[dict[str, Any]]:
    msgs = await db.messages.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return msgs


@api_router.post("/projects/{project_id}/chat")
async def chat(project_id: str, payload: ChatRequest) -> dict[str, Any]:
    project = await _get_project(project_id)
    transcript_doc = await db.transcripts.find_one({"project_id": project_id}, {"_id": 0}) or {"segments": []}
    history_msgs = await db.messages.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    history = [{"role": m["role"], "content": m["content"]} for m in history_msgs]

    user_doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "role": "user",
        "content": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(dict(user_doc))

    try:
        assistant_text, new_plan = await generate_edit_plan(
            project_id=project_id,
            user_message=payload.message,
            current_plan=project.get("edit_plan", dict(DEFAULT_EDIT_PLAN)),
            transcript_segments=transcript_doc.get("segments", []),
            history=history,
        )
    except Exception as exc:  # noqa: BLE001
        logging.exception("chat failed")
        raise HTTPException(status_code=500, detail=f"AI editor failed: {exc}")

    assistant_doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "role": "assistant",
        "content": assistant_text,
        "edit_plan_snapshot": new_plan,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(dict(assistant_doc))
    await db.projects.update_one({"id": project_id}, {"$set": {"edit_plan": new_plan}})

    user_doc.pop("_id", None)
    assistant_doc.pop("_id", None)
    return {"user": user_doc, "assistant": assistant_doc, "edit_plan": new_plan}


@api_router.get("/projects/{project_id}/edit_plan")
async def get_edit_plan(project_id: str) -> dict[str, Any]:
    doc = await _get_project(project_id)
    return doc.get("edit_plan", dict(DEFAULT_EDIT_PLAN))


@api_router.put("/projects/{project_id}/edit_plan")
async def update_edit_plan(project_id: str, payload: EditPlanUpdate) -> dict[str, Any]:
    await _get_project(project_id)
    await db.projects.update_one({"id": project_id}, {"$set": {"edit_plan": payload.edit_plan}})
    return payload.edit_plan


@api_router.post("/projects/{project_id}/render")
async def render_project(project_id: str) -> dict[str, Any]:
    project = await _get_project(project_id)
    src = _find_source(project_id)
    transcript_doc = await db.transcripts.find_one({"project_id": project_id}, {"_id": 0}) or {"segments": []}
    out_path = _project_dir(project_id) / "output.mp4"
    await db.projects.update_one({"id": project_id}, {"$set": {"render_status": "running", "render_error": None}})
    try:
        render(
            source_video=src,
            output_video=out_path,
            edit_plan=project.get("edit_plan", dict(DEFAULT_EDIT_PLAN)),
            transcript_segments=transcript_doc.get("segments", []),
            duration=project.get("duration", 0.0),
        )
        await db.projects.update_one({"id": project_id}, {"$set": {"render_status": "done"}})
        return {"status": "done", "output_url": f"/api/projects/{project_id}/output"}
    except Exception as exc:  # noqa: BLE001
        logging.exception("render failed")
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"render_status": "error", "render_error": str(exc)[:500]}},
        )
        raise HTTPException(status_code=500, detail=f"Render failed: {exc}")


@api_router.get("/projects")
async def list_projects() -> list[dict[str, Any]]:
    docs = await db.projects.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
