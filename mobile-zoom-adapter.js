/**
 * Mobile Zoom Level Adapter for A.Insiders Website
 * Automatically adjusts layout based on zoom levels and screen ratios
 * Version: 1.0.0
 */

class MobileZoomAdapter {
  constructor() {
    this.currentZoom = 1;
    this.previousZoom = 1;
    this.zoomThreshold = 0.1; // Minimum zoom change to trigger adjustment
    this.adjustmentDebounce = 250; // Debounce time in milliseconds
    this.lastAdjustment = 0;
    this.isAdjusting = false;
    
    // Zoom level breakpoints
    this.zoomLevels = {
      verySmall: 0.5,   // 50% zoom
      small: 0.75,      // 75% zoom
      normal: 1.0,      // 100% zoom
      large: 1.25,      // 125% zoom
      veryLarge: 1.5,   // 150% zoom
      extraLarge: 2.0   // 200% zoom
    };
    
    this.init();
  }

  init() {
    this.detectInitialZoom();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.applyInitialAdjustments();
  }

  detectInitialZoom() {
    // Detect initial zoom level using multiple methods
    this.currentZoom = this.getZoomLevel();
    this.previousZoom = this.currentZoom;
    console.log('Initial zoom level detected:', this.currentZoom);
  }

  getZoomLevel() {
    // Method 1: Using devicePixelRatio
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Method 2: Using visual viewport
    const visualViewport = window.visualViewport;
    let zoomLevel = 1;
    
    if (visualViewport) {
      zoomLevel = visualViewport.scale;
    } else {
      // Fallback method using screen dimensions
      const screenWidth = window.screen.width;
      const windowWidth = window.innerWidth;
      zoomLevel = screenWidth / windowWidth;
    }
    
    // Combine methods for accuracy
    const combinedZoom = (devicePixelRatio + zoomLevel) / 2;
    
    // Round to 2 decimal places
    return Math.round(combinedZoom * 100) / 100;
  }

