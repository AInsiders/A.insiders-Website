# 🔐 Secure API Key Integration System

## Overview

This system provides a secure, centralized way to manage API keys across your application. It ensures that API keys are never exposed to the browser while providing a clean interface for making authenticated API requests.

## 🏗️ Architecture

### Server-Side Components

1. **`lib/apiClient.js`** - Secure API client wrapper
2. **`config/api.js`** - Centralized configuration and security settings
3. **`api/proxy.js`** - Secure proxy endpoint
4. **`ip-api-server.js`** - Enhanced server with proxy integration

### Client-Side Components

1. **`lib/clientApi.js`** - Client-side wrapper for secure API calls

## 🔑 API Key Management

### Environment Variables

```env
# Universal API Key for secure proxy
API_KEY=2740500f950b4a0eabee07704cae1f36

# Provider-specific keys (optional)
IPINFO_API_KEY=your_ipinfo_token
IPSTACK_API_KEY=your_ipstack_key
IPGEO_API_KEY=your_ipgeolocation_key
```

### Security Features

- ✅ **Never exposed to browser** - All API keys stay server-side
- ✅ **SSRF protection** - Whitelist of allowed URLs
- ✅ **Rate limiting** - Per-client request limits
- ✅ **CORS protection** - Restricted to allowed origins
- ✅ **Timeout handling** - Configurable request timeouts
- ✅ **Retry logic** - Automatic retries for idempotent requests
- ✅ **Error handling** - Structured error responses

## 🚀 Usage Examples

### Server-Side Usage

```javascript
const apiClient = require('./lib/apiClient');

// Basic request
const result = await apiClient.fetch({
  url: 'https://api.example.com',
  path: 'data',
  authStyle: 'bearer',
  timeout: 10000
});

// With query parameters
const result = await apiClient.get('https://api.example.com', 'users', {
  page: 1,
  limit: 10
});

// POST request with body
const result = await apiClient.post('https://api.example.com', 'users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Client-Side Usage

```javascript
// Using the client wrapper
const result = await clientApi.request({
  baseUrl: 'https://api.example.com',
  path: 'data',
  method: 'GET',
  authStyle: 'bearer'
});

// IP Geolocation specific methods
const ipInfo = await clientApi.getIpInfo('8.8.8.8');
const ipStack = await clientApi.getIpStack('8.8.8.8');
const ipGeo = await clientApi.getIpGeolocation('8.8.8.8');
```

### Direct Proxy Usage

```javascript
// Make a request through the proxy endpoint
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    baseUrl: 'https://api.example.com',
    path: 'data',
    method: 'GET',
    authStyle: 'bearer'
  })
});

const result = await response.json();
```

## 🔧 Configuration

### Auth Styles Supported

1. **Bearer Token**: `Authorization: Bearer <key>`
2. **X-API-Key**: `X-API-Key: <key>`
3. **Query Parameter**: `?api_key=<key>` or `?token=<key>`

### Provider Configuration

```javascript
// config/api.js
const API_PROVIDERS = {
  ipinfo: {
    baseUrl: 'https://ipinfo.io',
    authStyle: 'query-key',
    queryKeyName: 'token'
  },
  ipstack: {
    baseUrl: 'http://api.ipstack.com',
    authStyle: 'query-key',
    queryKeyName: 'access_key'
  }
  // ... more providers
};
```

## 🛡️ Security Features

### SSRF Protection

- Whitelist of allowed base URLs
- Blocks localhost and private IP ranges
- Validates all URLs before making requests

### Rate Limiting

- 60 requests per minute per client IP
- Configurable limits and windows
- Automatic cleanup of old requests

### CORS Protection

- Restricted to allowed origins
- Configurable headers and methods
- Preflight request handling

### Error Handling

- Structured error responses
- No sensitive data in error messages
- Proper HTTP status codes

## 📊 Monitoring and Logging

### Request Logging

```javascript
// Logs include (without sensitive data):
// - Request method and URL
// - Response status and time
// - Error messages
// - Rate limit information
```

### Health Monitoring

```javascript
// Check server health
const health = await fetch('/api/health');
const data = await health.json();

