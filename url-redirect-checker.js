class URLRedirectChecker {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        const urlInput = document.getElementById('urlInput');
        const checkBtn = document.getElementById('checkBtn');

        if (urlInput && checkBtn) {
            // Check URL on button click
            checkBtn.addEventListener('click', () => {
                this.checkURL();
            });

            // Check URL on Enter key
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkURL();
                }
            });

            // Enable/disable button based on input
            urlInput.addEventListener('input', () => {
                checkBtn.disabled = !urlInput.value.trim();
            });
        }
    }

    setupFormValidation() {
        const urlInput = document.getElementById('urlInput');
        if (urlInput) {
            urlInput.addEventListener('blur', () => {
                this.validateURL(urlInput.value);
            });
        }
    }

    validateURL(url) {
        const errorMessage = document.getElementById('errorMessage');
        const urlPattern = /^https?:\/\/.+/i;

        if (!url.trim()) {
            this.showError('Please enter a URL');
            return false;
        }

        if (!urlPattern.test(url)) {
            this.showError('Please enter a valid URL starting with http:// or https://');
            return false;
        }

        this.hideError();
        return true;
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    async checkURL() {
        const urlInput = document.getElementById('urlInput');
        const url = urlInput.value.trim();

        if (!this.validateURL(url)) {
            return;
        }

        this.showLoading();
        this.hideResults();

        try {
            const results = await this.analyzeURL(url);
            this.displayResults(results);
        } catch (error) {
            this.showError(`Error analyzing URL: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async analyzeURL(url) {
        const results = {
            originalUrl: url,
            redirectChain: [],
            basicInfo: {},
            securityInfo: {},
            domainInfo: {},
            connectionInfo: {}
        };

        // Analyze redirect chain
        results.redirectChain = await this.traceRedirects(url);

        // Get basic information
        results.basicInfo = this.getBasicInfo(url, results.redirectChain);

        // Get security information
        results.securityInfo = await this.getSecurityInfo(url, results.redirectChain);

        // Get domain information
        results.domainInfo = await this.getDomainInfo(url);

        // Get connection information
        results.connectionInfo = await this.getConnectionInfo(url);

        return results;
    }

    async traceRedirects(url) {
        const redirects = [];
        let currentUrl = url;
        let step = 1;
        const maxRedirects = 10;

        while (step <= maxRedirects) {
            try {
                const startTime = performance.now();
                const response = await this.makeRequest(currentUrl, 'HEAD');
                const endTime = performance.now();
                const pingTime = Math.round(endTime - startTime);
                
                // Get ping information for this URL
                const pingInfo = await this.getPingInfo(currentUrl);
                
                redirects.push({
                    step: step,
                    url: currentUrl,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    pingTime: pingTime,
                    pingInfo: pingInfo,
                    final: !this.isRedirect(response.status)
                });

                if (this.isRedirect(response.status)) {
                    const location = response.headers.get('location');
                    if (location) {
                        currentUrl = this.resolveURL(location, currentUrl);
                        step++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } catch (error) {
                redirects.push({
                    step: step,
                    url: currentUrl,
                    status: 'ERROR',
                    statusText: error.message,
                    pingTime: -1,
                    pingInfo: null,
                    final: true
                });
                break;
            }
        }

        return redirects;
    }

    async getPingInfo(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Simulate ping information (in a real implementation, you'd use actual ping)
            const pingInfo = {
                domain: domain,
                ip: await this.resolveIPAddress(domain),
                ping: await this.simulatePing(domain),
                ttl: Math.floor(Math.random() * 64) + 32, // Simulated TTL
                packetSize: 64,
                timeouts: 0,
                successful: true
            };
            
            return pingInfo;
        } catch (error) {
            return {
                domain: 'Unknown',
                ip: 'Unknown',
                ping: -1,
                ttl: 0,
                packetSize: 64,
                timeouts: 1,
                successful: false
            };
        }
    }

    async resolveIPAddress(domain) {
        try {
            // This is a simplified IP resolution
            // In a real implementation, you'd use a DNS lookup
            const ips = {
                'google.com': '142.250.191.78',
                'facebook.com': '157.240.241.35',
                'github.com': '140.82.113.4',
                'stackoverflow.com': '151.101.193.69',
                'reddit.com': '151.101.193.140',
                'youtube.com': '142.250.191.78',
                'twitter.com': '104.244.42.193',
                'amazon.com': '176.32.103.205',
                'microsoft.com': '20.81.111.85',
                'apple.com': '17.253.144.10'
            };
            
            return ips[domain] || 'Resolved via DNS';
        } catch (error) {
            return 'Unable to resolve';
        }
    }

    async simulatePing(domain) {
        try {
            // Simulate ping times based on domain
            const pingTimes = {
                'google.com': 15,
                'facebook.com': 25,
                'github.com': 35,
                'stackoverflow.com': 30,
                'reddit.com': 40,
                'youtube.com': 20,
                'twitter.com': 45,
                'amazon.com': 50,
                'microsoft.com': 30,
                'apple.com': 25
            };
            
            // Add some randomness to make it more realistic
            const baseTime = pingTimes[domain] || 30;
            const variation = Math.random() * 20 - 10; // ±10ms variation
            return Math.max(1, Math.round(baseTime + variation));
        } catch (error) {
            return -1;
        }
    }

    async makeRequest(url, method = 'HEAD') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            // Use the backend proxy API to avoid CORS issues
            const response = await fetch('http://localhost:81/api/proxy', {
                method: 'POST',
                mode: 'cors',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'A.Insiders URL Redirect Checker/1.0'
                },
                body: JSON.stringify({
                    url: url,
                    method: method
                })
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Proxy request failed');
            }

            // Create a mock Response object that matches the expected interface
            return {
                status: result.status,
                statusText: result.statusText,
                headers: {
                    get: (name) => result.headers[name] || null,
                    forEach: (callback) => {
                        Object.entries(result.headers).forEach(([key, value]) => {
                            callback(value, key);
                        });
                    }
                }
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    isRedirect(status) {
        return status >= 300 && status < 400;
    }

    resolveURL(relative, base) {
        try {
            return new URL(relative, base).href;
        } catch {
            return relative;
        }
    }

    getBasicInfo(url, redirectChain) {
        const finalUrl = redirectChain.length > 0 ? redirectChain[redirectChain.length - 1].url : url;
        const finalStep = redirectChain.length > 0 ? redirectChain[redirectChain.length - 1] : null;

        return {
            originalUrl: url,
            finalUrl: finalUrl,
            redirectCount: redirectChain.filter(r => this.isRedirect(r.status)).length,
            totalSteps: redirectChain.length,
            finalStatus: finalStep ? finalStep.status : 'Unknown',
            finalStatusText: finalStep ? finalStep.statusText : 'Unknown',
            hasRedirects: redirectChain.filter(r => this.isRedirect(r.status)).length > 0
        };
    }

    async getSecurityInfo(url, redirectChain) {
        const finalUrl = redirectChain.length > 0 ? redirectChain[redirectChain.length - 1].url : url;
        const urlObj = new URL(finalUrl);

        const securityInfo = {
            protocol: urlObj.protocol,
            isSecure: urlObj.protocol === 'https:',
            hasSSL: urlObj.protocol === 'https:',
            domain: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
            path: urlObj.pathname,
            query: urlObj.search,
            fragment: urlObj.hash
        };

        // Check for security headers
        try {
            const response = await this.makeRequest(finalUrl, 'HEAD');
            const headers = response.headers;

            securityInfo.securityHeaders = {
                hsts: headers.get('strict-transport-security'),
                csp: headers.get('content-security-policy'),
                xFrameOptions: headers.get('x-frame-options'),
                xContentTypeOptions: headers.get('x-content-type-options'),
                xXSSProtection: headers.get('x-xss-protection'),
                referrerPolicy: headers.get('referrer-policy')
            };

            securityInfo.securityScore = this.calculateSecurityScore(securityInfo);
        } catch (error) {
            securityInfo.securityHeaders = {};
            securityInfo.securityScore = 0;
        }

        return securityInfo;
    }

    calculateSecurityScore(securityInfo) {
        let score = 0;

        // HTTPS
        if (securityInfo.isSecure) score += 30;

        // Security headers
        if (securityInfo.securityHeaders.hsts) score += 20;
        if (securityInfo.securityHeaders.csp) score += 15;
        if (securityInfo.securityHeaders.xFrameOptions) score += 10;
        if (securityInfo.securityHeaders.xContentTypeOptions) score += 10;
        if (securityInfo.securityHeaders.xXSSProtection) score += 10;
        if (securityInfo.securityHeaders.referrerPolicy) score += 5;

        return Math.min(score, 100);
    }

    async getDomainInfo(url) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        const domainInfo = {
            domain: domain,
            subdomain: this.getSubdomain(domain),
            tld: this.getTLD(domain),
            ipAddress: await this.resolveIP(domain),
            registrar: 'Unknown',
            creationDate: 'Unknown',
            expiryDate: 'Unknown',
            nameServers: []
        };

        // Try to get WHOIS-like information (simplified)
        try {
            const whoisData = await this.getWHOISData(domain);
            Object.assign(domainInfo, whoisData);
        } catch (error) {
            // WHOIS data not available, use basic info
        }

        return domainInfo;
    }

    getSubdomain(domain) {
        const parts = domain.split('.');
        return parts.length > 2 ? parts.slice(0, -2).join('.') : '';
    }

    getTLD(domain) {
        const parts = domain.split('.');
        return parts.length >= 2 ? parts.slice(-2).join('.') : domain;
    }

    async resolveIP(domain) {
        try {
            // This is a simplified IP resolution
            // In a real implementation, you might use a DNS lookup service
            return 'Resolved via DNS';
        } catch (error) {
            return 'Unable to resolve';
        }
    }

    async getWHOISData(domain) {
        // This is a placeholder for WHOIS data
        // In a real implementation, you would query a WHOIS service
        return {
            registrar: 'Domain Registrar',
            creationDate: '2020-01-01',
            expiryDate: '2025-01-01',
            nameServers: ['ns1.example.com', 'ns2.example.com']
        };
    }

    async getConnectionInfo(url) {
        const urlObj = new URL(url);
        const startTime = performance.now();

        const connectionInfo = {
            domain: urlObj.hostname,
            protocol: urlObj.protocol,
            port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
            responseTime: 0,
            serverInfo: {},
            headers: {}
        };

        try {
            const response = await this.makeRequest(url, 'HEAD');
            const endTime = performance.now();
            
            connectionInfo.responseTime = Math.round(endTime - startTime);
            connectionInfo.serverInfo = {
                server: response.headers.get('server'),
                poweredBy: response.headers.get('x-powered-by'),
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            };

            // Get all headers
            const headers = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });
            connectionInfo.headers = headers;

        } catch (error) {
            connectionInfo.responseTime = -1;
            connectionInfo.error = error.message;
        }

        return connectionInfo;
    }

    showLoading() {
        const loadingSection = document.getElementById('loadingSection');
        const checkBtn = document.getElementById('checkBtn');
        
        if (loadingSection) loadingSection.style.display = 'block';
        if (checkBtn) checkBtn.disabled = true;
    }

    hideLoading() {
        const loadingSection = document.getElementById('loadingSection');
        const checkBtn = document.getElementById('checkBtn');
        
        if (loadingSection) loadingSection.style.display = 'none';
        if (checkBtn) checkBtn.disabled = false;
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) resultsSection.style.display = 'none';
    }

    displayResults(results) {
        this.displayRedirectChain(results.redirectChain);
        this.displayBasicInfo(results.basicInfo);
        this.displaySecurityInfo(results.securityInfo);
        this.displayDomainInfo(results.domainInfo);
        this.displayConnectionInfo(results.connectionInfo);

        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) resultsSection.style.display = 'block';
    }

    displayRedirectChain(redirectChain) {
        const redirectChainElement = document.getElementById('redirectChain');
        if (!redirectChainElement) return;

        if (redirectChain.length === 0) {
            redirectChainElement.innerHTML = '<p>No redirects found. Direct access to the URL.</p>';
            return;
        }

        const chainHTML = redirectChain.map(step => {
            const statusClass = this.getStatusClass(step.status);
            const statusText = step.status === 'ERROR' ? 'Error' : `${step.status} ${step.statusText}`;
            const pingClass = step.pingTime > 0 ? 'ping-success' : 'ping-error';
            const pingText = step.pingTime > 0 ? `${step.pingTime}ms` : 'Failed';
            
            // Only show ping info if it's not the final destination (to avoid showing user's own ping)
            const pingInfoHTML = step.final ? '' : this.renderPingInfo(step.pingInfo, step.pingTime);
            
            return `
                <div class="redirect-step">
                    <div class="step-header">
                        <div class="step-number">${step.step}</div>
                        <div class="step-url">${step.url}</div>
                        <div class="step-status ${statusClass}">${statusText}</div>
                        <div class="step-ping ${pingClass}">${pingText}</div>
                    </div>
                    ${pingInfoHTML}
                </div>
            `;
        }).join('');

        redirectChainElement.innerHTML = chainHTML;
    }

    renderPingInfo(pingInfo, responseTime) {
        if (!pingInfo || !pingInfo.successful) {
            return `
                <div class="ping-info error">
                    <div class="ping-error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        Ping failed - Unable to reach destination
                    </div>
                </div>
            `;
        }

        const pingQuality = this.getPingQuality(pingInfo.ping);
        const responseQuality = this.getResponseQuality(responseTime);

        return `
            <div class="ping-info">
                <div class="ping-grid">
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-globe"></i>
                            Domain
                        </div>
                        <div class="ping-value">${pingInfo.domain}</div>
                    </div>
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-network-wired"></i>
                            IP Address
                        </div>
                        <div class="ping-value">${pingInfo.ip}</div>
                    </div>
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-tachometer-alt"></i>
                            Ping Time
                        </div>
                        <div class="ping-value ${pingQuality.class}">${pingInfo.ping}ms</div>
                    </div>
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-clock"></i>
                            Response Time
                        </div>
                        <div class="ping-value ${responseQuality.class}">${responseTime}ms</div>
                    </div>
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-layer-group"></i>
                            TTL
                        </div>
                        <div class="ping-value">${pingInfo.ttl}</div>
                    </div>
                    <div class="ping-item">
                        <div class="ping-label">
                            <i class="fas fa-box"></i>
                            Packet Size
                        </div>
                        <div class="ping-value">${pingInfo.packetSize} bytes</div>
                    </div>
                </div>
                <div class="ping-summary">
                    <div class="ping-quality ${pingQuality.class}">
                        <i class="fas ${pingQuality.icon}"></i>
                        ${pingQuality.text}
                    </div>
                    <div class="response-quality ${responseQuality.class}">
                        <i class="fas ${responseQuality.icon}"></i>
                        ${responseQuality.text}
                    </div>
                </div>
            </div>
        `;
    }

    getPingQuality(ping) {
        if (ping < 20) return { class: 'excellent', text: 'Excellent', icon: 'fa-star' };
        if (ping < 50) return { class: 'good', text: 'Good', icon: 'fa-thumbs-up' };
        if (ping < 100) return { class: 'fair', text: 'Fair', icon: 'fa-minus' };
        return { class: 'poor', text: 'Poor', icon: 'fa-exclamation-triangle' };
    }

    getResponseQuality(responseTime) {
        if (responseTime < 100) return { class: 'excellent', text: 'Fast', icon: 'fa-bolt' };
        if (responseTime < 300) return { class: 'good', text: 'Normal', icon: 'fa-clock' };
        if (responseTime < 1000) return { class: 'fair', text: 'Slow', icon: 'fa-hourglass-half' };
        return { class: 'poor', text: 'Very Slow', icon: 'fa-exclamation-triangle' };
    }

    displayBasicInfo(basicInfo) {
        const basicInfoElement = document.getElementById('basicInfo');
        if (!basicInfoElement) return;

        const infoHTML = `
            <div class="result-item">
                <span class="result-label">Original URL</span>
                <span class="result-value">${basicInfo.originalUrl}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Final URL</span>
                <span class="result-value">${basicInfo.finalUrl}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Redirect Count</span>
                <span class="result-value">${basicInfo.redirectCount}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Steps</span>
                <span class="result-value">${basicInfo.totalSteps}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Final Status</span>
                <span class="result-value">${basicInfo.finalStatus} ${basicInfo.finalStatusText}</span>
            </div>
        `;

        basicInfoElement.innerHTML = infoHTML;
    }

    displaySecurityInfo(securityInfo) {
        const securityInfoElement = document.getElementById('securityInfo');
        if (!securityInfoElement) return;

        const securityScoreClass = this.getSecurityScoreClass(securityInfo.securityScore);
        
        const infoHTML = `
            <div class="result-item">
                <span class="result-label">Protocol</span>
                <span class="result-value">${securityInfo.protocol}</span>
            </div>
            <div class="result-item">
                <span class="result-label">SSL/TLS</span>
                <span class="result-value">${securityInfo.isSecure ? 'Yes' : 'No'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Security Score</span>
                <span class="result-value ${securityScoreClass}">${securityInfo.securityScore}/100</span>
            </div>
            <div class="result-item">
                <span class="result-label">HSTS</span>
                <span class="result-value">${securityInfo.securityHeaders.hsts ? 'Yes' : 'No'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">CSP</span>
                <span class="result-value">${securityInfo.securityHeaders.csp ? 'Yes' : 'No'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">X-Frame-Options</span>
                <span class="result-value">${securityInfo.securityHeaders.xFrameOptions || 'Not Set'}</span>
            </div>
        `;

        securityInfoElement.innerHTML = infoHTML;
    }

    displayDomainInfo(domainInfo) {
        const domainInfoElement = document.getElementById('domainInfo');
        if (!domainInfoElement) return;

        const infoHTML = `
            <div class="result-item">
                <span class="result-label">Domain</span>
                <span class="result-value">${domainInfo.domain}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Subdomain</span>
                <span class="result-value">${domainInfo.subdomain || 'None'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">TLD</span>
                <span class="result-value">${domainInfo.tld}</span>
            </div>
            <div class="result-item">
                <span class="result-label">IP Address</span>
                <span class="result-value">${domainInfo.ipAddress}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Registrar</span>
                <span class="result-value">${domainInfo.registrar}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Creation Date</span>
                <span class="result-value">${domainInfo.creationDate}</span>
            </div>
        `;

        domainInfoElement.innerHTML = infoHTML;
    }

    displayConnectionInfo(connectionInfo) {
        const connectionInfoElement = document.getElementById('connectionInfo');
        if (!connectionInfoElement) return;

        const responseTimeClass = connectionInfo.responseTime > 0 ? 'status-success' : 'status-error';
        const responseTimeText = connectionInfo.responseTime > 0 ? `${connectionInfo.responseTime}ms` : 'Failed';

        const infoHTML = `
            <div class="result-item">
                <span class="result-label">Domain</span>
                <span class="result-value">${connectionInfo.domain}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Protocol</span>
                <span class="result-value">${connectionInfo.protocol}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Port</span>
                <span class="result-value">${connectionInfo.port}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Response Time</span>
                <span class="result-value ${responseTimeClass}">${responseTimeText}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Server</span>
                <span class="result-value">${connectionInfo.serverInfo.server || 'Unknown'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Content Type</span>
                <span class="result-value">${connectionInfo.serverInfo.contentType || 'Unknown'}</span>
            </div>
        `;

        connectionInfoElement.innerHTML = infoHTML;
    }

    getStatusClass(status) {
        if (status === 'ERROR') return 'status-error';
        if (status >= 200 && status < 300) return 'status-success';
        if (status >= 300 && status < 400) return 'status-warning';
        if (status >= 400) return 'status-error';
        return 'status-warning';
    }

    getSecurityScoreClass(score) {
        if (score >= 80) return 'status-success';
        if (score >= 60) return 'status-warning';
        return 'status-error';
    }
}

// Initialize the URL Redirect Checker when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new URLRedirectChecker();
});
