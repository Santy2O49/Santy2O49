# Local Code Agent - PRD

## Original Problem Statement
Build a local coding agent that can be installed locally, can edit and code files. User wants it to be user-friendly, connect to Ollama automatically, have all capabilities (read/edit files, execute commands, search code), support multiple languages, and organize projects in separate folders on D: drive.

## User Requirements
- User-friendly web-based interface (local)
- Auto-connect to Ollama with model selector dropdown
- All capabilities: read/edit files, execute commands, search code
- Project-based organization on D: drive
- Toggle buttons for: file access (restricted vs full), internet access
- Memory storage for each project

## Architecture

### Backend (FastAPI + MongoDB)
- `/api/settings` - User settings management
- `/api/ollama/*` - Ollama connection & model listing
- `/api/projects/*` - Project CRUD operations
- `/api/files/*` - File operations (list, read, write, delete)
- `/api/search` - Codebase search
- `/api/execute` - Terminal command execution
- `/api/chat/*` - AI chat with context

### Frontend (React + Tailwind)
- Dark theme UI with JetBrains Mono font
- Project management dashboard
- Workspace view with tabs: Chat, Editor, Terminal, Search
- File explorer sidebar
- Access control toggles

## What's Been Implemented (March 2026)

### Core Features ✅
- [x] Project management (create, list, delete)
- [x] File explorer with navigation
- [x] Code editor with save functionality
- [x] Terminal command execution
- [x] Codebase search
- [x] AI chat with Ollama integration
- [x] Model selector dropdown
- [x] Access toggles (file system, internet)
- [x] Settings panel (Ollama URL, Projects Path)
- [x] Installation scripts (Windows & Unix)

### UI/UX ✅
- [x] Professional dark theme
- [x] Responsive layout
- [x] Status indicators (Ollama connection)
- [x] Workspace tabs

## Installation Files Created
- `install.bat` - Windows installer
- `install.sh` - Unix installer
- `start.bat` - Windows startup script
- `start.sh` - Unix startup script
- `README.md` - Full documentation

## Backlog / Future Enhancements

### P0 (Essential)
- [ ] Syntax highlighting in editor
- [ ] File creation/folder creation UI

### P1 (Important)
- [ ] Chat context window management
- [ ] Streaming responses from Ollama
- [ ] Project templates
- [ ] Git integration

### P2 (Nice to have)
- [ ] Multiple file tabs in editor
- [ ] Code completion suggestions
- [ ] Project export/import
- [ ] Dark/Light theme toggle

## Next Steps
1. User downloads the code
2. Runs install.bat (Windows) or install.sh (Unix)
3. Runs start.bat or start.sh
4. Opens browser to localhost:3000
5. Creates projects and starts coding with AI assistance
