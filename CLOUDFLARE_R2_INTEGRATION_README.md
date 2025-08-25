# Cloudflare R2 Integration for A.Insiders

This document provides a comprehensive guide for the Cloudflare R2 storage integration that enables user authentication and record keeping for the A.Insiders website.

## Overview

The integration uses Cloudflare R2 (S3-compatible storage) to securely store user data, sessions, and activity logs. All data is encrypted using AES-256-GCM encryption before being stored in R2.

## Features

- **User Authentication**: Registration, login, logout, and session management
- **Profile Management**: User profiles with customizable fields
- **Activity Logging**: Comprehensive user activity tracking
- **Session Management**: Secure session handling with automatic cleanup
- **Data Encryption**: AES-256-GCM encryption for all stored data
- **Rate Limiting**: Protection against brute force attacks
- **JWT Tokens**: Secure authentication tokens with automatic refresh

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Auth Server     │    │  Cloudflare R2  │
│   (login.html)  │◄──►│  (auth-server.js)│◄──►│   Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  R2 Storage      │
                       │  (r2-storage.js) │
                       └──────────────────┘
```

## File Structure

```
├── config/
│   └── cloudflare-r2.js          # R2 configuration and constants
├── api/
│   ├── r2-storage.js             # Core R2 storage services
│   └── auth-server.js            # Authentication REST API
├── auth-client.js                # Client-side authentication library
├── login.html                    # Login/registration page
├── package.json                  # Dependencies
└── env-template.txt              # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `env-template.txt` to `.env` and fill in your values:

```bash
cp env-template.txt .env
```

Required environment variables:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id_here
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ENCRYPTION_KEY=your_32_character_encryption_key_here
ADMIN_KEY=your_admin_key_for_cleanup_operations

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,https://yourdomain.com
```

### 3. Get Cloudflare R2 Credentials

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket named `ainsiders`
4. Create API tokens with the following permissions:
   - Object Read
   - Object Write
   - Object Delete
   - Object List

### 4. Generate Encryption Key

Generate a 32-character encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Start the Authentication Server

```bash
node api/auth-server.js
```

The server will start on port 3001 by default.

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/profile` | Get user profile |
| PUT | `/auth/profile` | Update user profile |
| PUT | `/auth/change-password` | Change password |
| GET | `/auth/activity` | Get user activity |
| POST | `/auth/validate` | Validate token |
| POST | `/auth/refresh` | Refresh token |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## Usage Examples

### Frontend Integration

Include the auth client in your HTML:

```html
<script src="auth-client.js"></script>
```

### User Registration

```javascript
try {
    const result = await authClient.register({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe'
    });
    console.log('User registered:', result);
} catch (error) {
    console.error('Registration failed:', error.message);
}
```

### User Login

```javascript
try {
    const result = await authClient.login('john@example.com', 'securepassword123');
    console.log('Login successful:', result);
    // User is now authenticated
} catch (error) {
    console.error('Login failed:', error.message);
}
```

### Get User Profile

```javascript
try {
    const profile = await authClient.getProfile();
    console.log('User profile:', profile);
} catch (error) {
    console.error('Failed to get profile:', error.message);
}
```

### Update Profile

```javascript
try {
    const updatedProfile = await authClient.updateProfile({
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Software developer and cybersecurity enthusiast'
    });
    console.log('Profile updated:', updatedProfile);
} catch (error) {
    console.error('Failed to update profile:', error.message);
}
```

### Check Authentication Status

```javascript
if (authClient.isAuthenticated()) {
    const user = authClient.getCurrentUser();
    console.log('Current user:', user);
} else {
    console.log('User not authenticated');
}
```

### Logout

```javascript
await authClient.logout();
console.log('User logged out');
```

## Data Storage Structure

### User Data
```
users/{userId}/user.json
```

### User Profiles
```
profiles/{userId}/profile.json
```

### User Settings
```
settings/{userId}/settings.json
```

### Sessions
```
sessions/{sessionId}.json
```

### Activity Logs
```
activity/{userId}/{timestamp}.json
```

### Backups
```
backups/{userId}/backup-{timestamp}.json
```

## Security Features

### Encryption
- All data is encrypted using AES-256-GCM before storage
- Encryption keys are stored securely in environment variables
- Each object has its own IV (Initialization Vector)

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 8 characters
- Password validation includes complexity requirements

### Session Security
- JWT tokens with configurable expiration
- Session tracking with IP and user agent
- Automatic session cleanup for expired sessions
- Session invalidation on logout

### Rate Limiting
- Login attempts: 5 per 15 minutes
- Registration attempts: 3 per hour
- Password reset attempts: 3 per hour

### CORS Protection
- Configurable allowed origins
- Secure headers configuration
- CSRF protection through token validation

## Monitoring and Maintenance

### Session Cleanup

Run session cleanup manually:

```bash
curl -X POST http://localhost:3001/auth/cleanup-sessions \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your_admin_key_here"}'
```

### Health Check

```bash
curl http://localhost:3001/health
```

### Activity Monitoring

Monitor user activity through the activity logs stored in R2. Each user action is logged with:
- Timestamp
- IP address
- User agent
- Action type
- Additional details

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Input validation with detailed error messages
- **Authentication Errors**: Clear feedback for login/registration issues
- **Storage Errors**: Graceful handling of R2 storage issues
- **Network Errors**: Retry logic for failed requests

## Performance Considerations

- **Caching**: Consider implementing Redis for session caching
- **CDN**: Use Cloudflare CDN for static assets
- **Compression**: Enable gzip compression for API responses
- **Connection Pooling**: Optimize R2 connection settings

## Troubleshooting

### Common Issues

1. **R2 Connection Errors**
   - Verify R2 credentials in environment variables
   - Check bucket permissions
   - Ensure bucket exists and is accessible

2. **Authentication Failures**
   - Verify JWT secret is set correctly
   - Check token expiration settings
   - Ensure CORS is configured properly

3. **Encryption Errors**
   - Verify encryption key is 32 characters
   - Check encryption key format
   - Ensure consistent encryption settings

### Debug Mode

Enable debug mode by setting:

```env
DEBUG=true
NODE_ENV=development
```

### Logs

Check server logs for detailed error information:

```bash
tail -f logs/app.log
```

## Production Deployment

### Security Checklist

- [ ] Change default JWT secret
- [ ] Generate strong encryption key
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=your_very_long_random_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
ALLOWED_ORIGINS=https://yourdomain.com
DEBUG=false
```

### SSL/TLS

Ensure HTTPS is enabled in production:

```javascript
// In auth-server.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private.key'),
  cert: fs.readFileSync('path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Session Cleanup**: Run daily to remove expired sessions
2. **Activity Log Rotation**: Archive old activity logs
3. **Security Updates**: Keep dependencies updated
4. **Backup Verification**: Test backup and restore procedures

### Monitoring

Set up monitoring for:
- Server health and uptime
- API response times
- Error rates
- Storage usage
- Authentication attempts

### Updates

Keep the system updated:
- Regular dependency updates
- Security patches
- Feature enhancements
- Performance optimizations

## License

This integration is part of the A.Insiders project and follows the same licensing terms.

## Contributing

For contributions, please follow the project's coding standards and submit pull requests through the appropriate channels.
