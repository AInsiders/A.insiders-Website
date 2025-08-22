require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiClient = require('./lib/apiClient');
const apiConfig = require('./config/api');
const { proxyMiddleware } = require('./api/proxy');

const app = express();
app.set('trust proxy', true);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json()); // For parsing JSON bodies

// --- simple in-memory cache + rate limit ---
const cache = new Map(); // key: ip -> { data, expiresAt }
const hits = new Map();  // key: clientId -> { count, windowStart }

const TTL = (parseInt(process.env.CACHE_TTL_HOURS || '12', 10)) * 60 * 60 * 1000; // default 12h
const RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN || '120', 10);

// API Keys from environment variables
const IPINFO_API_KEY = process.env.IPINFO_API_KEY;
const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
const IPGEO_API_KEY = process.env.IPGEO_API_KEY;
const UNIVERSAL_API_KEY = process.env.API_KEY;

// util: basic per-minute rate limit by client IP
function checkRate(req) {
  const id = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
  const now = Date.now();
  const rec = hits.get(id) || { count: 0, windowStart: now };
  if (now - rec.windowStart >= 60_000) { // new minute window
    rec.count = 0;
    rec.windowStart = now;
  }
  rec.count += 1;
  hits.set(id, rec);
  return rec.count <= RATE_LIMIT_PER_MIN;
}

// util: naive public-IP check (avoid RFC1918/local)
function isPublicIp(ip) {
  if (!ip) return false;
  const clean = ip.replace('::ffff:', '');
  return !/^10\.|^127\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\.|^::1$|^fc00:|^fe80:/i.test(clean);
}

// choose client IP from headers/XFF
function getClientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = xff || req.ip || req.connection?.remoteAddress || '';
  return raw.replace('::ffff:', '');
}

// Simple IP detection service
async function detectCurrentIP() {
  try {
    console.log(`[${new Date().toISOString()}] Starting IP detection...`);
    
    // Try multiple IP detection services for reliability
    const services = [
      'https://httpbin.org/ip',
      'https://api.ipify.org?format=json',
      'https://ipinfo.io/json'
    ];
    
    for (const service of services) {
      try {
        console.log(`[${new Date().toISOString()}] Trying IP service: ${service}`);
        
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'IP-Checker/1.0'
          },
          timeout: 5000
        });
        
        if (!response.ok) {
          console.log(`[${new Date().toISOString()}] Service ${service} returned status: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        let ip = null;
        
        // Handle different response formats
        if (data.origin) {
          ip = data.origin;
        } else if (data.ip) {
          ip = data.ip;
        } else if (typeof data === 'string') {
          ip = data.trim();
        }
        
        if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
          console.log(`[${new Date().toISOString()}] IP detected from ${service}: ${ip}`);
          return ip;
        }
        
        console.log(`[${new Date().toISOString()}] Invalid IP format from ${service}: ${ip}`);
      } catch (serviceError) {
        console.log(`[${new Date().toISOString()}] Service ${service} failed: ${serviceError.message}`);
        continue;
      }
    }
    
    console.log(`[${new Date().toISOString()}] All IP detection services failed`);
    return null;
  } catch (error) {
    console.log(`[${new Date().toISOString()}] IP detection failed: ${error.message}`);
    return null;
  }
}

// normalize FreeIPAPI → common schema
function normalizeFreeIPAPI(obj) {
  return {
    source: 'freeipapi',
    ip: obj.ipAddress || null,
    city: obj.cityName || null,
    region: obj.regionName || null,
    country: obj.countryName || null,
    country_code: obj.countryCode || null,
    lat: obj.latitude ?? null,
    lon: obj.longitude ?? null,
    timezone: Array.isArray(obj.timeZones) ? obj.timeZones[0] : null,
    postal: obj.zipCode || null,
    asn: obj.asn || null,
    org: obj.asnOrganization || null,
    currency: Array.isArray(obj.currencies) ? obj.currencies[0] : null,
    is_proxy: obj.isProxy ?? null
  };
}

// normalize ipgeolocation.io → common schema
function normalizeIPGeo(obj) {
  const loc = obj.location || {};
  const net = obj.network || {};
  const asn = net.asn || {};
  const tz  = obj.time_zone || {};
  const cur = obj.currency || {};
  return {
    source: 'ipgeolocation',
    ip: obj.ip || null,
    city: loc.city || null,
    region: loc.state_prov || null,
    country: loc.country_name || null,
    country_code: loc.country_code2 || null,
    lat: loc.latitude != null ? Number(loc.latitude) : null,
    lon: loc.longitude != null ? Number(loc.longitude) : null,
    timezone: tz.name || null,
    postal: loc.zipcode || null,
    asn: asn.as_number || null,
    org: asn.organization || (obj.company && obj.company.name) || null,
    currency: cur.code || null,
    is_proxy: (obj.security && typeof obj.security.is_proxy === 'boolean') ? obj.security.is_proxy : null
  };
}

// normalize IPinfo → common schema
function normalizeIPInfo(obj) {
  const [lat, lon] = (obj.loc || '').split(',').map(Number);
  return {
    source: 'ipinfo',
    ip: obj.ip || null,
    city: obj.city || null,
    region: obj.region || null,
    country: obj.country || null,
    country_code: obj.country || null,
    lat: lat || null,
    lon: lon || null,
    timezone: obj.timezone || null,
    postal: obj.postal || null,
    asn: obj.org ? obj.org.split(' ')[0].replace('AS', '') : null,
    org: obj.org ? obj.org.split(' ').slice(1).join(' ') : null,
    hostname: obj.hostname || null,
    is_proxy: null // IPinfo doesn't provide proxy info in basic response
  };
}

// normalize IPStack → common schema
function normalizeIPStack(obj) {
  return {
    source: 'ipstack',
    ip: obj.ip || null,
    city: obj.city || null,
    region: obj.region_name || null,
    country: obj.country_name || null,
    country_code: obj.country_code || null,
    lat: obj.latitude != null ? Number(obj.latitude) : null,
    lon: obj.longitude != null ? Number(obj.longitude) : null,
    timezone: obj.time_zone?.id || null,
    postal: obj.zip || null,
    asn: obj.connection?.asn || null,
    org: obj.connection?.isp || null,
    hostname: obj.hostname || null,
    is_proxy: obj.security?.proxy || false
  };
}

// Fetch from IPinfo API (primary)
async function fetchIPInfo(ip) {
  if (!IPINFO_API_KEY) {
    throw new Error('IPINFO_API_KEY not configured');
  }

  try {
    const result = await apiClient.fetch({
      url: 'https://ipinfo.io',
      path: ip,
      query: { token: IPINFO_API_KEY },
      authStyle: apiClient.AUTH_STYLES.QUERY_KEY,
      queryKeyName: 'token',
      timeout: 10000
    });

    const data = result.data;
    console.log(`[${new Date().toISOString()}] IPinfo API response for ${ip}:`, data);
    
    if (!data.ip) {
      throw new Error('IPinfo API returned invalid data');
    }

    return normalizeIPInfo(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] IPinfo API error for ${ip}:`, error.message);
    throw error;
  }
}

