#!/bin/bash

echo "======================================="
echo "   Starting Local Code Agent..."
echo "======================================="
echo ""

# Start Ollama in background (if not running)
echo "Checking Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Start Backend
echo "Starting backend server..."
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!
cd ..
sleep 2

# Start Frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================="
echo "Local Code Agent is starting!"
echo "======================================="
echo ""
echo "Backend: http://localhost:8001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop."

# Handle cleanup
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Wait
wait
