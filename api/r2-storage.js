/**
 * Cloudflare R2 Storage Service
 * Handles all S3-compatible operations for user authentication and record keeping
 */

import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { 
  R2_CONFIG, 
  STORAGE_PATHS, 
  FILE_CONVENTIONS, 
  SECURITY_CONFIG, 
  VALIDATION_SCHEMAS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../config/cloudflare-r2.js';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: R2_CONFIG.endpoint,
  region: R2_CONFIG.region,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey
  },
  forcePathStyle: true // Required for Cloudflare R2
});

/**
 * Encryption utilities using AES-256-GCM
 */
class EncryptionService {
  static generateKey() {
    return crypto.randomBytes(SECURITY_CONFIG.encryption.keyLength);
  }

  static generateIV() {
    return crypto.randomBytes(SECURITY_CONFIG.encryption.ivLength);
  }

  static encrypt(data, key) {
    try {
      const iv = this.generateIV();
      const cipher = crypto.createCipher('aes-256-gcm', key);
      cipher.setAAD(Buffer.from('user-data', 'utf8'));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(ERROR_MESSAGES.ENCRYPTION_ERROR);
    }
  }

  static decrypt(encryptedData, key, iv, tag) {
    try {
      const decipher = crypto.createDecipher('aes-256-gcm', key);
      decipher.setAAD(Buffer.from('user-data', 'utf8'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error(ERROR_MESSAGES.ENCRYPTION_ERROR);
    }
  }
}

/**
 * R2 Storage Service Class
 */
class R2StorageService {
  constructor() {
    this.bucket = R2_CONFIG.bucket;
    this.encryptionKey = process.env.ENCRYPTION_KEY || EncryptionService.generateKey();
  }

  /**
   * Check if an object exists in R2
   */
  async objectExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get object from R2
   */
  async getObject(key, decrypt = true) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      
      const response = await s3Client.send(command);
      const bodyContents = await response.Body.transformToString();
      
      if (decrypt) {
        const data = JSON.parse(bodyContents);
        return EncryptionService.decrypt(data.encrypted, this.encryptionKey, data.iv, data.tag);
      }
      
      return JSON.parse(bodyContents);
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Put object to R2
   */
  async putObject(key, data, encrypt = true) {
    try {
      let objectData;
      
      if (encrypt) {
        const encrypted = EncryptionService.encrypt(data, this.encryptionKey);
        objectData = JSON.stringify(encrypted);
      } else {
        objectData = JSON.stringify(data);
      }
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: objectData,
        ContentType: 'application/json',
        Metadata: {
          'created-at': new Date().toISOString(),
          'encrypted': encrypt.toString()
        }
      });
      
      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`Error putting object ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Delete object from R2
   */
  async deleteObject(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      
      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`Error deleting object ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * List objects in R2 with prefix
   */
  async listObjects(prefix, maxKeys = 1000) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      });
      
