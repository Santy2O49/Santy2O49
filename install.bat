@echo off
echo =======================================
echo    Local Code Agent - Windows Installer
echo =======================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.9+ from python.org
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from nodejs.org
    pause
    exit /b 1
)

:: Check Ollama
ollama --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Ollama is not installed. Please install from ollama.ai
    echo The agent will work but AI features will be unavailable.
    echo.
)

echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo =======================================
echo Installation complete!
echo =======================================
echo.
echo To start the agent, run: start.bat
echo.
pause