// Response includes:
// - API key configuration status
// - Rate limit information
// - Cache statistics
```

## 🔄 Migration Guide

### From Direct API Calls

**Before:**
```javascript
const response = await fetch(`https://api.example.com/data?key=${API_KEY}`);
```

**After:**
```javascript
const result = await clientApi.request({
  baseUrl: 'https://api.example.com',
  path: 'data',
  authStyle: 'query-key'
});
```

### From Hardcoded Keys

**Before:**
```javascript
const API_KEY = 'your-key-here'; // ❌ Exposed in client
```

**After:**
```javascript
// ✅ Key stays server-side, client uses proxy
const result = await clientApi.request({...});
```

## 🧪 Testing

### Unit Tests

```javascript
// Test API client
const apiClient = require('./lib/apiClient');

test('should make authenticated request', async () => {
  const result = await apiClient.fetch({
    url: 'https://httpbin.org/get',
    authStyle: 'bearer'
  });
  
  expect(result.success).toBe(true);
});
```

### Integration Tests

```javascript
// Test proxy endpoint
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseUrl: 'https://httpbin.org',
    path: 'get'
  })
});

expect(response.status).toBe(200);
```

## 🚨 Troubleshooting

### Common Issues

1. **"API_KEY not configured"**
   - Check your `.env` file
   - Ensure the key is properly set
   - Restart the server after changes

2. **"Request to unauthorized URL blocked"**
   - Add the URL to `ALLOWED_BASE_URLS` in `config/api.js`
   - Check for typos in the URL

3. **"Rate limit exceeded"**
   - Reduce request frequency
   - Implement client-side caching
   - Check rate limit configuration

4. **"CORS error"**
   - Add your domain to `CORS_CONFIG.ALLOWED_ORIGINS`
   - Check request headers

### Debug Mode

Enable detailed logging by setting the environment variable:
```env
DEBUG=true
```

## 📈 Performance

### Optimizations

- **Caching**: Server-side caching with configurable TTL
- **Connection pooling**: Reuse HTTP connections
- **Request batching**: Combine multiple requests
- **Compression**: Automatic gzip handling

### Monitoring

- Response time tracking
- Error rate monitoring
- Cache hit/miss ratios
- Rate limit usage

## 🔄 Adding New APIs

### 1. Update Configuration

```javascript
// config/api.js
const ALLOWED_BASE_URLS = [
  // ... existing URLs
  'https://new-api.com'
];

const API_PROVIDERS = {
  // ... existing providers
  newapi: {
    baseUrl: 'https://new-api.com',
    authStyle: 'bearer',
    timeout: 10000
  }
};
```

### 2. Add Client Method

```javascript
// lib/clientApi.js
async getNewAPI(path, options = {}) {
  return this.request({
    baseUrl: 'https://new-api.com',
    path,
    provider: 'newapi',
    ...options
  });
}
```

### 3. Test Integration

```javascript
// Test the new API
const result = await clientApi.getNewAPI('data');
console.log(result.data);
```

## 📚 API Reference

### Server-Side API Client

```javascript
apiClient.fetch({
  url: string,           // Base URL
  path?: string,         // Path to append
  method?: string,       // HTTP method (default: GET)
  query?: object,        // Query parameters
  body?: any,           // Request body
  authStyle?: string,    // Auth style
  timeout?: number,      // Timeout in ms
  retries?: number       // Number of retries
})
```

### Client-Side API

```javascript
clientApi.request({
  baseUrl: string,       // Base URL
  path?: string,         // Path to append
  method?: string,       // HTTP method
  query?: object,        // Query parameters
  body?: any,           // Request body
  authStyle?: string,    // Auth style
  provider?: string      // Provider name
})
```

## 🎯 Best Practices

1. **Never expose API keys** in client-side code
2. **Use the proxy endpoint** for all external API calls
3. **Implement proper error handling** for all requests
4. **Monitor rate limits** and implement backoff strategies
5. **Cache responses** when appropriate
6. **Validate all inputs** before making requests
7. **Log requests** for debugging and monitoring
8. **Use HTTPS** for all API communications

## 🔐 Security Checklist

- [ ] API keys stored in environment variables
- [ ] No hardcoded keys in source code
- [ ] SSRF protection enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive data
- [ ] All requests go through the proxy
- [ ] Timeouts configured for all requests
- [ ] Retry logic implemented for idempotent requests
- [ ] Monitoring and logging enabled

---

This system provides a secure, scalable foundation for managing API keys across your application while maintaining excellent developer experience and robust security practices.