// Fetch from IPStack API (secondary)
async function fetchIPStack(ip) {
  if (!IPSTACK_API_KEY) {
    throw new Error('IPSTACK_API_KEY not configured');
  }

  try {
    const result = await apiClient.fetch({
      url: 'http://api.ipstack.com',
      path: ip,
      query: { 
        access_key: IPSTACK_API_KEY,
        format: 1
      },
      authStyle: apiClient.AUTH_STYLES.QUERY_KEY,
      queryKeyName: 'access_key',
      timeout: 10000
    });

    const data = result.data;
    console.log(`[${new Date().toISOString()}] IPStack API response for ${ip}:`, data);
    
    if (!data.ip) {
      throw new Error('IPStack API returned invalid data');
    }

    return normalizeIPStack(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] IPStack API error for ${ip}:`, error.message);
    throw error;
  }
}

async function fetchFreeIPAPI(ip) {
  // FreeIPAPI prefers /{ip}; if not public, let it 404 and we'll failover
  const targetIp = isPublicIp(ip) ? ip : '1.1.1.1';
  
  try {
    const result = await apiClient.fetch({
      url: 'https://free.freeipapi.com',
      path: `api/json/${targetIp}`,
      authStyle: apiClient.AUTH_STYLES.NONE, // No auth required
      timeout: 10000
    });

    const data = result.data;
    const obj = Array.isArray(data) ? data[0] : data;
    if (!obj || (obj.latitude == null && obj.longitude == null)) throw new Error('freeipapi missing coords');
    return normalizeFreeIPAPI(obj);
  } catch (error) {
    console.log(`[${new Date().toISOString()}] FreeIPAPI failed for IP: ${ip} - ${error.message}`);
    throw error;
  }
}

async function fetchIPGeolocation(ip) {
  const key = IPGEO_API_KEY;
  if (!key) throw new Error('missing IPGEO_API_KEY');
  
  try {
    const result = await apiClient.fetch({
      url: 'https://api.ipgeolocation.io',
      path: 'v2/ipgeo',
      query: { 
        apiKey: key,
        ...(isPublicIp(ip) && { ip })
      },
      authStyle: apiClient.AUTH_STYLES.QUERY_KEY,
      queryKeyName: 'apiKey',
      timeout: 10000
    });

    const data = result.data;
    if (!(data.location && data.location.latitude && data.location.longitude)) throw new Error('ipgeolocation missing coords');
    return normalizeIPGeo(data);
  } catch (error) {
    console.log(`[${new Date().toISOString()}] IPGeolocation failed for IP: ${ip} - ${error.message}`);
    throw error;
  }
}

// GET /ipinfo?ip=8.8.8.8  (ip optional; defaults to caller's public IP)
app.get('/ipinfo', async (req, res) => {
  if (!checkRate(req)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const ipParam = (req.query.ip || '').toString().trim();
  const clientIp = getClientIp(req);
  const targetIp = isPublicIp(ipParam) ? ipParam : (isPublicIp(clientIp) ? clientIp : null);
  const cacheKey = targetIp || 'SELF';

  // serve cached
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return res.json({ ...cached.data, cached: true, cache_ttl_seconds: Math.round((cached.expiresAt - now) / 1000) });
  }

  try {
    let result;
    try {
      result = await fetchFreeIPAPI(targetIp || '');
    } catch {
      result = await fetchIPGeolocation(targetIp || '');
    }
    cache.set(cacheKey, { data: result, expiresAt: now + TTL });
    res.json({ ...result, cached: false, cache_ttl_seconds: Math.round(TTL / 1000) });
  } catch (e) {
    res.status(502).json({ error: 'Lookup failed', detail: e.message });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/ip/:ip', async (req, res) => {
  if (!checkRate(req)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const ip = req.params.ip;
  const cacheKey = `ip_${ip}`;

  // serve cached
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return res.json({
      success: true,
      source: 'Cache',
      data: cached.data
    });
  }

  try {
    let result;
    
    // Try IPinfo first (if API key is configured)
    if (IPINFO_API_KEY) {
      try {
        console.log(`[${new Date().toISOString()}] Trying IPinfo API for IP: ${ip}`);
        result = await fetchIPInfo(ip);
        console.log(`[${new Date().toISOString()}] IPinfo success for IP: ${ip}`);
      } catch (error) {
        console.log(`[${new Date().toISOString()}] IPinfo failed for IP: ${ip}, trying next service`);
      }
    }

    // Try IPStack second (if API key is configured and IPinfo failed)
    if (!result && IPSTACK_API_KEY) {
      try {
        console.log(`[${new Date().toISOString()}] Trying IPStack API for IP: ${ip}`);
        result = await fetchIPStack(ip);
        console.log(`[${new Date().toISOString()}] IPStack success for IP: ${ip}`);
      } catch (error) {
        console.log(`[${new Date().toISOString()}] IPStack failed for IP: ${ip}, trying next service`);
      }
    }

    // Try ipgeolocation.io third (if API key is configured and previous services failed)
    if (!result && IPGEO_API_KEY) {
      try {
        console.log(`[${new Date().toISOString()}] Trying ipgeolocation.io for IP: ${ip}`);
        result = await fetchIPGeolocation(ip);
        console.log(`[${new Date().toISOString()}] ipgeolocation.io success for IP: ${ip}`);
      } catch (error) {
        console.log(`[${new Date().toISOString()}] ipgeolocation.io failed for IP: ${ip}, trying fallback`);
      }
    }

    // Fallback to FreeIPAPI (no API key required)
    if (!result) {
      try {
        console.log(`[${new Date().toISOString()}] Trying FreeIPAPI fallback for IP: ${ip}`);
        result = await fetchFreeIPAPI(ip);
        console.log(`[${new Date().toISOString()}] FreeIPAPI fallback success for IP: ${ip}`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] All IP lookup services failed for IP: ${ip}`);
        throw new Error(`All IP lookup services failed: ${error.message}`);
      }
    }
    
    // Add calculated fields for backward compatibility
    const enhancedData = {
      ...result,
      ipv4: result.ip,
      ipv6: 'Not Available',
      domain: 'Not Available',
      isp: result.org || 'Not Available',
      asn: result.asn || 'Not Available',
      city: result.city || 'Unknown',
      region: result.region || 'Unknown',
      country: result.country || 'Unknown',
      country_name: result.country || 'Unknown',
      country_code: result.country_code || 'Unknown',
      continent: 'Unknown',
      postal: result.postal || 'Not Available',
      latitude: result.lat || 0,
      longitude: result.lon || 0,
      timezone: result.timezone || 'Unknown',
      decimal: result.ip ? (result.ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)) : 0,
      binary: result.ip ? result.ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join(' ') : '',
      hex: result.ip ? '0x' + result.ip.split('.').map(octet => parseInt(octet).toString(16).padStart(2, '0')).join('') : '',
      ip_class: result.ip ? (parseInt(result.ip.split('.')[0]) <= 126 ? 'A' : 
                           parseInt(result.ip.split('.')[0]) <= 191 ? 'B' : 
                           parseInt(result.ip.split('.')[0]) <= 223 ? 'C' : 
                           parseInt(result.ip.split('.')[0]) <= 239 ? 'D' : 'E') : 'Unknown',
      ip_type: result.ip ? (result.ip.startsWith('127.') ? 'Loopback' : 
                          result.ip.startsWith('10.') || 
                          (result.ip.startsWith('172.') && parseInt(result.ip.split('.')[1]) >= 16 && parseInt(result.ip.split('.')[1]) <= 31) ||
                          result.ip.startsWith('192.168.') ? 'Private' : 'Public') : 'Unknown'
    };
    
    cache.set(cacheKey, { data: enhancedData, expiresAt: now + TTL });
    res.json({
      success: true,
      source: result.source,
      data: enhancedData
    });
  } catch (e) {
    res.status(502).json({
      success: false,
      error: 'Lookup failed',
      detail: e.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const clientIP = getClientIp(req);
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    clientIP: clientIP,
    api_keys_configured: {
      ipinfo: !!IPINFO_API_KEY,
      ipstack: !!IPSTACK_API_KEY,
      ipgeolocation: !!IPGEO_API_KEY
    },
    cache_stats: {
      size: cache.size,
      ttl_hours: Math.round(TTL / (60 * 60 * 1000))
    },
    rate_limit: {
      requests_per_minute: RATE_LIMIT_PER_MIN,
      current_hits: hits.size
    }
  });
});

