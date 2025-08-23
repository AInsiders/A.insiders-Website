import { WebSocketServer } from 'ws';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

// roomCode -> { a?: WebSocket, b?: WebSocket }
const rooms = new Map();

console.log(`🚀 File Transfer Signaling Server starting on port ${PORT}...`);

wss.on('connection', (ws) => {
  let code = null;
  let clientId = Math.random().toString(36).substr(2, 9);
  
  console.log(`📡 New client connected: ${clientId}`);
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === 'join') {
        code = String(msg.code || '').replace(/[^0-9-]/g, '');
        
        if (!rooms.has(code)) {
          rooms.set(code, { a: null, b: null });
          console.log(`🏠 Created room: ${code}`);
        }
        
        const r = rooms.get(code);
        
        if (!r.a) {
          r.a = ws;
          console.log(`👤 Client ${clientId} joined room ${code} as peer A`);
        } else if (!r.b) {
          r.b = ws;
          console.log(`👤 Client ${clientId} joined room ${code} as peer B`);
        } else {
          ws.send(JSON.stringify({ type: 'error', reason: 'room-full' }));
          console.log(`❌ Room ${code} is full, rejecting client ${clientId}`);
          return;
        }
        
        ws.send(JSON.stringify({ type: 'joined' }));
        return;
      }
      
      // Relay everything else to the peer in same room
      if (!code) return;
      
      const r = rooms.get(code);
      const peer = r?.a === ws ? r?.b : r?.a;
      
      if (peer && peer.readyState === 1) {
        peer.send(data);
        console.log(`📤 Relayed ${msg.type || 'binary'} message in room ${code}`);
      } else {
        console.log(`⚠️  Peer not available for message relay in room ${code}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing message from ${clientId}:`, error.message);
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 Client ${clientId} disconnected`);
    
    if (!code) return;
    
    const r = rooms.get(code);
    if (!r) return;
    
    if (r.a === ws) {
      r.a = null;
      console.log(`👤 Peer A left room ${code}`);
    } else if (r.b === ws) {
      r.b = null;
      console.log(`👤 Peer B left room ${code}`);
    }
    
    if (!r.a && !r.b) {
      rooms.delete(code);
      console.log(`🏠 Room ${code} deleted (empty)`);
    } else {
      rooms.set(code, r);
    }
  });
  
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for client ${clientId}:`, error.message);
  });
});

// Health check endpoint
wss.on('listening', () => {
  console.log(`✅ File Transfer Signaling Server listening on port ${PORT}`);
  console.log(`📊 Active rooms: ${rooms.size}`);
  
  // Log server stats every 30 seconds
  setInterval(() => {
    const totalClients = Array.from(rooms.values()).reduce((sum, room) => {
      return sum + (room.a ? 1 : 0) + (room.b ? 1 : 0);
    }, 0);
    
    console.log(`📊 Server Stats - Active rooms: ${rooms.size}, Total clients: ${totalClients}`);
  }, 30000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down File Transfer Signaling Server...');
  wss.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  wss.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

export default wss;
