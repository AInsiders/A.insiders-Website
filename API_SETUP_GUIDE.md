# 🔑 API Key Setup Guide for IP Location Tool

## Overview
Your IP location tool now supports multiple premium API services for enhanced accuracy and reliability. This guide will help you set up API keys to unlock the full potential of your tool.

## 🎯 Benefits of Using API Keys

### With API Keys:
- ✅ **Faster response times** (premium APIs)
- ✅ **More accurate data** (commercial databases)
- ✅ **Higher rate limits** (paid plans)
- ✅ **Additional data fields** (ASN, hostname, security info)
- ✅ **Better reliability** (commercial uptime guarantees)

### Without API Keys:
- ✅ **Still works** with free fallbacks
- ✅ **No cost** for basic functionality
- ✅ **Automatic fallback** to free services
- ✅ **Graceful degradation** of features

## 📋 API Service Options

### 1. IPinfo (Recommended - Primary)
**Website:** [https://ipinfo.io/account/token](https://ipinfo.io/account/token)

**Free Plan:**
- 50,000 requests/month
- Basic IP information
- ASN data
- Hostname information

**Features:**
- High accuracy
- Fast response times
- Comprehensive data
- Good documentation

### 2. IPStack (Secondary)
**Website:** [https://ipstack.com/](https://ipstack.com/)

**Free Plan:**
- 100 requests/month
- Basic geolocation data
- Security information

**Features:**
- Security data (proxy/VPN detection)
- Currency information
- Timezone data

### 3. IPGeolocation.io (Tertiary)
**Website:** [https://ipgeolocation.io/](https://ipgeolocation.io/)

**Free Plan:**
- 500 requests/day
- Basic geolocation
- Security information

**Features:**
- Security data
- Currency information
- Timezone data

## 🚀 Setup Instructions

### Step 1: Get API Keys

#### For IPinfo (Recommended):
1. Go to [https://ipinfo.io/account/token](https://ipinfo.io/account/token)
2. Sign up for a free account
3. Get your API token
4. Copy the token for Step 2

#### For IPStack:
1. Go to [https://ipstack.com/](https://ipstack.com/)
2. Sign up for a free account
3. Get your API key
4. Copy the key for Step 2

#### For IPGeolocation.io:
1. Go to [https://ipgeolocation.io/](https://ipgeolocation.io/)
2. Sign up for a free account
3. Get your API key
4. Copy the key for Step 2

### Step 2: Configure Environment

1. **Copy the environment template:**
   ```bash
   cp env-template.txt .env
   ```

2. **Edit the .env file** and replace the placeholder values:
   ```env
   # Server Configuration
   PORT=3000
   CORS_ORIGIN=*
   CACHE_TTL_HOURS=12
   RATE_LIMIT_PER_MIN=120

   # API Keys (replace with your actual keys)
   IPINFO_API_KEY=your_actual_ipinfo_token_here
   IPSTACK_API_KEY=your_actual_ipstack_key_here
   IPGEO_API_KEY=your_actual_ipgeolocation_key_here
   ```

3. **Save the file**

### Step 3: Restart the Server

1. **Stop the current server** (if running):
   ```bash
   # Press Ctrl+C in the terminal where the server is running
   ```

2. **Start the enhanced server:**
   ```bash
   node ip-api-server.js
   ```

3. **Verify the startup message** shows your API keys:
   ```
   [timestamp] API Keys configured:
   [timestamp]   - IPinfo: Yes
   [timestamp]   - IPStack: Yes
   [timestamp]   - IPGeolocation: Yes
   ```

### Step 4: Test Configuration

1. **Check the health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Look for the API status in the response:**
   ```json
   {
     "api_keys_configured": {
       "ipinfo": true,
       "ipstack": true,
       "ipgeolocation": true
     }
   }
   ```

3. **Test IP lookup:**
   ```bash
   curl "http://localhost:3000/api/ip/8.8.8.8"
   ```

4. **Check the frontend** - you should see:
   - API Status panel showing configured services
   - Data source information in results
   - Enhanced data fields

## 🔧 API Priority System

The server uses a priority-based system:

1. **IPinfo** (if configured) - Primary service
2. **IPStack** (if configured) - Secondary service
3. **IPGeolocation.io** (if configured) - Tertiary service
4. **FreeIPAPI** - Fallback (always available)

If a higher-priority service fails, it automatically falls back to the next available service.

## 📊 Monitoring and Usage

### Check API Status in Frontend:
- Look for the "API Status" panel on the IP checker page
- Shows which services are configured
- Displays real-time connection status

### Check Server Logs:
- API usage is logged with timestamps
- Error messages show which service failed
- Fallback attempts are logged

### Monitor Rate Limits:
- Check your API provider dashboard
- Server logs show rate limit errors
- Frontend shows cache status

## 🛡️ Security Best Practices

1. **Never commit API keys to version control**
   - The `.env` file is already in `.gitignore`
   - Use environment variables for production

2. **Restrict API key usage** (if supported by provider)
   - Limit to your server's IP address
   - Set up usage alerts

3. **Monitor usage regularly**
   - Check API provider dashboards
   - Set up usage notifications
   - Monitor for unusual activity

4. **Rotate keys periodically**
   - Change keys every 6-12 months
   - Use different keys for development/production

## 🔍 Troubleshooting

### Common Issues:

#### "API Keys not configured"
- Check that your `.env` file exists
- Verify the API key variables are set correctly
- Restart the server after making changes

#### "Rate limit exceeded"
- Check your API provider dashboard
- Consider upgrading to a paid plan
- Implement better caching strategies

#### "Service unavailable"
- Check the API provider's status page
- Verify your API key is still valid
- Check server logs for specific error messages

#### "Invalid API key"
- Verify the key format is correct
- Check that the key is active in your provider dashboard
- Ensure you're using the right key for the right service

### Debug Steps:

1. **Check server logs** for specific error messages
2. **Test API keys individually** using curl or Postman
3. **Verify environment variables** are loaded correctly
4. **Check network connectivity** to API endpoints

## 📞 Support

If you encounter issues:

1. **Check the server logs** for error messages
2. **Verify your API keys** are correct and active
3. **Test the API endpoints** directly
4. **Check the API provider's documentation**

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Server startup shows "API Keys configured: Yes"
- ✅ Health endpoint shows all services as configured
- ✅ Frontend displays API status as "Configured ✓"
- ✅ IP lookups show data source information
- ✅ Enhanced data fields are populated
- ✅ No fallback to free services (unless premium services fail)

---

**Note:** The tool will work perfectly fine without API keys using free services. API keys simply enhance the experience with better data quality and reliability.
