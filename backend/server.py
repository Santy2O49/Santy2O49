from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import subprocess
import asyncio
import json
import httpx
import fnmatch
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'coding_agent')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration - Will be customizable for local installation
OLLAMA_BASE_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
PROJECTS_BASE_PATH = os.environ.get('PROJECTS_PATH', 'D:/CodingAgentProjects')

# Models
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ollama_url: str = OLLAMA_BASE_URL
    projects_path: str = PROJECTS_BASE_PATH
    file_access_enabled: bool = True
    internet_access_enabled: bool = True
    selected_model: str = ""
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    ollama_url: Optional[str] = None
    projects_path: Optional[str] = None
    file_access_enabled: Optional[bool] = None
    internet_access_enabled: Optional[bool] = None
    selected_model: Optional[str] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    path: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    role: str  # user, assistant, system
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    project_id: str
    message: str
    model: str

class FileOperation(BaseModel):
    path: str
    content: Optional[str] = None

class CommandRequest(BaseModel):
    command: str
    cwd: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    path: str
    file_pattern: str = "*"

# Helper functions
def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

async def get_settings():
    settings_doc = await db.settings.find_one({}, {"_id": 0})
    if settings_doc:
        if isinstance(settings_doc.get('updated_at'), str):
            settings_doc['updated_at'] = datetime.fromisoformat(settings_doc['updated_at'])
        return Settings(**settings_doc)
    default_settings = Settings()
    doc = default_settings.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.settings.insert_one(doc)
    return default_settings

# Settings endpoints
@api_router.get("/settings")
async def get_settings_endpoint():
    settings = await get_settings()
    return settings.model_dump()

@api_router.put("/settings")
async def update_settings(update: SettingsUpdate):
    settings = await get_settings()
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    settings.updated_at = datetime.now(timezone.utc)
    doc = settings.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.settings.update_one({}, {"$set": doc}, upsert=True)
    return settings.model_dump()

# Ollama endpoints
@api_router.get("/ollama/status")
async def get_ollama_status():
    settings = await get_settings()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.ollama_url}/api/tags")
            if response.status_code == 200:
                return {"status": "connected", "url": settings.ollama_url}
    except Exception as e:
        logger.error(f"Ollama connection error: {e}")
    return {"status": "disconnected", "url": settings.ollama_url}

@api_router.get("/ollama/models")
async def get_ollama_models():
    settings = await get_settings()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.ollama_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [{"name": m["name"], "size": m.get("size", 0)} for m in data.get("models", [])]
                return {"models": models}
    except Exception as e:
        logger.error(f"Error fetching models: {e}")
    return {"models": []}

# Project endpoints
@api_router.get("/projects", response_model=List[dict])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return projects

@api_router.post("/projects")
async def create_project(project_data: ProjectCreate):
    settings = await get_settings()
    project = Project(
        name=project_data.name,
        description=project_data.description,
        path=os.path.join(settings.projects_path, project_data.name.replace(" ", "_"))
    )
    
    # Create project directory
    try:
        os.makedirs(project.path, exist_ok=True)
        # Create a README.md file
        readme_path = os.path.join(project.path, "README.md")
        with open(readme_path, 'w') as f:
            f.write(f"# {project.name}\n\n{project.description}\n")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project directory: {str(e)}")
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.projects.insert_one(doc)
    return project.model_dump()

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Optionally delete project directory
    # shutil.rmtree(project['path'], ignore_errors=True)
    
    await db.projects.delete_one({"id": project_id})
    await db.chat_messages.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