// Cache management endpoint
app.get('/api/cache/stats', (req, res) => {
  res.json({
    cacheStats: {
      size: cache.size,
      keys: Array.from(cache.keys())
    },
    rateLimit: {
      perMinute: RATE_LIMIT_PER_MIN,
      activeClients: hits.size
    }
  });
});

// Clear cache endpoint
app.delete('/api/cache', (req, res) => {
  cache.clear();
  hits.clear();
  res.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

// Get current IP address
app.get('/api/current-ip', async (req, res) => {
  if (!checkRate(req)) return res.status(429).json({ error: 'Rate limit exceeded' });

  try {
    const currentIP = await detectCurrentIP();
    if (currentIP) {
      res.json({
        success: true,
        ip: currentIP,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to detect IP address'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'IP detection failed',
      detail: error.message
    });
  }
});

// Secure API proxy endpoint
app.post('/api/proxy', proxyMiddleware);

const port = process.env.PORT || 81;
app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Enhanced IP API Server running on port ${port}`);
  console.log(`[${new Date().toISOString()}] Health check: http://localhost:${port}/api/health`);
  console.log(`[${new Date().toISOString()}] Current IP: http://localhost:${port}/api/current-ip`);
  console.log(`[${new Date().toISOString()}] New endpoint: http://localhost:${port}/ipinfo?ip={IP}`);
  console.log(`[${new Date().toISOString()}] Legacy endpoint: http://localhost:${port}/api/ip/{IP}`);
  console.log(`[${new Date().toISOString()}] Rate limit: ${RATE_LIMIT_PER_MIN} requests per minute`);
  console.log(`[${new Date().toISOString()}] Cache TTL: ${Math.round(TTL / (60 * 60 * 1000))} hours`);
  console.log(`[${new Date().toISOString()}] API Keys configured:`);
  console.log(`[${new Date().toISOString()}]   - Universal API Key: ${UNIVERSAL_API_KEY ? 'Yes' : 'No'}`);
  console.log(`[${new Date().toISOString()}]   - IPinfo: ${IPINFO_API_KEY ? 'Yes' : 'No'}`);
  console.log(`[${new Date().toISOString()}]   - IPStack: ${IPSTACK_API_KEY ? 'Yes' : 'No'}`);
  console.log(`[${new Date().toISOString()}]   - IPGeolocation: ${IPGEO_API_KEY ? 'Yes' : 'No'}`);
  console.log(`[${new Date().toISOString()}] Secure proxy endpoint: http://localhost:${port}/api/proxy`);
});

module.exports = app;
