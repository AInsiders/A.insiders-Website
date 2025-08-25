#!/usr/bin/env node

/**
 * Setup Script for A.Insiders Cloudflare R2 Authentication
 * This script will configure your environment and test the setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate security keys
const jwtSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');
const adminKey = crypto.randomBytes(32).toString('hex');

// Environment configuration
const envConfig = `# Environment Variables for A.Insiders Cloudflare R2 Integration

# Server Configuration
PORT=3001
NODE_ENV=development

# Cloudflare R2 Storage Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id_here
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# Security Configuration
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
ADMIN_KEY=${adminKey}

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8000,https://yourdomain.com

# API Keys (if needed for other services)
IPINFO_TOKEN=your_ipinfo_token_here
IPSTACK_ACCESS_KEY=your_ipstack_access_key_here
IPGEOLOCATION_API_KEY=your_ipgeolocation_api_key_here

# Database Configuration (if using additional databases)
DATABASE_URL=your_database_url_here

# Email Configuration (for password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password_here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your_session_secret_here
SESSION_MAX_AGE=86400000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Monitoring and Analytics
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_ANALYTICS_ID=your_ga_id_here

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_PASSWORD_RESET=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_TWO_FACTOR_AUTH=false

# Development Settings
DEBUG=true
ENABLE_HOT_RELOAD=true
ENABLE_DEV_TOOLS=true
`;

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Created logs directory');
}

// Write environment file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envConfig);
console.log('✅ Created .env file with security keys');

// Display setup instructions
console.log('\n🎉 A.Insiders Authentication Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Get your Cloudflare R2 credentials:');
console.log('   - Go to https://dash.cloudflare.com/');
console.log('   - Navigate to R2 Object Storage');
console.log('   - Create a bucket named "ainsiders"');
console.log('   - Create API tokens with Object Read/Write/Delete/List permissions');
console.log('\n2. Update your .env file with your R2 credentials:');
console.log('   - R2_ACCESS_KEY_ID=your_actual_access_key');
console.log('   - R2_SECRET_ACCESS_KEY=your_actual_secret_key');
console.log('   - CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id');
console.log('\n3. Start the authentication server:');
console.log('   npm run start-auth');
console.log('\n4. Test the login page:');
console.log('   Open login.html in your browser');
console.log('\n🔐 Security Keys Generated:');
console.log(`   JWT Secret: ${jwtSecret.substring(0, 32)}...`);
console.log(`   Encryption Key: ${encryptionKey.substring(0, 32)}...`);
console.log(`   Admin Key: ${adminKey.substring(0, 32)}...`);
console.log('\n⚠️  IMPORTANT: Keep your .env file secure and never commit it to version control!');
