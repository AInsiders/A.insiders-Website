# URL Redirect Checker Fix

## Problem
The URL redirect checker was failing to fetch API data because:
1. The `ip-api-server.js` file was missing from the project
2. The frontend was trying to make direct fetch requests to external URLs, which would fail due to CORS restrictions
3. No backend server was running to handle the API requests

## Solution

### 1. Created Missing IP API Server (`ip-api-server.js`)
- **Port**: 81 (as configured in `server-config.js`)
- **Features**:
  - IP geolocation lookup with caching
  - Proxy endpoint for URL redirect checking
  - Health monitoring and cache statistics
  - Rate limiting and CORS support

### 2. Updated URL Redirect Checker (`url-redirect-checker.js`)
- Modified `makeRequest()` method to use the backend proxy API
- Added proper error handling for API failures
- Maintained compatibility with existing response format

### 3. Added Required Dependencies
Updated `package.json` with:
- `express`: Web server framework
- `cors`: Cross-origin resource sharing
- `axios`: HTTP client for API requests
- `node-cache`: In-memory caching
- `express-rate-limit`: Rate limiting middleware

### 4. Created Startup Scripts
- `start-ip-server.bat`: Windows batch file for easy server startup
- Added npm scripts: `start-api` and `start-server`

## How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
**Option A: Using the batch file**
```bash
start-ip-server.bat
```

**Option B: Using npm script**
```bash
npm run start-api
```

**Option C: Manual start**
```bash
node ip-api-server.js
```

### 3. Test the Setup
Open `test-url-redirect.html` in your browser to verify:
- Backend server is running and healthy
- URL redirect checking is working properly

### 4. Use the URL Redirect Checker
Open `url-redirect-checker.html` and enter a URL to analyze.

## API Endpoints

### Health Check
```
GET http://localhost:81/api/health
```

### URL Proxy (for redirect checking)
```
POST http://localhost:81/api/proxy
Content-Type: application/json

{
  "url": "https://example.com",
  "method": "HEAD"
}
```

### IP Lookup
```
GET http://localhost:81/api/ip/{IP_ADDRESS}
```

### Current IP
```
GET http://localhost:81/api/current-ip
```

## Features

### URL Redirect Checker
- **Redirect Chain Analysis**: Tracks all redirects from original to final URL
- **Ping Information**: Simulated ping times and network information
- **Security Analysis**: Checks SSL/TLS, security headers, and calculates security score
- **Domain Information**: Basic domain analysis and WHOIS-like data
- **Connection Details**: Response times, server information, and headers

### Backend Server
- **Caching**: 12-hour cache for IP lookups to reduce API calls
- **Fallback APIs**: Uses FreeIPAPI as primary, ipgeolocation.io as fallback
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configured for local development

## Troubleshooting

### Server Won't Start
1. Check if port 81 is available
2. Ensure Node.js is installed (v14+)
3. Run `npm install` to install dependencies

### URL Redirect Checker Still Failing
1. Verify server is running: http://localhost:81/api/health
2. Check browser console for CORS errors
3. Ensure the proxy endpoint is working: test with `test-url-redirect.html`

### API Rate Limiting
- The server limits requests to 100 per 15 minutes per IP
- If you hit the limit, wait 15 minutes or clear the cache

## Security Notes

- The server includes SSRF protection for the proxy endpoint
- Rate limiting prevents abuse
- CORS is configured for local development only
- API keys should be stored in environment variables for production

## Production Deployment

For production use:
1. Use environment variables for API keys
2. Configure CORS for your domain
3. Use HTTPS
4. Add proper logging and monitoring
5. Consider using a process manager like PM2
