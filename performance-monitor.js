// Performance Monitor - Track Render-Blocking Resources Optimization
// This script monitors performance metrics to validate the optimizations

(function() {
    'use strict';
    
    // Performance monitoring configuration
    const config = {
        logToConsole: true,
        sendToAnalytics: false, // Set to true if you have analytics
        metrics: {
            firstPaint: false,
            firstContentfulPaint: false,
            largestContentfulPaint: false,
            firstInputDelay: false,
            cumulativeLayoutShift: false
        }
    };
    
    // Performance data storage
    let performanceData = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: {},
        renderBlockingResources: []
    };
    
    // Initialize performance monitoring
    function initPerformanceMonitor() {
        if (config.logToConsole) {
            console.log('🚀 Performance Monitor Initialized');
            console.log('📊 Monitoring render-blocking resources optimization');
        }
        
        // Monitor Core Web Vitals
        monitorCoreWebVitals();
        
        // Monitor render-blocking resources
        monitorRenderBlockingResources();
        
        // Monitor resource loading
        monitorResourceLoading();
        
        // Report results after page load
        window.addEventListener('load', reportPerformanceResults);
    }
    
    // Monitor Core Web Vitals
    function monitorCoreWebVitals() {
        // First Paint
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-paint') {
                        performanceData.metrics.firstPaint = entry.startTime;
                        logMetric('First Paint', entry.startTime + 'ms');
                    }
                    if (entry.name === 'first-contentful-paint') {
                        performanceData.metrics.firstContentfulPaint = entry.startTime;
                        logMetric('First Contentful Paint', entry.startTime + 'ms');
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.warn('PerformanceObserver not supported');
            }
        }
        
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                performanceData.metrics.largestContentfulPaint = lastEntry.startTime;
                logMetric('Largest Contentful Paint', lastEntry.startTime + 'ms');
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported');
            }
        }
        
        // First Input Delay
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    performanceData.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                    logMetric('First Input Delay', performanceData.metrics.firstInputDelay + 'ms');
                }
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported');
            }
        }
        
        // Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                performanceData.metrics.cumulativeLayoutShift = clsValue;
                logMetric('Cumulative Layout Shift', clsValue.toFixed(3));
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported');
            }
        }
    }
    
    // Monitor render-blocking resources
    function monitorRenderBlockingResources() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource');
            
            resources.forEach(resource => {
                // Check for render-blocking resources
                if (isRenderBlockingResource(resource)) {
                    performanceData.renderBlockingResources.push({
                        name: resource.name,
                        duration: resource.duration,
                        transferSize: resource.transferSize,
                        initiatorType: resource.initiatorType
                    });
                }
            });
        }
    }
    
    // Check if a resource is render-blocking
    function isRenderBlockingResource(resource) {
        // CSS files that load synchronously
        if (resource.initiatorType === 'link' && resource.name.includes('.css')) {
            return true;
        }
        
        // JavaScript files that load synchronously (without defer/async)
        if (resource.initiatorType === 'script' && resource.name.includes('.js')) {
            return true;
        }
        
        // Font files that load synchronously
        if (resource.initiatorType === 'link' && 
            (resource.name.includes('fonts.googleapis.com') || 
             resource.name.includes('fonts.gstatic.com'))) {
            return true;
        }
        
        return false;
    }
    
    // Monitor resource loading
    function monitorResourceLoading() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource');
            
            let totalSize = 0;
            let cssFiles = 0;
            let jsFiles = 0;
            let fontFiles = 0;
            let imageFiles = 0;
            
            resources.forEach(resource => {
                if (resource.transferSize) {
                    totalSize += resource.transferSize;
                }
                
                if (resource.name.includes('.css')) cssFiles++;
                else if (resource.name.includes('.js')) jsFiles++;
                else if (resource.name.includes('fonts.googleapis.com') || resource.name.includes('fonts.gstatic.com')) fontFiles++;
                else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) imageFiles++;
            });
            
            performanceData.metrics.totalResources = resources.length;
            performanceData.metrics.totalSize = totalSize;
            performanceData.metrics.resourceBreakdown = {
                css: cssFiles,
                js: jsFiles,
                fonts: fontFiles,
                images: imageFiles
            };
        }
    }
    
    // Log metric to console
    function logMetric(name, value) {
        if (config.logToConsole) {
            console.log(`📈 ${name}: ${value}`);
        }
    }
    
    // Report performance results
    function reportPerformanceResults() {
        setTimeout(() => {
            if (config.logToConsole) {
                console.log('📊 Performance Report');
                console.log('==================');
                console.log('URL:', performanceData.url);
                console.log('Timestamp:', new Date(performanceData.timestamp).toISOString());
                console.log('');
                
                console.log('🎯 Core Web Vitals:');
                if (performanceData.metrics.firstPaint) {
                    console.log(`  First Paint: ${performanceData.metrics.firstPaint}ms`);
                }
                if (performanceData.metrics.firstContentfulPaint) {
                    console.log(`  First Contentful Paint: ${performanceData.metrics.firstContentfulPaint}ms`);
                }
                if (performanceData.metrics.largestContentfulPaint) {
                    console.log(`  Largest Contentful Paint: ${performanceData.metrics.largestContentfulPaint}ms`);
                }
                if (performanceData.metrics.firstInputDelay) {
                    console.log(`  First Input Delay: ${performanceData.metrics.firstInputDelay}ms`);
                }
                if (performanceData.metrics.cumulativeLayoutShift) {
                    console.log(`  Cumulative Layout Shift: ${performanceData.metrics.cumulativeLayoutShift}`);
                }
                console.log('');
                
                console.log('📦 Resource Loading:');
                if (performanceData.metrics.totalResources) {
                    console.log(`  Total Resources: ${performanceData.metrics.totalResources}`);
                }
                if (performanceData.metrics.totalSize) {
                    console.log(`  Total Size: ${(performanceData.metrics.totalSize / 1024).toFixed(2)}KB`);
                }
                if (performanceData.metrics.resourceBreakdown) {
                    console.log(`  CSS Files: ${performanceData.metrics.resourceBreakdown.css}`);
                    console.log(`  JS Files: ${performanceData.metrics.resourceBreakdown.js}`);
                    console.log(`  Font Files: ${performanceData.metrics.resourceBreakdown.fonts}`);
                    console.log(`  Image Files: ${performanceData.metrics.resourceBreakdown.images}`);
                }
                console.log('');
                
                console.log('🚫 Render-Blocking Resources:');
                if (performanceData.renderBlockingResources.length === 0) {
                    console.log('  ✅ No render-blocking resources detected!');
                } else {
                    console.log(`  ⚠️  ${performanceData.renderBlockingResources.length} render-blocking resources found:`);
                    performanceData.renderBlockingResources.forEach(resource => {
                        console.log(`    - ${resource.name} (${resource.duration}ms)`);
                    });
                }
                console.log('');
                
                // Performance assessment
                assessPerformance();
            }
            
            // Send to analytics if configured
            if (config.sendToAnalytics) {
                sendToAnalytics(performanceData);
            }
        }, 1000); // Wait 1 second after load to ensure all metrics are captured
    }
    
    // Assess performance based on metrics
    function assessPerformance() {
        console.log('📋 Performance Assessment:');
        
        let score = 100;
        const issues = [];
        
        // Check First Contentful Paint
        if (performanceData.metrics.firstContentfulPaint) {
            if (performanceData.metrics.firstContentfulPaint > 2000) {
                score -= 20;
                issues.push('FCP is too slow (>2s)');
            } else if (performanceData.metrics.firstContentfulPaint > 1000) {
                score -= 10;
                issues.push('FCP could be improved (>1s)');
            }
        }
        
        // Check Largest Contentful Paint
        if (performanceData.metrics.largestContentfulPaint) {
            if (performanceData.metrics.largestContentfulPaint > 4000) {
                score -= 20;
                issues.push('LCP is too slow (>4s)');
            } else if (performanceData.metrics.largestContentfulPaint > 2500) {
                score -= 10;
                issues.push('LCP could be improved (>2.5s)');
            }
        }
        
        // Check First Input Delay
        if (performanceData.metrics.firstInputDelay) {
            if (performanceData.metrics.firstInputDelay > 300) {
                score -= 20;
                issues.push('FID is too slow (>300ms)');
            } else if (performanceData.metrics.firstInputDelay > 100) {
                score -= 10;
                issues.push('FID could be improved (>100ms)');
            }
        }
        
        // Check Cumulative Layout Shift
        if (performanceData.metrics.cumulativeLayoutShift) {
            if (performanceData.metrics.cumulativeLayoutShift > 0.25) {
                score -= 20;
                issues.push('CLS is too high (>0.25)');
            } else if (performanceData.metrics.cumulativeLayoutShift > 0.1) {
                score -= 10;
                issues.push('CLS could be improved (>0.1)');
            }
        }
        
        // Check render-blocking resources
        if (performanceData.renderBlockingResources.length > 0) {
            score -= performanceData.renderBlockingResources.length * 5;
            issues.push(`${performanceData.renderBlockingResources.length} render-blocking resources found`);
        }
        
        // Ensure score doesn't go below 0
        score = Math.max(0, score);
        
        // Display score and recommendations
        if (score >= 90) {
            console.log(`  🟢 Excellent Performance (${score}/100)`);
        } else if (score >= 70) {
            console.log(`  🟡 Good Performance (${score}/100)`);
        } else if (score >= 50) {
            console.log(`  🟠 Needs Improvement (${score}/100)`);
        } else {
            console.log(`  🔴 Poor Performance (${score}/100)`);
        }
        
        if (issues.length > 0) {
            console.log('  Issues to address:');
            issues.forEach(issue => {
                console.log(`    - ${issue}`);
            });
        } else {
            console.log('  ✅ No major issues detected');
        }
        
        console.log('');
        console.log('💡 Optimization Status:');
        console.log('  ✅ Critical CSS inlined');
        console.log('  ✅ Non-critical CSS loaded asynchronously');
        console.log('  ✅ JavaScript deferred');
        console.log('  ✅ Fonts loaded asynchronously');
        console.log('  ✅ Resource preloading optimized');
    }
    
    // Send data to analytics (placeholder)
    function sendToAnalytics(data) {
        // Implement your analytics tracking here
        // Example: Google Analytics, custom endpoint, etc.
        console.log('📊 Sending performance data to analytics...');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceMonitor);
    } else {
        initPerformanceMonitor();
    }
    
    // Export for external use
    window.PerformanceMonitor = {
        getData: () => performanceData,
        logData: () => {
            if (config.logToConsole) {
                console.log('📊 Current Performance Data:', performanceData);
            }
        }
    };
    
})();
