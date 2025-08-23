@echo off
echo Starting File Transfer Server...
echo.
echo This will start the WebSocket signaling server on port 8080.
echo Keep this window open while using the file transfer tool.
echo.
echo Press Ctrl+C to stop the server.
echo.
node file-transfer-server.js
pause
