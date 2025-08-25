/**
 * Authentication Client Library
 * Client-side library for interacting with the authentication server
 */

class AuthClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    this.refreshTimer = null;
  }

  /**
   * Set authentication token
   */
  setToken(token, user = null) {
    this.token = token;
    if (user) {
      this.user = user;
    }
    localStorage.setItem('auth_token', token);
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          config.headers = this.getHeaders();
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        } else {
          // Refresh failed, clear auth
          this.clearAuth();
          throw new Error('Authentication expired');
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: this.token })
      });

      const data = await response.json();
      
      if (data.success) {
        this.setToken(data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: data.message,
          user: data.user
        };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.setToken(data.token, data.user);
        
        // Set up token refresh
        this.setupTokenRefresh();
        
        return {
          success: true,
          message: data.message,
          user: data.user,
          token: data.token
        };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      if (this.token) {
        await this.request('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const data = await this.request('/auth/profile');
      
      if (data.success) {
        this.user = data.user;
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const data = await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      
      if (data.success) {
        // Update local user data
        this.user = { ...this.user, ...data.profile };
        localStorage.setItem('auth_user', JSON.stringify(this.user));
        return data.profile;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const data = await this.request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (data.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get user activity
   */
  async getActivity(limit = 50, offset = 0) {
    try {
      const data = await this.request(`/auth/activity?limit=${limit}&offset=${offset}`);
      
      if (data.success) {
        return data.activity;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Get activity error:', error);
      throw error;
    }
  }

  /**
   * Validate current token
   */
  async validateToken() {
    if (!this.token) {
      return false;
    }

    try {
      const data = await fetch(`${this.baseURL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: this.token })
      }).then(res => res.json());

      if (data.success && data.valid) {
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiration (assuming 24h token)
    const refreshTime = 23 * 60 * 60 * 1000; // 23 hours
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
      this.setupTokenRefresh(); // Setup next refresh
    }, refreshTime);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get current token
   */
  getCurrentToken() {
    return this.token;
  }
}

// Create global instance
const authClient = new AuthClient();

// Export for use in modules
export default authClient;

// Also make available globally for script tags
if (typeof window !== 'undefined') {
  window.AuthClient = AuthClient;
  window.authClient = authClient;
}
