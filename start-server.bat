@echo off
cd /d "C:\Users\HP\Downloads\Telegram Desktop\new project fayda"

:: Kill any existing process on port 5500
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5500 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

start "" "http://localhost:5500"
node server.js
