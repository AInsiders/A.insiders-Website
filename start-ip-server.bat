@echo off
echo Starting IP API Server with automatic port conflict resolution...
echo.

REM Kill any existing Node.js processes
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

REM Start the server using the new startup script
node start-server.js

pause
