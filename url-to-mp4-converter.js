// URL to MP4 Converter JavaScript
class VideoConverter {
    constructor() {
        this.selectedQuality = '1080p';
        this.currentVideoInfo = null;
        this.isConverting = false;
        
        this.initializeElements();
        this.bindEvents();
        this.setDefaultQuality();
    }

    initializeElements() {
        // Input elements
        this.videoUrlInput = document.getElementById('videoUrl');
        this.convertBtn = document.getElementById('convertBtn');
        
        // Quality selection
        this.qualityCards = document.querySelectorAll('.format-card');
        
        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.progressPercentage = document.getElementById('progressPercentage');
        
        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.videoInfo = document.getElementById('videoInfo');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.convertAnotherBtn = document.getElementById('convertAnotherBtn');
        
        // Error elements
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
    }

    bindEvents() {
        // Convert button
        this.convertBtn.addEventListener('click', () => this.startConversion());
        
        // Quality selection
        this.qualityCards.forEach(card => {
            card.addEventListener('click', () => this.selectQuality(card));
        });
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        
        // Convert another button
        this.convertAnotherBtn.addEventListener('click', () => this.resetConverter());
        
        // Retry button
        this.retryBtn.addEventListener('click', () => this.startConversion());
        
        // Enter key support
        this.videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startConversion();
            }
        });
    }

    setDefaultQuality() {
        // Set 1080p as default
        const defaultCard = document.querySelector('[data-quality="1080p"]');
        if (defaultCard) {
            this.selectQuality(defaultCard);
        }
    }

    selectQuality(card) {
        // Remove previous selection
        this.qualityCards.forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Update selected quality
        this.selectedQuality = card.dataset.quality;
        
        // Add visual feedback
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    }

    validateUrl(url) {
        if (!url) {
            throw new Error('Please enter a video URL');
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            throw new Error('Please enter a valid URL');
        }

        // Check if it's a supported platform
        const supportedPlatforms = [
            'youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com', 
            'instagram.com', 'facebook.com', 'twitter.com', 'linkedin.com'
        ];

        const urlLower = url.toLowerCase();
        const isSupported = supportedPlatforms.some(platform => urlLower.includes(platform));
        
        if (!isSupported && !urlLower.includes('http')) {
            throw new Error('Please enter a URL from a supported platform or a direct video URL');
        }

        return true;
    }

    async startConversion() {
        if (this.isConverting) return;

        const url = this.videoUrlInput.value.trim();
        
        try {
            // Validate URL
            this.validateUrl(url);
            
            // Start conversion process
            this.isConverting = true;
            this.hideAllSections();
            this.showProgress();
            this.updateProgress(0, 'Analyzing video source...');
            
            // Simulate video analysis
            await this.simulateProgress([
                { progress: 20, text: 'Analyzing video source...' },
                { progress: 40, text: 'Extracting video information...' },
                { progress: 60, text: 'Preparing conversion...' },
                { progress: 80, text: 'Converting to MP4...' },
                { progress: 95, text: 'Finalizing conversion...' },
                { progress: 100, text: 'Conversion complete!' }
            ]);

            // Get video info (simulated)
            const videoInfo = await this.getVideoInfo(url);
            this.currentVideoInfo = videoInfo;
            
            // Show results
            this.showResults(videoInfo);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.isConverting = false;
        }
    }

    async simulateProgress(steps) {
        for (const step of steps) {
            this.updateProgress(step.progress, step.text);
            await this.delay(800 + Math.random() * 400); // Random delay between 800-1200ms
        }
    }

    async getVideoInfo(url) {
        // Simulate API call to get video information
        await this.delay(1000);
        
        // Extract platform and generate mock info
        const platform = this.detectPlatform(url);
        const videoId = this.extractVideoId(url, platform);
        
        return {
            title: `Sample Video - ${platform.toUpperCase()}`,
            duration: this.generateRandomDuration(),
            quality: this.selectedQuality,
            size: this.estimateFileSize(this.selectedQuality),
            platform: platform,
            videoId: videoId,
            thumbnail: this.generateThumbnail(platform),
            downloadUrl: this.generateDownloadUrl(videoId, this.selectedQuality)
        };
    }

    detectPlatform(url) {
        const urlLower = url.toLowerCase();
        
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
        if (urlLower.includes('vimeo.com')) return 'vimeo';
        if (urlLower.includes('tiktok.com')) return 'tiktok';
        if (urlLower.includes('instagram.com')) return 'instagram';
        if (urlLower.includes('facebook.com')) return 'facebook';
        if (urlLower.includes('twitter.com')) return 'twitter';
        if (urlLower.includes('linkedin.com')) return 'linkedin';
        
        return 'direct';
    }

    extractVideoId(url, platform) {
        // Extract video ID based on platform
        const urlObj = new URL(url);
        
        switch (platform) {
            case 'youtube':
                return urlObj.searchParams.get('v') || urlObj.pathname.slice(1);
            case 'vimeo':
                return urlObj.pathname.split('/').pop();
            case 'tiktok':
                return urlObj.pathname.split('/').pop();
            case 'instagram':
                return urlObj.pathname.split('/').pop();
            default:
                return Math.random().toString(36).substring(7);
        }
    }

    generateRandomDuration() {
        const minutes = Math.floor(Math.random() * 10) + 1;
        const seconds = Math.floor(Math.random() * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    estimateFileSize(quality) {
        const sizes = {
            '720p': '50-100 MB',
            '1080p': '100-200 MB',
            '4k': '200-500 MB'
        };
        return sizes[quality] || 'Unknown';
    }

    generateThumbnail(platform) {
        const colors = {
            youtube: '#FF0000',
            vimeo: '#1AB7EA',
            tiktok: '#000000',
            instagram: '#E4405F',
            facebook: '#1877F2',
            twitter: '#1DA1F2',
            linkedin: '#0A66C2',
            direct: '#6B7280'
        };
        
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90"><rect width="120" height="90" fill="${colors[platform] || colors.direct}"/><text x="60" y="45" text-anchor="middle" fill="white" font-family="Arial" font-size="12">${platform.toUpperCase()}</text></svg>`;
    }

    generateDownloadUrl(videoId, quality) {
        // In a real implementation, this would be the actual download URL
        // For demo purposes, we'll create a blob URL
        return `#download-${videoId}-${quality}`;
    }

    showProgress() {
        this.progressSection.classList.remove('hidden');
    }

    updateProgress(percentage, text) {
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = text;
        this.progressPercentage.textContent = `${percentage}%`;
    }

    showResults(videoInfo) {
        this.hideAllSections();
        this.resultsSection.classList.remove('hidden');
        
        // Populate video info
        this.videoInfo.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-md">
                <div class="flex items-center space-x-4 mb-4">
                    <img src="${videoInfo.thumbnail}" alt="Video thumbnail" class="w-20 h-15 rounded-lg object-cover">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 text-lg">${videoInfo.title}</h4>
                        <p class="text-gray-600 text-sm">Duration: ${videoInfo.duration} | Quality: ${videoInfo.quality}</p>
                        <p class="text-gray-600 text-sm">Platform: ${videoInfo.platform.toUpperCase()} | Size: ${videoInfo.size}</p>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.hideAllSections();
        this.errorSection.classList.remove('hidden');
        this.errorMessage.textContent = message;
        
        // Add shake animation
        this.errorSection.classList.add('error-shake');
        setTimeout(() => {
            this.errorSection.classList.remove('error-shake');
        }, 500);
    }

    hideAllSections() {
        this.progressSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
    }

    async downloadVideo() {
        if (!this.currentVideoInfo) return;

        try {
            this.downloadBtn.disabled = true;
            this.downloadBtn.textContent = '📥 Downloading...';
            
            // Simulate download process
            await this.delay(2000);
            
            // Create a dummy file for download
            const content = `This is a simulated MP4 file for: ${this.currentVideoInfo.title}\nQuality: ${this.currentVideoInfo.quality}\nPlatform: ${this.currentVideoInfo.platform}`;
            const blob = new Blob([content], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentVideoInfo.title.replace(/[^a-z0-9]/gi, '_')}_${this.currentVideoInfo.quality}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success message
            this.showDownloadSuccess();
            
        } catch (error) {
            this.showError('Download failed. Please try again.');
        } finally {
            this.downloadBtn.disabled = false;
            this.downloadBtn.textContent = '📥 Download MP4';
        }
    }

    showDownloadSuccess() {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = '✅ Download started successfully!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    resetConverter() {
        this.videoUrlInput.value = '';
        this.currentVideoInfo = null;
        this.hideAllSections();
        this.videoUrlInput.focus();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoConverter();
});

// Add some utility functions for URL validation and platform detection
class URLUtils {
    static isValidYouTubeUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    static isValidVimeoUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
            /^https?:\/\/player\.vimeo\.com\/video\/\d+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    static isValidTikTokUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
            /^https?:\/\/vm\.tiktok\.com\/[\w]+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    static extractYouTubeVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
        return match ? match[1] : null;
    }

    static extractVimeoVideoId(url) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    static extractTikTokVideoId(url) {
        const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
        return match ? match[1] : null;
    }
}

// Add clipboard functionality
document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    
    // Add paste event listener
    videoUrlInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            const pastedText = videoUrlInput.value;
            if (pastedText && URLUtils.isValidYouTubeUrl(pastedText) || 
                URLUtils.isValidVimeoUrl(pastedText) || 
                URLUtils.isValidTikTokUrl(pastedText)) {
                
                // Add visual feedback for valid URL
                videoUrlInput.classList.add('border-green-500');
                setTimeout(() => {
                    videoUrlInput.classList.remove('border-green-500');
                }, 2000);
            }
        }, 100);
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('convertBtn').click();
    }
    
    // Escape to reset
    if (e.key === 'Escape') {
        const converter = new VideoConverter();
        converter.resetConverter();
    }
});

// Add mobile responsiveness improvements
document.addEventListener('DOMContentLoaded', () => {
    // Handle mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    }
    
    // Add touch feedback for mobile
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = '';
        });
    });
});
