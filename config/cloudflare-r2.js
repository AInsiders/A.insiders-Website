/**
 * Cloudflare R2 Storage Configuration
 * S3-compatible storage for user authentication and record keeping
 */

// Cloudflare R2 Configuration
const R2_CONFIG = {
  // Your Cloudflare R2 endpoint
  endpoint: 'https://8c6605e3d8e657a14c213edd34e938af.r2.cloudflarestorage.com',
  bucket: 'ainsiders',
  region: 'auto', // Cloudflare R2 uses 'auto' as region
  
  // Credentials (should be set via environment variables)
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  
  // Optional: Account ID for additional operations
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID
};

// Storage paths for different data types
const STORAGE_PATHS = {
  users: 'users/',
  sessions: 'sessions/',
  userProfiles: 'profiles/',
  userActivity: 'activity/',
  userSettings: 'settings/',
  backups: 'backups/',
  logs: 'logs/'
};

// File naming conventions
const FILE_CONVENTIONS = {
  userData: (userId) => `${STORAGE_PATHS.users}${userId}/user.json`,
  userProfile: (userId) => `${STORAGE_PATHS.userProfiles}${userId}/profile.json`,
  userSettings: (userId) => `${STORAGE_PATHS.userSettings}${userId}/settings.json`,
  sessionData: (sessionId) => `${STORAGE_PATHS.sessions}${sessionId}.json`,
  activityLog: (userId, timestamp) => `${STORAGE_PATHS.userActivity}${userId}/${timestamp}.json`,
  backupFile: (userId, timestamp) => `${STORAGE_PATHS.backups}${userId}/backup-${timestamp}.json`
};

// Security settings
const SECURITY_CONFIG = {
  // Encryption settings
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  
  // Password settings
  password: {
    saltRounds: 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  // Rate limiting for auth endpoints
  rateLimit: {
    login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
    register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 } // 3 attempts per hour
  }
};

// Data validation schemas
const VALIDATION_SCHEMAS = {
  user: {
    required: ['email', 'password', 'username'],
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    },
    username: {
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username must be 3-30 characters, alphanumeric with _ or -'
    },
    password: {
      minLength: SECURITY_CONFIG.password.minLength,
      message: `Password must be at least ${SECURITY_CONFIG.password.minLength} characters`
    }
  },
  
  profile: {
    optional: ['firstName', 'lastName', 'bio', 'avatar', 'preferences'],
    firstName: { maxLength: 50 },
    lastName: { maxLength: 50 },
    bio: { maxLength: 500 }
  }
};

// Error messages
const ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  STORAGE_ERROR: 'Storage operation failed',
  VALIDATION_ERROR: 'Invalid data provided',
  ENCRYPTION_ERROR: 'Encryption/decryption failed'
};

// Success messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

export {
  R2_CONFIG,
  STORAGE_PATHS,
  FILE_CONVENTIONS,
  SECURITY_CONFIG,
  VALIDATION_SCHEMAS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
