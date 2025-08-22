const { spawn } = require('child_process');
const net = require('net');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort = 81) {
  let port = startPort;
  while (port < startPort + 100) { // Try up to 100 ports
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + 100}`);
}

/**
 * Start the IP API server
 */
async function startServer() {
  try {
    console.log('🔍 Checking for available ports...');
    
    // Try to find an available port
                    const port = await findAvailablePort(81);
                
                if (port === 81) {
                  console.log('✅ Port 81 is available');
                } else {
                  console.log(`⚠️  Port 81 is busy, using port ${port} instead`);
                }
    
    // Set the port as an environment variable
    process.env.PORT = port.toString();
    
    // Update the server configuration file
    const fs = require('fs');
    const configPath = './server-config.js';
    let configContent = fs.readFileSync(configPath, 'utf8');
    configContent = configContent.replace(/port: \d+/, `port: ${port}`);
    configContent = configContent.replace(/baseUrl: 'http:\/\/localhost:\d+'/, `baseUrl: 'http://localhost:${port}'`);
    fs.writeFileSync(configPath, configContent);
    
    console.log(`🚀 Starting IP API Server on port ${port}...`);
    console.log(`📡 Current IP endpoint: http://localhost:${port}/api/current-ip`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
    console.log(`⚙️  Configuration updated in server-config.js`);
    console.log('');
    
    // Start the server
    const server = spawn('node', ['ip-api-server.js'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: port.toString() }
    });
    
    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
