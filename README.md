# Local Code Agent - Installation Guide

A user-friendly AI-powered coding assistant that runs locally on your computer with Ollama.

## Prerequisites

1. **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
3. **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community)
4. **Ollama** - [Download Ollama](https://ollama.ai/download)

## Quick Start

### Step 1: Install Ollama and Download a Model

```bash
# After installing Ollama, download a coding model
ollama pull codellama
# Or other options:
ollama pull deepseek-coder
ollama pull llama3
ollama pull mistral
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your system (usually starts automatically after installation).

### Step 3: Install and Run the Agent

```bash
# Clone or extract the project
cd local-code-agent

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start the backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001

# In a new terminal, install frontend dependencies
cd frontend
npm install

# Start the frontend
npm start
```

### Step 4: Access the Agent

Open your browser and go to: **http://localhost:3000**

## Configuration

### Projects Path
By default, projects are stored in `D:/CodingAgentProjects`. You can change this in the Settings panel.

### Ollama URL
By default, connects to `http://localhost:11434`. Change in Settings if Ollama is running on a different address.

### Access Toggles
- **File System Access**: Enable/disable the agent's ability to read/write files
- **Internet Access**: Enable/disable internet connectivity for the agent

## Features

- **Project Management**: Create separate folders for each project
- **AI Chat**: Converse with your chosen Ollama model about code
- **File Explorer**: Browse and navigate project files
- **Code Editor**: Edit files with syntax highlighting
- **Terminal**: Execute commands in your project directory
- **Search**: Search across all files in your project

## Troubleshooting

### Ollama shows "disconnected"
1. Make sure Ollama is running: `ollama serve`
2. Check if it's accessible: `curl http://localhost:11434/api/tags`

### No models showing
1. Pull a model first: `ollama pull codellama`
2. Click the refresh button next to "Ollama" in the header

### Can't create projects
1. Make sure the Projects Path directory exists or can be created
2. Check file system permissions

## Support

For issues and feature requests, please contact the developer.
