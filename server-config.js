// Server Configuration
// This file can be updated by the server startup script to reflect the current port

const SERVER_CONFIG = {
  port: 81, // Updated to use port 81
  baseUrl: 'http://localhost:81', // Updated to use port 81
  endpoints: {
    currentIp: '/api/current-ip',
    health: '/api/health',
    ipLookup: '/api/ip',
    proxy: '/api/proxy'
  }
};

// Function to update the port dynamically
function updatePort(newPort) {
  SERVER_CONFIG.port = newPort;
  SERVER_CONFIG.baseUrl = `http://localhost:${newPort}`;
  console.log(`Server configuration updated to port ${newPort}`);
}

// Function to get the full URL for an endpoint
function getEndpointUrl(endpoint) {
  return `${SERVER_CONFIG.baseUrl}${SERVER_CONFIG.endpoints[endpoint] || endpoint}`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SERVER_CONFIG, updatePort, getEndpointUrl };
} else {
  // Browser environment
  window.SERVER_CONFIG = SERVER_CONFIG;
  window.updatePort = updatePort;
  window.getEndpointUrl = getEndpointUrl;
}