  setupEventListeners() {
    // Listen for zoom changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleZoomChange();
      });
      
      window.visualViewport.addEventListener('scroll', () => {
        this.handleZoomChange();
      });
    }

    // Listen for window resize (includes zoom changes on some browsers)
    window.addEventListener('resize', () => {
      this.handleZoomChange();
    });

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleZoomChange();
      }, 300);
    });

    // Listen for touch events that might indicate zoom
    let touchStartDistance = 0;
    let initialZoom = 1;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        touchStartDistance = this.getTouchDistance(e.touches);
        initialZoom = this.currentZoom;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getTouchDistance(e.touches);
        const zoomChange = currentDistance / touchStartDistance;
        const newZoom = initialZoom * zoomChange;
        
        if (Math.abs(newZoom - this.currentZoom) > this.zoomThreshold) {
          this.currentZoom = Math.max(0.25, Math.min(3.0, newZoom));
          this.handleZoomChange();
        }
      }
    });
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setupResizeObserver() {
    // Observe body size changes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.body) {
            this.handleZoomChange();
          }
        }
      });
      
      resizeObserver.observe(document.body);
    }
  }

  handleZoomChange() {
    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentDebounce) {
      return;
    }

    const newZoom = this.getZoomLevel();
    
    if (Math.abs(newZoom - this.currentZoom) > this.zoomThreshold) {
      this.previousZoom = this.currentZoom;
      this.currentZoom = newZoom;
      
      console.log('Zoom level changed:', this.previousZoom, '->', this.currentZoom);
      
      this.lastAdjustment = now;
      this.adjustLayout();
    }
  }

  adjustLayout() {
    if (this.isAdjusting) return;
    
    this.isAdjusting = true;
    
    try {
      const zoomLevel = this.getZoomLevelCategory();
      this.applyZoomSpecificStyles(zoomLevel);
      this.adjustCanvasForZoom();
      this.adjustNavigationForZoom();
      this.adjustTextSizesForZoom();
      this.adjustSpacingForZoom();
      this.adjustButtonSizesForZoom();
      
      // Trigger canvas refresh
      this.refreshCanvas();
      
      console.log('Layout adjusted for zoom level:', zoomLevel);
    } catch (error) {
      console.error('Error adjusting layout for zoom:', error);
    } finally {
      this.isAdjusting = false;
    }
  }

  getZoomLevelCategory() {
    const zoom = this.currentZoom;
    
    if (zoom <= this.zoomLevels.verySmall) return 'verySmall';
    if (zoom <= this.zoomLevels.small) return 'small';
    if (zoom <= this.zoomLevels.normal) return 'normal';
    if (zoom <= this.zoomLevels.large) return 'large';
    if (zoom <= this.zoomLevels.veryLarge) return 'veryLarge';
    return 'extraLarge';
  }

  applyZoomSpecificStyles(zoomLevel) {
    const body = document.body;
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    // Remove previous zoom classes
    body.classList.remove('zoom-very-small', 'zoom-small', 'zoom-normal', 'zoom-large', 'zoom-very-large', 'zoom-extra-large');
    
    // Add current zoom class
    body.classList.add(`zoom-${zoomLevel}`);
    
    // Apply zoom-specific CSS variables
    const zoomMultipliers = {
      verySmall: 0.7,
      small: 0.85,
      normal: 1.0,
      large: 1.15,
      veryLarge: 1.3,
      extraLarge: 1.5
    };
    
    const multiplier = zoomMultipliers[zoomLevel];
    
    // Set CSS custom properties for zoom adjustments
    document.documentElement.style.setProperty('--zoom-multiplier', multiplier);
    document.documentElement.style.setProperty('--zoom-level', zoomLevel);
    
    // Apply specific adjustments based on zoom level
    switch (zoomLevel) {
      case 'verySmall':
        this.applyVerySmallZoom();
        break;
      case 'small':
        this.applySmallZoom();
        break;
      case 'normal':
        this.applyNormalZoom();
        break;
      case 'large':
        this.applyLargeZoom();
        break;
      case 'veryLarge':
        this.applyVeryLargeZoom();
        break;
      case 'extraLarge':
        this.applyExtraLargeZoom();
        break;
    }
  }

  applyVerySmallZoom() {
    // For very small zoom (50% or less)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '120vh';
      hero.style.padding = '10px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(1.2)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Adjust text sizes
    this.adjustTextSize('.page-title', 0.8);
    this.adjustTextSize('.page-subtitle', 0.8);
    this.adjustTextSize('.nav-link', 0.8);
  }

  applySmallZoom() {
    // For small zoom (75%)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '110vh';
      hero.style.padding = '15px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(1.1)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Adjust text sizes
    this.adjustTextSize('.page-title', 0.9);
    this.adjustTextSize('.page-subtitle', 0.9);
    this.adjustTextSize('.nav-link', 0.9);
  }

  applyNormalZoom() {
    // For normal zoom (100%)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '100vh';
      hero.style.padding = '20px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(1)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Reset text sizes
    this.adjustTextSize('.page-title', 1.0);
    this.adjustTextSize('.page-subtitle', 1.0);
    this.adjustTextSize('.nav-link', 1.0);
  }

  applyLargeZoom() {
    // For large zoom (125%)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '90vh';
      hero.style.padding = '25px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(0.95)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Adjust text sizes
    this.adjustTextSize('.page-title', 1.1);
    this.adjustTextSize('.page-subtitle', 1.1);
    this.adjustTextSize('.nav-link', 1.1);
  }

  applyVeryLargeZoom() {
    // For very large zoom (150%)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '80vh';
      hero.style.padding = '30px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(0.9)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Adjust text sizes
    this.adjustTextSize('.page-title', 1.2);
    this.adjustTextSize('.page-subtitle', 1.2);
    this.adjustTextSize('.nav-link', 1.2);
  }

  applyExtraLargeZoom() {
    // For extra large zoom (200%+)
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('aiCanvas');
    
    if (hero) {
      hero.style.minHeight = '70vh';
      hero.style.padding = '35px';
    }
    
    if (canvas) {
      canvas.style.transform = 'scale(0.85)';
      canvas.style.transformOrigin = 'center center';
    }
    
    // Adjust text sizes
    this.adjustTextSize('.page-title', 1.3);
    this.adjustTextSize('.page-subtitle', 1.3);
    this.adjustTextSize('.nav-link', 1.3);
  }

  adjustTextSize(selector, multiplier) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const baseSize = this.getBaseFontSize(selector);
      const newSize = baseSize * multiplier;
      element.style.fontSize = `${newSize}rem`;
    });
  }

  getBaseFontSize(selector) {
    const baseSizes = {
      '.page-title': 2.5,
      '.page-subtitle': 1.1,
      '.nav-link': 1.0
    };
    return baseSizes[selector] || 1.0;
  }

  adjustCanvasForZoom() {
    const canvas = document.getElementById('aiCanvas');
    if (!canvas) return;
    
    const zoomLevel = this.getZoomLevelCategory();
    const hero = document.querySelector('.hero');
    
    // Adjust canvas size based on zoom
    if (window.innerWidth <= 768) {
      // Mobile canvas adjustments
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      
      // Adjust canvas scale for zoom
      const scaleFactors = {
        verySmall: 1.3,
        small: 1.2,
        normal: 1.0,
        large: 0.9,
        veryLarge: 0.8,
        extraLarge: 0.7
      };
      
      const scale = scaleFactors[zoomLevel] || 1.0;
      canvas.style.transform = `scale(${scale})`;
      canvas.style.transformOrigin = 'center center';
    } else {
      // Desktop canvas adjustments
      if (hero) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    }
  }

  adjustNavigationForZoom() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (!navMenu || !navToggle) return;
    
    const zoomLevel = this.getZoomLevelCategory();
    
    // Adjust navigation spacing based on zoom
    const spacingMultipliers = {
      verySmall: 0.7,
      small: 0.85,
      normal: 1.0,
      large: 1.15,
      veryLarge: 1.3,
      extraLarge: 1.5
    };
    
    const multiplier = spacingMultipliers[zoomLevel];
    
    // Adjust mobile menu padding
    if (window.innerWidth <= 768) {
      navMenu.style.padding = `${80 * multiplier}px ${20 * multiplier}px ${20 * multiplier}px ${20 * multiplier}px`;
    }
    
    // Adjust toggle button size
    navToggle.style.padding = `${12 * multiplier}px`;
    
    const toggleSpans = navToggle.querySelectorAll('span');
    toggleSpans.forEach(span => {
      span.style.width = `${28 * multiplier}px`;
      span.style.height = `${3 * multiplier}px`;
      span.style.margin = `${3 * multiplier}px 0`;
    });
  }

  adjustTextSizesForZoom() {
    const zoomLevel = this.getZoomLevelCategory();
    
    // Adjust all text elements based on zoom
    const textElements = {
      '.page-title': { base: 2.5, mobile: 2.5, tablet: 3.5, desktop: 4.0 },
      '.page-subtitle': { base: 1.1, mobile: 1.1, tablet: 1.3, desktop: 1.5 },
      '.nav-link': { base: 1.0, mobile: 1.2, tablet: 1.0, desktop: 1.0 },
      '.btn': { base: 1.0, mobile: 1.0, tablet: 1.0, desktop: 1.1 }
    };
    
    Object.entries(textElements).forEach(([selector, sizes]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        let baseSize = sizes.base;
        
        if (window.innerWidth >= 1024) {
          baseSize = sizes.desktop;
        } else if (window.innerWidth >= 768) {
          baseSize = sizes.tablet;
        } else {
          baseSize = sizes.mobile;
        }
        
        const zoomMultipliers = {
          verySmall: 0.8,
          small: 0.9,
          normal: 1.0,
          large: 1.1,
          veryLarge: 1.2,
          extraLarge: 1.3
        };
        
        const multiplier = zoomMultipliers[zoomLevel];
        element.style.fontSize = `${baseSize * multiplier}rem`;
      });
    });
  }

  adjustSpacingForZoom() {
    const zoomLevel = this.getZoomLevelCategory();
    
    // Adjust spacing for different elements
    const spacingElements = {
      '.hero': { padding: 20, margin: 0 },
      '.hero-buttons': { gap: 16, marginTop: 32 },
      '.nav-menu': { gap: 32, padding: 20 },
      '.footer': { padding: 32 }
    };
    
    const zoomMultipliers = {
      verySmall: 0.7,
      small: 0.85,
      normal: 1.0,
      large: 1.15,
      veryLarge: 1.3,
      extraLarge: 1.5
    };
    
    const multiplier = zoomMultipliers[zoomLevel];
    
    Object.entries(spacingElements).forEach(([selector, spacing]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (spacing.padding) {
          element.style.padding = `${spacing.padding * multiplier}px`;
        }
        if (spacing.margin) {
          element.style.margin = `${spacing.margin * multiplier}px`;
        }
        if (spacing.marginTop) {
          element.style.marginTop = `${spacing.marginTop * multiplier}px`;
        }
        if (spacing.gap) {
          element.style.gap = `${spacing.gap * multiplier}px`;
        }
      });
    });
  }

  adjustButtonSizesForZoom() {
    const zoomLevel = this.getZoomLevelCategory();
    const buttons = document.querySelectorAll('.btn');
    
    const zoomMultipliers = {
      verySmall: 0.8,
      small: 0.9,
      normal: 1.0,
      large: 1.1,
      veryLarge: 1.2,
      extraLarge: 1.3
    };
    
    const multiplier = zoomMultipliers[zoomLevel];
    
    buttons.forEach(button => {
      button.style.padding = `${16 * multiplier}px ${32 * multiplier}px`;
      button.style.fontSize = `${1 * multiplier}rem`;
      button.style.borderRadius = `${8 * multiplier}px`;
    });
  }

  refreshCanvas() {
    const canvas = document.getElementById('aiCanvas');
    if (!canvas) return;
    
    // Force canvas redraw
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Trigger resize event to force brain-script refresh
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }

  applyInitialAdjustments() {
    // Apply initial adjustments when page loads
    setTimeout(() => {
      this.adjustLayout();
    }, 500);
  }

  // Public method to force refresh
  refresh() {
    this.detectInitialZoom();
    this.adjustLayout();
  }

  // Get current zoom information
  getZoomInfo() {
    return {
      currentZoom: this.currentZoom,
      previousZoom: this.previousZoom,
      zoomLevel: this.getZoomLevelCategory(),
      devicePixelRatio: window.devicePixelRatio,
      visualViewportScale: window.visualViewport ? window.visualViewport.scale : null
    };
  }
}

// Initialize the zoom adapter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mobileZoomAdapter = new MobileZoomAdapter();
  
  // Make it globally accessible for debugging
  console.log('Mobile Zoom Adapter initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileZoomAdapter;
}
