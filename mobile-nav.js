// Enhanced Mobile Navigation with Zoom Detection and Improved Positioning
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced mobile navigation loaded');
    
    // Zoom level detection and viewport management
    let currentZoom = 1;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    
    function updateViewportInfo() {
        // Detect zoom level
        const visualViewport = window.visualViewport;
        if (visualViewport) {
            currentZoom = visualViewport.scale;
            viewportWidth = visualViewport.width;
            viewportHeight = visualViewport.height;
        } else {
            // Fallback zoom detection
            currentZoom = window.devicePixelRatio || 1;
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
        }
        
        console.log('Zoom level:', currentZoom);
        console.log('Viewport dimensions:', viewportWidth + 'x' + viewportHeight);
        
        // Update CSS custom properties for responsive calculations
        document.documentElement.style.setProperty('--current-zoom', currentZoom);
        document.documentElement.style.setProperty('--viewport-width', viewportWidth + 'px');
        document.documentElement.style.setProperty('--viewport-height', viewportHeight + 'px');
        
        // Adjust mobile menu positioning based on zoom
        adjustMobileMenuPosition();
    }
    
    function adjustMobileMenuPosition() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            // Calculate adjusted width based on zoom and viewport
            const baseWidth = Math.min(viewportWidth * 0.8, 350); // Max 80% of viewport or 350px
            const adjustedWidth = Math.min(baseWidth / currentZoom, viewportWidth * 0.9);
            
            navMenu.style.width = adjustedWidth + 'px';
            navMenu.style.maxWidth = '90vw';
            
            // Adjust z-index based on page type to avoid interfering with mouse tracking
            if (document.body.classList.contains('home-page')) {
                navMenu.style.zIndex = '50';
            } else {
                navMenu.style.zIndex = '100';
            }
            
            // Ensure menu is properly positioned
            if (navMenu.classList.contains('active')) {
                navMenu.style.right = '0';
                navMenu.style.transform = 'translateX(0)';
            } else {
                navMenu.style.right = '-' + adjustedWidth + 'px';
                navMenu.style.transform = 'translateX(100%)';
            }
            
            console.log('Menu width adjusted to:', adjustedWidth + 'px');
        }
    }
    
    // Wait a bit to ensure DOM is fully ready
    setTimeout(function() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        console.log('Nav toggle element:', navToggle);
        console.log('Nav menu element:', navMenu);
        console.log('Nav toggle display:', navToggle ? getComputedStyle(navToggle).display : 'not found');
        console.log('Nav toggle z-index:', navToggle ? getComputedStyle(navToggle).zIndex : 'not found');
        
        if (navToggle && navMenu) {
            let clickCount = 0;
            let isAnimating = false;
            
            // Initialize menu positioning
            adjustMobileMenuPosition();
            
            // Add multiple event listeners to ensure it works
            navToggle.addEventListener('click', handleToggleClick);
            navToggle.addEventListener('mousedown', handleToggleClick);
            navToggle.addEventListener('touchstart', handleToggleClick);
            
            function handleToggleClick(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (isAnimating) return; // Prevent rapid clicking during animation
                
                clickCount++;
                console.log('Nav toggle clicked! Count:', clickCount);
                console.log('Event type:', e.type);
                console.log('Current zoom:', currentZoom);
                
                isAnimating = true;
                
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                // Smooth reveal animation
                if (navMenu.classList.contains('active')) {
                    // Opening animation
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    navMenu.style.right = '0';
                    navMenu.style.transform = 'translateX(0)';
                    navMenu.style.visibility = 'visible';
                    navMenu.style.opacity = '1';
                    
                    // Add backdrop blur to body
                    document.body.style.overflow = 'hidden';
                    document.body.classList.add('menu-open');
                    
                              // Ensure mouse tracking continues to work on home page
          if (document.body.classList.contains('home-page')) {
            const aiCanvas = document.getElementById('aiCanvas');
            if (aiCanvas) {
              aiCanvas.style.pointerEvents = 'auto';
              aiCanvas.style.zIndex = '1';
            }
          }
          
          // Update backdrop width to match menu width
          const backdrop = document.querySelector('body.menu-open::before');
          if (backdrop) {
            const menuWidth = navMenu.offsetWidth;
            const backdropWidth = `calc(100% - ${menuWidth}px)`;
            document.documentElement.style.setProperty('--backdrop-width', backdropWidth);
          }
                } else {
                    // Closing animation
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    navMenu.style.right = '-' + navMenu.offsetWidth + 'px';
                    navMenu.style.transform = 'translateX(100%)';
                    
                                         // Remove backdrop blur from body
                     document.body.style.overflow = '';
                     document.body.classList.remove('menu-open');
                     
                     // Restore mouse tracking on home page
                     if (document.body.classList.contains('home-page')) {
                         const aiCanvas = document.getElementById('aiCanvas');
                         if (aiCanvas) {
                             aiCanvas.style.pointerEvents = 'auto';
                             aiCanvas.style.zIndex = '1';
                         }
                     }
                 }
                 
                 // Reset animation flag after transition
                setTimeout(() => {
                    isAnimating = false;
                }, 300);
                
                console.log('Toggle active:', navToggle.classList.contains('active'));
                console.log('Menu active:', navMenu.classList.contains('active'));
            }
            
            // Handle dropdown arrows
            const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
            dropdownArrows.forEach(arrow => {
                arrow.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.closest('.nav-dropdown');
                    if (dropdown) {
                        // Close other dropdowns first
                        document.querySelectorAll('.nav-dropdown.active').forEach(activeDropdown => {
                            if (activeDropdown !== dropdown) {
                                activeDropdown.classList.remove('active');
                            }
                        });
                        
                        dropdown.classList.toggle('active');
                        console.log('Dropdown toggled:', dropdown.classList.contains('active'));
                        console.log('Dropdown element:', dropdown);
                        console.log('Arrow clicked:', this);
                    }
                });
            });
            
            // Also handle clicks on the nav-link-container for better UX
            const navLinkContainers = document.querySelectorAll('.nav-link-container');
            navLinkContainers.forEach(container => {
                container.addEventListener('click', function(e) {
                    if (e.target.classList.contains('dropdown-arrow')) {
                        return; // Let the arrow handle it
                    }
                    
                    const dropdown = this.closest('.nav-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                        console.log('Container clicked, dropdown toggled:', dropdown.classList.contains('active'));
                    }
                });
            });
            
            // Close menu when clicking on menu items
            const menuLinks = navMenu.querySelectorAll('.nav-link');
            menuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    console.log('Menu link clicked:', this.href);
                    // Close all dropdowns when clicking a menu link
                    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    
                    // Smooth close animation
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    navMenu.style.right = '-' + navMenu.offsetWidth + 'px';
                    navMenu.style.transform = 'translateX(100%)';
                    
                    // Remove backdrop blur from body
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                });
            });
            
            // Close menu when clicking outside with improved dropdown handling
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.nav-toggle') && 
                    !e.target.closest('.nav-menu') && 
                    navMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    
                    // Smooth close animation
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    navMenu.style.right = '-' + navMenu.offsetWidth + 'px';
                    navMenu.style.transform = 'translateX(100%)';
                    
                    // Remove backdrop blur from body
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                }
            });

            // Removed hover delay to prevent orb tracking interference
            
            // Close menu on ESC key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    
                    // Smooth close animation
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    navMenu.style.right = '-' + navMenu.offsetWidth + 'px';
                    navMenu.style.transform = 'translateX(100%)';
                    
                    // Remove backdrop blur from body
                    document.body.style.overflow = '';
                    document.body.classList.remove('menu-open');
                }
            });
            
            console.log('Enhanced mobile navigation initialized successfully');
        } else {
            console.error('Navigation elements not found!');
            console.error('navToggle:', navToggle);
            console.error('navMenu:', navMenu);
        }
    }, 100);
    
    // Initialize viewport info
    updateViewportInfo();
    
    // Update on resize and zoom changes
    window.addEventListener('resize', updateViewportInfo);
    window.addEventListener('orientationchange', updateViewportInfo);
    
    // Listen for visual viewport changes (zoom, keyboard, etc.)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateViewportInfo);
        window.visualViewport.addEventListener('scroll', updateViewportInfo);
    }
    
    // Update width display
    function updateWidth() {
        console.log('Window width:', window.innerWidth + 'px');
        console.log('Visual viewport width:', window.visualViewport ? window.visualViewport.width + 'px' : 'not supported');
        console.log('Device pixel ratio:', window.devicePixelRatio);
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
});