# File operations
@api_router.get("/files/list")
async def list_files(path: str):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    try:
        items = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            is_dir = os.path.isdir(item_path)
            size = 0 if is_dir else os.path.getsize(item_path)
            items.append({
                "name": item,
                "path": item_path,
                "is_directory": is_dir,
                "size": size,
                "modified": datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat()
            })
        return {"items": sorted(items, key=lambda x: (not x["is_directory"], x["name"].lower()))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/files/read")
async def read_file(path: str):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {"content": content, "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/files/write")
async def write_file(file_op: FileOperation):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    try:
        os.makedirs(os.path.dirname(file_op.path), exist_ok=True)
        with open(file_op.path, 'w', encoding='utf-8') as f:
            f.write(file_op.content or "")
        return {"message": "File written successfully", "path": file_op.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/files/delete")
async def delete_file(path: str):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/files/create-folder")
async def create_folder(file_op: FileOperation):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    try:
        os.makedirs(file_op.path, exist_ok=True)
        return {"message": "Folder created", "path": file_op.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search functionality
@api_router.post("/search")
async def search_files(search_req: SearchRequest):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="File access is disabled")
    
    results = []
    query_lower = search_req.query.lower()
    
    try:
        for root, dirs, files in os.walk(search_req.path):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if not fnmatch.fnmatch(file, search_req.file_pattern):
                    continue
                
                file_path = os.path.join(root, file)
                
                # Search in filename
                if query_lower in file.lower():
                    results.append({
                        "type": "filename",
                        "path": file_path,
                        "match": file
                    })
                    continue
                
                # Search in file content
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            if query_lower in line.lower():
                                results.append({
                                    "type": "content",
                                    "path": file_path,
                                    "line": line_num,
                                    "match": line.strip()[:200]
                                })
                                if len(results) > 100:
                                    return {"results": results, "truncated": True}
                except:
                    pass
        
        return {"results": results, "truncated": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Terminal/Command execution
@api_router.post("/execute")
async def execute_command(cmd_req: CommandRequest):
    settings = await get_settings()
    if not settings.file_access_enabled:
        raise HTTPException(status_code=403, detail="Command execution is disabled")
    
    try:
        process = await asyncio.create_subprocess_shell(
            cmd_req.command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cmd_req.cwd
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=60.0)
        
        return {
            "stdout": stdout.decode('utf-8', errors='replace'),
            "stderr": stderr.decode('utf-8', errors='replace'),
            "return_code": process.returncode
        }
    except asyncio.TimeoutError:
        return {"stdout": "", "stderr": "Command timed out", "return_code": -1}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "return_code": -1}

# Chat endpoints
@api_router.get("/chat/{project_id}")
async def get_chat_history(project_id: str):
    messages = await db.chat_messages.find(
        {"project_id": project_id}, {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg.get('timestamp'), str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return {"messages": messages}

@api_router.delete("/chat/{project_id}")
async def clear_chat_history(project_id: str):
    await db.chat_messages.delete_many({"project_id": project_id})
    return {"message": "Chat history cleared"}

@api_router.post("/chat")
async def send_chat_message(chat_req: ChatRequest):
    settings = await get_settings()
    
    # Save user message
    user_msg = ChatMessage(
        project_id=chat_req.project_id,
        role="user",
        content=chat_req.message
    )
    user_doc = user_msg.model_dump()
    user_doc['timestamp'] = user_doc['timestamp'].isoformat()
    await db.chat_messages.insert_one(user_doc)
    
    # Get project context
    project = await db.projects.find_one({"id": chat_req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get chat history for context
    history = await db.chat_messages.find(
        {"project_id": chat_req.project_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    history.reverse()
    
    # Build system prompt
    system_prompt = f"""You are a helpful coding assistant. You are working on the project "{project['name']}" located at "{project['path']}".

Your capabilities:
- Read and analyze code files
- Write and modify code
- Execute terminal commands
- Search through codebases
- Explain code and suggest improvements

When asked to perform file operations or commands, provide clear instructions or code that the user can execute.

Project Description: {project.get('description', 'No description provided')}

Internet Access: {"Enabled" if settings.internet_access_enabled else "Disabled"}
File Access: {"Enabled" if settings.file_access_enabled else "Disabled"}

Be concise and helpful. Format code blocks properly with language specifications."""

    # Build messages for Ollama
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[:-1]:  # Exclude the last user message we just added
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": chat_req.message})
    
    # Call Ollama
    try:
        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(
                f"{settings.ollama_url}/api/chat",
                json={
                    "model": chat_req.model,
                    "messages": messages,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Ollama error: {response.text}")
            
            data = response.json()
            assistant_content = data.get("message", {}).get("content", "")
    except httpx.TimeoutException:
        assistant_content = "Request timed out. Please try again or use a smaller model."
    except Exception as e:
        assistant_content = f"Error communicating with Ollama: {str(e)}"
    
    # Save assistant message
    assistant_msg = ChatMessage(
        project_id=chat_req.project_id,
        role="assistant",
        content=assistant_content
    )
    assistant_doc = assistant_msg.model_dump()
    assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
    await db.chat_messages.insert_one(assistant_doc)
    
    return {
        "user_message": user_msg.model_dump(),
        "assistant_message": assistant_msg.model_dump()
    }

# Health check
@api_router.get("/")
async def root():
    return {"message": "Coding Agent API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