      const response = await s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error(`Error listing objects with prefix ${prefix}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Generate presigned URL for direct upload/download
   */
  async generatePresignedUrl(key, operation = 'getObject', expiresIn = 3600) {
    try {
      let command;
      
      if (operation === 'getObject') {
        command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key
        });
      } else if (operation === 'putObject') {
        command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key
        });
      } else {
        throw new Error('Invalid operation');
      }
      
      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error(`Error generating presigned URL for ${key}:`, error);
      throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
  }
}

/**
 * User Management Service
 */
class UserService extends R2StorageService {
  constructor() {
    super();
  }

  /**
   * Validate user data
   */
  validateUserData(userData) {
    const schema = VALIDATION_SCHEMAS.user;
    
    // Check required fields
    for (const field of schema.required) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate email
    if (!schema.email.pattern.test(userData.email)) {
      throw new Error(schema.email.message);
    }
    
    // Validate username
    if (userData.username.length < schema.username.minLength || 
        userData.username.length > schema.username.maxLength ||
        !schema.username.pattern.test(userData.username)) {
      throw new Error(schema.username.message);
    }
    
    // Validate password
    if (userData.password.length < schema.password.minLength) {
      throw new Error(schema.password.message);
    }
    
    return true;
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      // Validate user data
      this.validateUserData(userData);
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }
      
      // Generate user ID
      const userId = uuidv4();
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SECURITY_CONFIG.password.saltRounds);
      
      // Create user object
      const user = {
        id: userId,
        email: userData.email.toLowerCase(),
        username: userData.username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: null,
        loginCount: 0
      };
      
      // Store user data
      const userKey = FILE_CONVENTIONS.userData(userId);
      await this.putObject(userKey, user);
      
      // Create default profile
      const profile = {
        userId: userId,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: '',
        avatar: '',
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const profileKey = FILE_CONVENTIONS.userProfile(userId);
      await this.putObject(profileKey, profile);
      
      // Create default settings
      const settings = {
        userId: userId,
        theme: 'light',
        notifications: {
          email: true,
          push: false
        },
        privacy: {
          profileVisibility: 'public',
          activityVisibility: 'friends'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const settingsKey = FILE_CONVENTIONS.userSettings(userId);
      await this.putObject(settingsKey, settings);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.USER_CREATED,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      // List all users and find by email
      const users = await this.listObjects(STORAGE_PATHS.users);
      
      for (const userObj of users) {
        const userKey = userObj.Key;
        if (userKey.endsWith('/user.json')) {
          const user = await this.getObject(userKey);
          if (user.email.toLowerCase() === email.toLowerCase()) {
            return user;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const userKey = FILE_CONVENTIONS.userData(userId);
      const exists = await this.objectExists(userKey);
      
      if (!exists) {
        return null;
      }
      
      return await this.getObject(userKey);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
      }
      
      // Update login statistics
      user.lastLogin = new Date().toISOString();
      user.loginCount += 1;
      user.updatedAt = new Date().toISOString();
      
      const userKey = FILE_CONVENTIONS.userData(user.id);
      await this.putObject(userKey, user);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username 
        },
        SECURITY_CONFIG.jwt.secret,
        { expiresIn: SECURITY_CONFIG.jwt.expiresIn }
      );
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount
        }
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const profileKey = FILE_CONVENTIONS.userProfile(userId);
      const exists = await this.objectExists(profileKey);
      
      if (!exists) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      const currentProfile = await this.getObject(profileKey);
      
      // Update profile data
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      await this.putObject(profileKey, updatedProfile);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        profile: updatedProfile
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.getUserById(userId);
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Validate new password
      if (newPassword.length < SECURITY_CONFIG.password.minLength) {
        throw new Error(`Password must be at least ${SECURITY_CONFIG.password.minLength} characters`);
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, SECURITY_CONFIG.password.saltRounds);
      
      // Update user
      user.password = hashedNewPassword;
      user.updatedAt = new Date().toISOString();
      
      const userKey = FILE_CONVENTIONS.userData(userId);
      await this.putObject(userKey, user);
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_CHANGED
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

/**
 * Session Management Service
 */
class SessionService extends R2StorageService {
  constructor() {
    super();
  }

  /**
   * Create new session
   */
  async createSession(userId, userAgent, ipAddress) {
    try {
      const sessionId = uuidv4();
      
      const session = {
        id: sessionId,
        userId: userId,
        userAgent: userAgent,
        ipAddress: ipAddress,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true
      };
      
      const sessionKey = FILE_CONVENTIONS.sessionData(sessionId);
      await this.putObject(sessionKey, session);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    try {
      const sessionKey = FILE_CONVENTIONS.sessionData(sessionId);
      const exists = await this.objectExists(sessionKey);
      
      if (!exists) {
        return null;
      }
      
      return await this.getObject(sessionKey);
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      session.lastActivity = new Date().toISOString();
      
      const sessionKey = FILE_CONVENTIONS.sessionData(sessionId);
      await this.putObject(sessionKey, session);
      
      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw error;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId) {
    try {
      const sessionKey = FILE_CONVENTIONS.sessionData(sessionId);
      await this.deleteObject(sessionKey);
      
      return true;
    } catch (error) {
      console.error('Error invalidating session:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const sessions = await this.listObjects(STORAGE_PATHS.sessions);
      const now = new Date();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      for (const sessionObj of sessions) {
        const session = await this.getObject(sessionObj.Key);
        const sessionAge = now - new Date(session.createdAt);
        
        if (sessionAge > maxAge || !session.isActive) {
          await this.deleteObject(sessionObj.Key);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }
}

/**
 * Activity Logging Service
 */
class ActivityService extends R2StorageService {
  constructor() {
    super();
  }

  /**
   * Log user activity
   */
  async logActivity(userId, action, details = {}) {
    try {
      const timestamp = new Date().toISOString();
      const activityId = uuidv4();
      
      const activity = {
        id: activityId,
        userId: userId,
        action: action,
        details: details,
        timestamp: timestamp,
        ipAddress: details.ipAddress || '',
        userAgent: details.userAgent || ''
      };
      
      const activityKey = FILE_CONVENTIONS.activityLog(userId, timestamp);
      await this.putObject(activityKey, activity);
      
      return activityId;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId, limit = 50, offset = 0) {
    try {
      const activities = await this.listObjects(`${STORAGE_PATHS.userActivity}${userId}/`);
      
      // Sort by timestamp (newest first)
      const sortedActivities = activities.sort((a, b) => {
        const aTimestamp = a.Key.split('/').pop().replace('.json', '');
        const bTimestamp = b.Key.split('/').pop().replace('.json', '');
        return new Date(bTimestamp) - new Date(aTimestamp);
      });
      
      // Apply pagination
      const paginatedActivities = sortedActivities.slice(offset, offset + limit);
      
      // Get activity details
      const activityDetails = [];
      for (const activityObj of paginatedActivities) {
        const activity = await this.getObject(activityObj.Key);
        activityDetails.push(activity);
      }
      
      return {
        activities: activityDetails,
        total: activities.length,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }
}

// Export services
export {
  R2StorageService,
  UserService,
  SessionService,
  ActivityService,
  EncryptionService
};
