# Secure File Transfer Tool

A modern, end-to-end encrypted file transfer tool built with WebRTC and AES-256 encryption. Transfer files directly between devices without server storage.

## Features

- 🔒 **End-to-End Encryption**: AES-256 encryption ensures files are never stored on servers
- 🌐 **P2P Transfer**: Direct peer-to-peer connection using WebRTC
- 📱 **Modern UI**: Beautiful, responsive interface matching A.Insiders design
- 🚀 **Unlimited File Sizes**: Stream files with backpressure handling
- 🔐 **Security Verification**: SAS (Short Authentication String) for connection verification
- 📁 **Drag & Drop**: Easy file selection with drag and drop support
- 💾 **File System Access**: Modern browser APIs for seamless file saving

## Security Features

- **AES-256-GCM Encryption**: Military-grade encryption for all file data
- **WebRTC DataChannels**: Direct P2P communication
- **No Server Storage**: Files never touch the signaling server
- **SAS Verification**: Short Authentication String for connection verification
- **Chunked Transfer**: Files are encrypted and transferred in chunks

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies for the signaling server
npm install ws
```

### 2. Start the Signaling Server

```bash
# Start the WebSocket signaling server
node file-transfer-server.js
```

The server will start on port 8080 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 node file-transfer-server.js
```

### 3. Serve the Client

Serve the `file-transfer.html` file using any static file server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (install http-server globally)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

### 4. Access the Tool

Open your browser and navigate to:
```
http://localhost:8000/file-transfer.html
```

## Usage

### For Senders:

1. **Select Role**: Click "I'm Sending Files"
2. **Enter Room Code**: Create or enter a room code (e.g., "123-456")
3. **Connect**: Click "Connect" to establish the connection
4. **Select File**: Drag and drop or click to browse for a file
5. **Verify Security Code**: Share the security code with the receiver
6. **Start Transfer**: Click "Start Transfer" when ready

### For Receivers:

1. **Select Role**: Click "I'm Receiving Files"
2. **Enter Room Code**: Enter the same room code as the sender
3. **Connect**: Click "Connect" to establish the connection
4. **Verify Security Code**: Confirm the security code matches the sender's
5. **Accept File**: Click "Accept & Receive" to start receiving
6. **Save File**: Choose where to save the received file

## Technical Details

### Architecture

```
Client A (Sender) ←→ WebSocket Server ←→ Client B (Receiver)
       ↓                    ↓                    ↓
   WebRTC Offer         Signaling          WebRTC Answer
       ↓                    ↓                    ↓
   DataChannel ←→ Direct P2P Connection ←→ DataChannel
       ↓                                        ↓
   Encrypt & Send                            Decrypt & Save
```

### Encryption Flow

1. **Key Generation**: Each session generates a unique AES-256 key
2. **Chunk Encryption**: Files are encrypted in 256KB chunks using AES-GCM
3. **IV Generation**: Each chunk gets a unique 12-byte initialization vector
4. **Secure Transfer**: Encrypted chunks are sent via WebRTC DataChannel
5. **Decryption**: Receiver decrypts chunks and reconstructs the file

### File Transfer Process

1. **Metadata Exchange**: File name, size, and type are shared
2. **Acceptance Gate**: Receiver must accept before transfer begins
3. **Streaming Transfer**: File is streamed in encrypted chunks
4. **Progress Tracking**: Real-time progress and speed monitoring
5. **File Reconstruction**: Receiver reassembles the complete file

## Browser Compatibility

### Required Features:
- WebRTC (RTCPeerConnection, RTCDataChannel)
- Web Crypto API (crypto.subtle)
- File API (File, FileReader, Blob)
- File System Access API (optional, for better UX)

### Supported Browsers:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

### Fallback Support:
- File System Access API not available: Uses blob download
- Large files: Buffered in memory (not recommended for very large files)

## Configuration

### Server Configuration

Edit `file-transfer-server.js` to customize:

```javascript
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  // Add your TURN servers here for better NAT traversal
  // { urls: 'turn:your-turn-server:3478', username: 'user', credential: 'pass' }
];
```

### Client Configuration

Edit the configuration in `file-transfer.html`:

```javascript
const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':8080';
const CHUNK_SIZE = 256 * 1024; // 256 KiB chunks
const DC_BUF_HIGH = 8 * 1024 * 1024;  // 8 MB buffer high water mark
const DC_BUF_LOW  = 2 * 1024 * 1024;  // 2 MB buffer low water mark
```

## Security Considerations

### What's Encrypted:
- ✅ File content (AES-256-GCM)
- ✅ File metadata (name, size, type)
- ✅ Control messages

### What's Not Encrypted:
- ⚠️ Room codes (for signaling)
- ⚠️ WebRTC signaling messages (SDP, ICE candidates)
- ⚠️ Connection metadata (timestamps, connection status)

### Recommendations:
1. Use strong, unique room codes
2. Verify SAS codes before accepting files
3. Use HTTPS in production
4. Consider adding TURN servers for better NAT traversal
5. Implement rate limiting on the signaling server

## Troubleshooting

### Common Issues:

**Connection Fails:**
- Check if the signaling server is running
- Verify the WebSocket URL in the client
- Check firewall settings

**File Transfer Stuck:**
- Check browser console for errors
- Verify both peers are connected
- Try refreshing the page

**Large Files Fail:**
- Ensure sufficient memory is available
- Check browser's file size limits
- Use File System Access API for better performance

**NAT Traversal Issues:**
- Add TURN servers to ICE_SERVERS configuration
- Check network firewall settings
- Try different network connections

### Debug Mode:

Enable debug logging by opening browser console and running:
```javascript
localStorage.setItem('debug', 'true');
```

## Development

### Project Structure:
```
file-transfer/
├── file-transfer.html          # Main client application
├── file-transfer-server.js     # WebSocket signaling server
├── file-transfer-package.json  # Server dependencies
└── FILE_TRANSFER_README.md     # This file
```

### Adding Features:
1. **Custom Encryption**: Modify the `deriveSessionKey()` function
2. **Resume Support**: Implement chunk tracking and resume logic
3. **Multiple Files**: Extend the protocol for multiple file transfers
4. **Progress Persistence**: Add localStorage for transfer progress

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/AInsiders/file-transfer/issues)
- Email: support@ainsidersnetwork.com
- Discord: [Join our community](https://discord.gg/Y4kCtaBZFM)

---

**Built with ❤️ by A.Insiders**
