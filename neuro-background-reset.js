/**
 * Neuro Background Reset Handler
 * Manages responsive neuro background resets for screen ratio changes
 */

class NeuroBackgroundReset {
  constructor() {
    this.canvas = document.getElementById('aiCanvas');
    this.lastOrientation = window.orientation || 0;
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    this.lastRatio = this.lastWidth / this.lastHeight;
    this.resetTimeout = null;
    this.isResetting = false;
    
    this.init();
  }

  init() {
    if (!this.canvas) {
      console.warn('Neuro background canvas not found');
      return;
    }

    // Add performance optimization class
    this.canvas.classList.add('neuro-optimized');

    // Bind event listeners
    this.bindEvents();

    // Initial setup
    this.setupInitialState();
  }

  bindEvents() {
    // Orientation change events
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Resize events with debouncing
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 150));
    
    // Visibility change events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Focus events
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
    
    // Touch events for mobile
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    // Mouse events for desktop
    document.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  setupInitialState() {
    // Set initial custom properties based on current screen size
    this.updateCustomProperties();
    
    // Add loading state
    this.canvas.classList.add('neuro-loading');
    
    // Simulate loading completion
    setTimeout(() => {
      this.canvas.classList.remove('neuro-loading');
      this.canvas.classList.add('neuro-loaded');
    }, 500);
  }

  handleOrientationChange() {
    if (this.isResetting) return;
    
    this.isResetting = true;
    
    // Clear any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    // Add orientation reset animation
    this.canvas.classList.add('neuro-orientation-reset');
    
    // Update orientation tracking
    const newOrientation = window.orientation || 0;
    const orientationChanged = this.lastOrientation !== newOrientation;
    this.lastOrientation = newOrientation;
    
    // Wait for orientation change to complete
    this.resetTimeout = setTimeout(() => {
      this.updateCustomProperties();
      this.canvas.classList.remove('neuro-orientation-reset');
      this.isResetting = false;
    }, 800);
  }

  handleResize() {
    if (this.isResetting) return;
    
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newRatio = newWidth / newHeight;
    
    // Check if ratio changed significantly
    const ratioChange = Math.abs(newRatio - this.lastRatio);
    const sizeChange = Math.abs(newWidth - this.lastWidth) > 50 || Math.abs(newHeight - this.lastHeight) > 50;
    
    if (ratioChange > 0.1 || sizeChange) {
      this.isResetting = true;
      
      // Clear any existing timeout
      if (this.resetTimeout) {
        clearTimeout(this.resetTimeout);
      }
      
      // Add resize reset animation
      this.canvas.classList.add('neuro-resize-reset');
      
      // Update tracking
      this.lastWidth = newWidth;
      this.lastHeight = newHeight;
      this.lastRatio = newRatio;
      
      // Update custom properties
      this.updateCustomProperties();
      
      // Remove animation class after completion
      this.resetTimeout = setTimeout(() => {
        this.canvas.classList.remove('neuro-resize-reset');
        this.isResetting = false;
      }, 600);
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, reduce neuro background intensity
      this.canvas.classList.add('neuro-disabled');
    } else {
      // Page is visible, restore neuro background
      this.canvas.classList.remove('neuro-disabled');
      this.updateCustomProperties();
    }
  }

  handleFocus() {
    // Page gained focus, enhance neuro background
    this.canvas.classList.add('neuro-focused');
    
    setTimeout(() => {
      this.canvas.classList.remove('neuro-focused');
    }, 300);
  }

  handleBlur() {
    // Page lost focus, reduce neuro background
    this.canvas.classList.add('neuro-disabled');
  }

  handleTouchStart() {
    // Touch interaction started
    this.canvas.classList.add('neuro-active');
  }

  handleTouchEnd() {
    // Touch interaction ended
    setTimeout(() => {
      this.canvas.classList.remove('neuro-active');
    }, 100);
  }

  handleMouseEnter() {
    // Mouse entered the page
    this.canvas.classList.add('neuro-hover');
  }

  handleMouseLeave() {
    // Mouse left the page
    this.canvas.classList.remove('neuro-hover');
  }

  updateCustomProperties() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = width / height;
    const orientation = window.orientation || 0;
    
    // Calculate responsive properties
    const properties = this.calculateResponsiveProperties(width, height, ratio, orientation);
    
    // Apply custom properties
    document.documentElement.style.setProperty('--neuro-opacity', properties.opacity);
    document.documentElement.style.setProperty('--neuro-blur', properties.blur);
    document.documentElement.style.setProperty('--neuro-scale', properties.scale);
    document.documentElement.style.setProperty('--neuro-rotate', properties.rotate);
    document.documentElement.style.setProperty('--neuro-brightness', properties.brightness);
    document.documentElement.style.setProperty('--neuro-saturation', properties.saturation);
    document.documentElement.style.setProperty('--neuro-hue-rotate', properties.hueRotate);
    document.documentElement.style.setProperty('--neuro-transition-duration', properties.transitionDuration);
  }

  calculateResponsiveProperties(width, height, ratio, orientation) {
    let properties = {
      opacity: '0.4',
      blur: '1px',
      scale: '1',
      rotate: '0deg',
      brightness: '1',
      saturation: '1',
      hueRotate: '0deg',
      transitionDuration: '0.3s'
    };

    // Mobile devices
    if (width <= 360) {
      properties.opacity = '0.2';
      properties.blur = '2.5px';
      properties.brightness = '0.8';
      properties.transitionDuration = '0.3s';
    } else if (width <= 480) {
      properties.opacity = '0.25';
      properties.blur = '2px';
      properties.brightness = '0.85';
      properties.transitionDuration = '0.3s';
    } else if (width <= 768) {
      properties.opacity = '0.3';
      properties.blur = '1.5px';
      properties.brightness = '0.9';
      properties.transitionDuration = '0.4s';
    }
    // Tablet devices
    else if (width <= 1024) {
      properties.opacity = '0.45';
      properties.blur = '0.8px';
      properties.scale = '1.05';
      properties.transitionDuration = '0.4s';
    }
    // Desktop devices
    else if (width <= 1440) {
      properties.opacity = '0.4';
      properties.blur = '1px';
      properties.transitionDuration = '0.3s';
    }
    // Large desktop
    else if (width <= 1920) {
      properties.opacity = '0.5';
      properties.blur = '0.8px';
      properties.scale = '1.1';
      properties.brightness = '1.05';
      properties.transitionDuration = '0.3s';
    }
    // Ultra-wide screens
    else {
      properties.opacity = '0.6';
      properties.blur = '0.6px';
      properties.scale = '1.2';
      properties.brightness = '1.1';
      properties.transitionDuration = '0.3s';
    }

    // Orientation-specific adjustments
    if (width <= 768) {
      if (orientation === 90 || orientation === -90) {
        // Landscape
        properties.opacity = '0.35';
        properties.blur = '1.2px';
        properties.scale = '1.1';
        properties.brightness = '0.95';
        properties.transitionDuration = '0.5s';
      } else {
        // Portrait
        properties.opacity = '0.3';
        properties.blur = '1.5px';
        properties.scale = '1';
        properties.brightness = '0.9';
        properties.transitionDuration = '0.4s';
      }
    }

    // High DPI displays
    if (window.devicePixelRatio >= 2) {
      properties.blur = Math.max(0.4, parseFloat(properties.blur) * 0.8) + 'px';
      properties.opacity = Math.max(0.2, parseFloat(properties.opacity) * 0.875);
    }

    // Touch devices
    if ('ontouchstart' in window) {
      properties.opacity = Math.max(0.2, parseFloat(properties.opacity) * 0.75);
      properties.blur = Math.max(1px, parseFloat(properties.blur) * 1.2) + 'px';
    }

    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      properties.transitionDuration = '0.1s';
    }

    // Color scheme preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      properties.opacity = Math.max(0.1, parseFloat(properties.opacity) * 0.5);
      properties.brightness = '1.2';
    }

    return properties;
  }

  // Utility method for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Public methods for external control
  reset() {
    if (this.isResetting) return;
    
    this.isResetting = true;
    this.canvas.classList.add('neuro-reset');
    
    setTimeout(() => {
      this.canvas.classList.remove('neuro-reset');
      this.updateCustomProperties();
      this.isResetting = false;
    }, 500);
  }

  resetSlow() {
    if (this.isResetting) return;
    
    this.isResetting = true;
    this.canvas.classList.add('neuro-reset-slow');
    
    setTimeout(() => {
      this.canvas.classList.remove('neuro-reset-slow');
      this.updateCustomProperties();
      this.isResetting = false;
    }, 1000);
  }

  resetFast() {
    if (this.isResetting) return;
    
    this.isResetting = true;
    this.canvas.classList.add('neuro-reset-fast');
    
    setTimeout(() => {
      this.canvas.classList.remove('neuro-reset-fast');
      this.updateCustomProperties();
      this.isResetting = false;
    }, 200);
  }

  setError() {
    this.canvas.classList.add('neuro-error');
  }

  clearError() {
    this.canvas.classList.remove('neuro-error');
  }

  disable() {
    this.canvas.classList.add('neuro-disabled');
  }

  enable() {
    this.canvas.classList.remove('neuro-disabled');
    this.updateCustomProperties();
  }

  // Get current state
  getState() {
    return {
      width: this.lastWidth,
      height: this.lastHeight,
      ratio: this.lastRatio,
      orientation: this.lastOrientation,
      isResetting: this.isResetting
    };
  }
}

// Initialize neuro background reset handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.neuroBackgroundReset = new NeuroBackgroundReset();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuroBackgroundReset;
}
