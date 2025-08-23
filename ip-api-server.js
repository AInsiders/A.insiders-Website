const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

// Server configuration
const PORT = process.env.PORT || 81;
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:81', 'http://127.0.0.1:3000', 'http://127.0.0.1:81'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Cache configuration (12 hours)
const cache = new NodeCache({ stdTTL: 43200 });

// API Keys (use environment variables in production)
const IPGEO_API_KEY = process.env.IPGEO_API_KEY || '2740500f950b4a0eabee07704cae1f36';

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    detail: 'Rate limit exceeded. Please try again later.'
  }
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const cacheStats = cache.getStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'IP API Server',
    version: '1.0.0',
    cacheStats: {
      keys: cacheStats.keys,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0
    }
  });
});

// Cache statistics endpoint
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json({
    success: true,
    data: {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0,
      uptime: process.uptime()
    }
  });
});

// Clear cache endpoint
app.delete('/api/cache', (req, res) => {
  cache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

// IP lookup endpoint
app.get('/api/ip/:ip', async (req, res) => {
  const { ip } = req.params;
  
  // Validate IP address
  if (!isValidIP(ip)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid IP address format',
      detail: 'Please provide a valid IPv4 or IPv6 address'
    });
  }

  // Check cache first
  const cacheKey = `ip_${ip}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log(`[${new Date().toISOString()}] Cache hit for IP: ${ip}`);
    return res.json({
      success: true,
      source: 'Cache',
      data: cachedData
    });
  }

  console.log(`[${new Date().toISOString()}] Cache miss for IP: ${ip}, fetching from APIs`);

  try {
    // Try primary API first (FreeIPAPI)
    let data = await fetchFromFreeIPAPI(ip);
    let source = 'FreeIPAPI';

    // If primary fails, try fallback API
    if (!data) {
      data = await fetchFromIPGeolocation(ip);
      source = 'IPGeolocation';
    }

    if (data) {
      // Normalize and enhance data
      const normalizedData = normalizeIPData(data, ip);
      
      // Cache the result
      cache.set(cacheKey, normalizedData);
      
      console.log(`[${new Date().toISOString()}] Successfully retrieved and cached data for IP: ${ip} from ${source}`);
      
      res.json({
        success: true,
        source: source,
        data: normalizedData
      });
    } else {
      throw new Error('Both APIs failed to return data');
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching data for IP ${ip}:`, error.message);
    
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      detail: 'Unable to fetch IP data from external services',
      timestamp: new Date().toISOString()
    });
  }
});

// Current IP endpoint
app.get('/api/current-ip', async (req, res) => {
  try {
    // Get client IP
    const clientIP = getClientIP(req);
    
    // Use the same IP lookup logic
    const cacheKey = `ip_${clientIP}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        source: 'Cache',
        data: cachedData
      });
    }

    // Fetch fresh data
    let data = await fetchFromFreeIPAPI(clientIP);
    let source = 'FreeIPAPI';

    if (!data) {
      data = await fetchFromIPGeolocation(clientIP);
      source = 'IPGeolocation';
    }

    if (data) {
      const normalizedData = normalizeIPData(data, clientIP);
      cache.set(cacheKey, normalizedData);
      
      res.json({
        success: true,
        source: source,
        data: normalizedData
      });
    } else {
      throw new Error('Unable to fetch current IP data');
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching current IP:`, error.message);
    
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      detail: 'Unable to fetch current IP data',
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for URL redirect checker
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, method = 'HEAD' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    if (!isValidURL(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const response = await axios({
      method: method.toLowerCase(),
      url: url,
      timeout: 10000,
      headers: {
        'User-Agent': 'A.Insiders URL Redirect Checker/1.0'
      },
      validateStatus: () => true // Don't throw on HTTP error status codes
    });

    // Extract headers
    const headers = {};
    Object.keys(response.headers).forEach(key => {
      headers[key] = response.headers[key];
    });

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: headers,
      data: response.data
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Proxy error:`, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Proxy request failed',
      detail: error.message
    });
  }
});

// Helper functions
function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getClientIP(req) {
  const xff = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const connectionIP = req.connection?.remoteAddress;
  const socketIP = req.socket?.remoteAddress;
  
  return xff?.split(',')[0]?.trim() || 
         realIP || 
         connectionIP?.replace('::ffff:', '') || 
         socketIP?.replace('::ffff:', '') || 
         '127.0.0.1';
}

async function fetchFromFreeIPAPI(ip) {
  try {
    const response = await axios.get(`https://free.freeipapi.com/json/${ip}`, {
      timeout: 5000
    });
    
    if (response.data && response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log(`[${new Date().toISOString()}] FreeIPAPI failed for IP ${ip}:`, error.message);
  }
  return null;
}

async function fetchFromIPGeolocation(ip) {
  try {
    const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEO_API_KEY}&ip=${ip}`, {
      timeout: 5000
    });
    
    if (response.data && response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log(`[${new Date().toISOString()}] IPGeolocation failed for IP ${ip}:`, error.message);
  }
  return null;
}

function normalizeIPData(data, ip) {
  // Handle FreeIPAPI format
  if (data.ipv4 || data.ip) {
    return {
      ip: data.ipv4 || data.ip,
      ipv4: data.ipv4 || data.ip,
      domain: data.domain || 'Unknown',
      isp: data.isp || data.organization || 'Unknown',
      asn: data.asn || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || data.state || 'Unknown',
      country: data.country || 'Unknown',
      country_code: data.country_code || data.countryCode || 'Unknown',
      continent: data.continent || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'Unknown',
      decimal: ipToDecimal(ip),
      binary: ipToBinary(ip),
      hex: ipToHex(ip),
      ip_class: getIPClass(ip),
      ip_type: getIPType(ip)
    };
  }
  
  // Handle IPGeolocation format
  if (data.ip) {
    return {
      ip: data.ip,
      ipv4: data.ip,
      domain: data.domain || 'Unknown',
      isp: data.isp || 'Unknown',
      asn: data.asn || 'Unknown',
      city: data.city || 'Unknown',
      region: data.state_prov || 'Unknown',
      country: data.country_name || 'Unknown',
      country_code: data.country_code2 || 'Unknown',
      continent: data.continent_name || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.time_zone?.name || 'Unknown',
      decimal: ipToDecimal(ip),
      binary: ipToBinary(ip),
      hex: ipToHex(ip),
      ip_class: getIPClass(ip),
      ip_type: getIPType(ip)
    };
  }
  
  return null;
}

function ipToDecimal(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function ipToBinary(ip) {
  return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join(' ');
}

function ipToHex(ip) {
  return '0x' + ip.split('.').map(octet => parseInt(octet).toString(16).padStart(2, '0')).join('');
}

function getIPClass(ip) {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E';
  return 'Unknown';
}

function getIPType(ip) {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet === 10) return 'Private';
  if (firstOctet === 172 && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31) return 'Private';
  if (firstOctet === 192 && parseInt(ip.split('.')[1]) === 168) return 'Private';
  if (firstOctet === 127) return 'Loopback';
  if (firstOctet === 169 && parseInt(ip.split('.')[1]) === 254) return 'Link-Local';
  return 'Public';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    detail: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    detail: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] IP API Server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[${new Date().toISOString()}] IP lookup: http://localhost:${PORT}/api/ip/{IP}`);
  console.log(`[${new Date().toISOString()}] Current IP: http://localhost:${PORT}/api/current-ip`);
});

module.exports = app;
