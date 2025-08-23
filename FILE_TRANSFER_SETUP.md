# File Transfer Tool Setup Guide

## Overview
The Secure File Transfer tool uses WebRTC for peer-to-peer file transfer with end-to-end encryption. It requires a signaling server to establish the initial connection.

## Requirements
- Node.js installed on your system
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install ws
```

### 2. Start the Signaling Server
**Option A: Using the batch file (Windows)**
- Double-click `start-file-transfer-server.bat`
- Keep the command window open

**Option B: Using command line**
```bash
node file-transfer-server.js
```

### 3. Access the File Transfer Tool
- Open `file-transfer.html` in your web browser
- Or serve it using a local web server

## How to Use

### For Sender:
1. Click "Grant File Access" to enable file system permissions
2. Select "I'm Sending Files"
3. A room code will be generated automatically
4. Share this room code with the receiver
5. Click "Connect" to establish the connection
6. Drag and drop a file or click to browse
7. Click "Start Transfer" to begin sending

### For Receiver:
1. Click "Grant File Access" to enable file system permissions
2. Select "I'm Receiving Files"
3. Enter the room code provided by the sender
4. Click "Connect" to establish the connection
5. Verify the security code matches the sender's code
6. Click "Accept & Receive" to start receiving the file

## Troubleshooting

### Connection Issues
- **"Server not available"**: Make sure the signaling server is running on port 8080
- **"Connection failed"**: Check that both devices are on the same network
- **"WebRTC connection failed"**: Try refreshing the page and reconnecting

### File Access Issues
- **"File access denied"**: Click "Grant File Access" and allow permissions in your browser
- **"File not selected"**: Make sure to select a file before starting the transfer

### Security Features
- **End-to-end encryption**: Files are encrypted with AES-256-GCM
- **Security codes**: Verify the 4-word security code matches between sender and receiver
- **Session expiration**: Keys expire after 5 minutes for security

## Technical Details
- **Signaling Server**: WebSocket server on port 8080 for initial connection setup
- **P2P Connection**: WebRTC DataChannel for direct file transfer
- **Encryption**: AES-256-GCM with ECDH key exchange
- **File Handling**: Supports files of any size with chunked transfer

## Security Notes
- Files are never stored on the server
- All encryption happens in the browser
- Keys are generated fresh for each session
- No file data passes through the signaling server
