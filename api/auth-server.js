/**
 * Authentication Server
 * REST API endpoints for user authentication and management using Cloudflare R2
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { UserService, SessionService, ActivityService } from './r2-storage.js';
import { SECURITY_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/cloudflare-r2.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const userService = new UserService();
const sessionService = new SessionService();
const activityService = new ActivityService();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const loginLimiter = rateLimit(SECURITY_CONFIG.rateLimit.login);
const registerLimiter = rateLimit(SECURITY_CONFIG.rateLimit.register);
const passwordResetLimiter = rateLimit(SECURITY_CONFIG.rateLimit.passwordReset);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }
    
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwt.secret);
    req.user = decoded;
    
    // Verify session is still active
    const session = await sessionService.getSession(decoded.sessionId);
    if (!session || !session.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired' 
      });
    }
    
    // Update session activity
    await sessionService.updateSessionActivity(decoded.sessionId);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.ip;
};

// Helper function to get user agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// User Registration
app.post('/auth/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username are required'
      });
    }
    
    // Create user
    const result = await userService.createUser({
      email,
      password,
      username,
      firstName,
      lastName
    });
    
    // Log activity
    await activityService.logActivity(result.user.id, 'user_registered', {
      ipAddress: clientIP,
      userAgent: userAgent,
      email: email,
      username: username
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// User Login
app.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Authenticate user
    const authResult = await userService.authenticateUser(email, password);
    
    // Create session
    const sessionId = await sessionService.createSession(
      authResult.user.id,
      userAgent,
      clientIP
    );
    
    // Log activity
    await activityService.logActivity(authResult.user.id, 'user_login', {
      ipAddress: clientIP,
      userAgent: userAgent,
      sessionId: sessionId
    });
    
    // Add session ID to token
    const tokenWithSession = jwt.sign(
      { 
        userId: authResult.user.id, 
        email: authResult.user.email,
        username: authResult.user.username,
        sessionId: sessionId
      },
      SECURITY_CONFIG.jwt.secret,
      { expiresIn: SECURITY_CONFIG.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      message: authResult.message,
      token: tokenWithSession,
      user: authResult.user,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
});

// User Logout
app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.user;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    // Invalidate session
    await sessionService.invalidateSession(sessionId);
    
    // Log activity
    await activityService.logActivity(req.user.userId, 'user_logout', {
      ipAddress: clientIP,
      userAgent: userAgent,
      sessionId: sessionId
    });
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Get User Profile
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    
    // Remove sensitive data
    const { password, ...userProfile } = user;
    
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    });
  }
});

// Update User Profile
app.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    const result = await userService.updateUserProfile(req.user.userId, {
      firstName,
      lastName,
      bio,
      avatar
    });
    
    // Log activity
    await activityService.logActivity(req.user.userId, 'profile_updated', {
      ipAddress: clientIP,
      userAgent: userAgent,
      updatedFields: Object.keys(req.body)
    });
    
    res.json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
});

// Change Password
app.put('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    const result = await userService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );
    
    // Log activity
    await activityService.logActivity(req.user.userId, 'password_changed', {
      ipAddress: clientIP,
      userAgent: userAgent
    });
    
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to change password'
    });
  }
});

// Get User Activity
app.get('/auth/activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    const activity = await activityService.getUserActivity(
      req.user.userId,
      parseInt(limit),
      parseInt(offset)
    );
    
    // Log activity
    await activityService.logActivity(req.user.userId, 'activity_viewed', {
      ipAddress: clientIP,
      userAgent: userAgent,
      limit: limit,
      offset: offset
    });
    
    res.json({
      success: true,
      activity: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity'
    });
  }
});

// Validate Token
app.post('/auth/validate', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwt.secret);
    
    // Check if user still exists
    const user = await userService.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }
    
    // Check if session is still active
    if (decoded.sessionId) {
      const session = await sessionService.getSession(decoded.sessionId);
      if (!session || !session.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Session expired'
        });
      }
    }
    
    res.json({
      success: true,
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid token'
    });
  }
});

// Refresh Token
app.post('/auth/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    // Verify current token (ignore expiration)
    const decoded = jwt.verify(token, SECURITY_CONFIG.jwt.secret, { ignoreExpiration: true });
    
    // Check if user still exists
    const user = await userService.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email,
        username: decoded.username,
        sessionId: decoded.sessionId
      },
      SECURITY_CONFIG.jwt.secret,
      { expiresIn: SECURITY_CONFIG.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Cleanup expired sessions (admin endpoint)
app.post('/auth/cleanup-sessions', async (req, res) => {
  try {
    // Simple admin check (you should implement proper admin authentication)
    const { adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    await sessionService.cleanupExpiredSessions();
    
    res.json({
      success: true,
      message: 'Expired sessions cleaned up'
    });
  } catch (error) {
    console.error('Cleanup sessions error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sessions'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
