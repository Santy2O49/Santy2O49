#!/bin/bash

echo "======================================="
echo "   Local Code Agent - Unix Installer"
echo "======================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed. Please install Python 3.9+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "WARNING: Ollama is not installed. Please install from ollama.ai"
    echo "The agent will work but AI features will be unavailable."
    echo ""
fi

echo "Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "======================================="
echo "Installation complete!"
echo "======================================="
echo ""
echo "To start the agent, run: ./start.sh"
