@echo off
echo =======================================
echo    Starting Local Code Agent...
echo =======================================
echo.

:: Start Ollama in background (if not running)
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo Starting Ollama...
    start /b ollama serve
    timeout /t 3 >nul
)

:: Start Backend
echo Starting backend server...
cd backend
start /b python -m uvicorn server:app --host 0.0.0.0 --port 8001
cd ..
timeout /t 2 >nul

:: Start Frontend
echo Starting frontend...
cd frontend
start /b npm start
cd ..

echo.
echo =======================================
echo Local Code Agent is starting!
echo =======================================
echo.
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 >nul

:: Open browser
start http://localhost:3000

echo.
echo Press Ctrl+C to stop the agent.
echo.
pause
