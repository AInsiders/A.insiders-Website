/**
 * Word & Character Counter JavaScript
 * Advanced text analysis tool with detailed statistics and writing insights
 */

class WordCharacterCounter {
    constructor() {
        this.sampleTexts = [
            {
                title: "Sample Article",
                text: `The rapid advancement of artificial intelligence has transformed the way we approach technology and innovation. Machine learning algorithms are now capable of processing vast amounts of data, identifying patterns, and making predictions with remarkable accuracy.

This technological revolution has implications across various industries, from healthcare to finance, education to entertainment. Companies are increasingly adopting AI-powered solutions to streamline operations, enhance customer experiences, and gain competitive advantages.

However, this progress also raises important questions about ethics, privacy, and the future of work. As AI systems become more sophisticated, we must carefully consider the balance between technological advancement and human well-being.

The key to successful AI implementation lies in responsible development practices, transparent algorithms, and ongoing collaboration between technologists, policymakers, and society at large.`
            },
            {
                title: "Sample Essay",
                text: `Climate change represents one of the most pressing challenges facing humanity in the 21st century. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, are driving unprecedented changes in our planet's climate system.

Rising global temperatures, melting polar ice caps, and increasingly severe weather events are just some of the observable consequences of climate change. These changes threaten ecosystems, human health, and economic stability worldwide.

Addressing climate change requires immediate and coordinated action at local, national, and international levels. This includes transitioning to renewable energy sources, improving energy efficiency, and implementing sustainable practices across all sectors of society.

The transition to a low-carbon economy presents both challenges and opportunities. While it requires significant investment and changes in behavior, it also offers the potential for job creation, technological innovation, and improved public health.`
            },
            {
                title: "Sample Story",
                text: `Sarah stood at the edge of the cliff, watching the waves crash against the rocks below. The salty breeze carried the sound of seagulls and the distant hum of a fishing boat returning to harbor.

She had come here every summer since childhood, but this year felt different. The familiar landscape seemed to hold new meaning, as if the passage of time had revealed hidden depths in the simple beauty of the coastline.

Memories flooded her mind: building sandcastles with her brother, learning to swim in the gentle waves, watching sunsets with her grandmother. Each memory was a thread in the tapestry of her life, woven together by the constant rhythm of the ocean.

As the sun began to set, painting the sky in brilliant oranges and purples, Sarah felt a sense of peace wash over her. She realized that change, like the tides, was inevitable and natural. The important thing was to embrace it with courage and grace.`
            }
        ];
        
        this.currentSampleIndex = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeTextArea();
    }

    setupEventListeners() {
        const textInput = document.getElementById('textInput');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const pasteBtn = document.getElementById('pasteBtn');
        const fileInput = document.getElementById('fileInput');
        const sampleBtn = document.getElementById('sampleBtn');

        if (textInput) {
            textInput.addEventListener('input', () => this.analyzeText());
            textInput.addEventListener('paste', () => this.analyzeText());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearText());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyText());
        }

        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => this.pasteText());
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleText());
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'a':
                        e.preventDefault();
                        this.selectAllText();
                        break;
                    case 'c':
                        if (e.target.id === 'textInput') {
                            // Let default copy behavior work
                        }
                        break;
                    case 'v':
                        if (e.target.id === 'textInput') {
                            // Let default paste behavior work
                        }
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undoText();
                        break;
                }
            }
        });
    }

    initializeTextArea() {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            // Set initial focus
            textInput.focus();
            
            // Auto-resize textarea
            textInput.addEventListener('input', () => {
                textInput.style.height = 'auto';
                textInput.style.height = Math.max(300, textInput.scrollHeight) + 'px';
            });
            
            // Initialize live counter with zero values after a short delay
            setTimeout(() => {
                this.updateLiveCounter({ characters: 0, charactersNoSpaces: 0, words: 0 });
            }, 100);
        }
    }

    analyzeText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value;
        
        // Always calculate stats, even for empty text
        const stats = this.calculateStats(text);
        
        // Always update the live counter
        this.updateLiveCounter(stats);
        
        if (!text.trim()) {
            this.hideResults();
            return;
        }

        this.displayResults(stats);
    }

    calculateStats(text) {
        const stats = {
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            words: this.countWords(text),
            sentences: this.countSentences(text),
            paragraphs: this.countParagraphs(text),
            lines: this.countLines(text),
            readingTime: this.calculateReadingTime(text),
            analysis: this.performDetailedAnalysis(text),
            insights: this.generateInsights(text)
        };

        return stats;
    }

    countWords(text) {
        // Remove extra whitespace and split by whitespace
        const words = text.trim().split(/\s+/);
        // Filter out empty strings
        return words.filter(word => word.length > 0).length;
    }

    countSentences(text) {
        // Split by sentence endings (., !, ?) followed by space or end of string
        const sentences = text.split(/[.!?]+(?=\s|$)/);
        // Filter out empty strings and count
        return sentences.filter(sentence => sentence.trim().length > 0).length;
    }

    countParagraphs(text) {
        // Split by double line breaks or single line breaks with empty lines
        const paragraphs = text.split(/\n\s*\n/);
        // Filter out empty paragraphs
        return paragraphs.filter(paragraph => paragraph.trim().length > 0).length;
    }

    countLines(text) {
        // Count non-empty lines
        const lines = text.split('\n');
        return lines.filter(line => line.trim().length > 0).length;
    }

    calculateReadingTime(text) {
        const wordsPerMinute = 200; // Average reading speed
        const words = this.countWords(text);
        const minutes = words / wordsPerMinute;
        
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else {
            const wholeMinutes = Math.floor(minutes);
            const remainingSeconds = Math.round((minutes - wholeMinutes) * 60);
            
            if (remainingSeconds === 0) {
                return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''}`;
            } else {
                return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
            }
        }
    }

    performDetailedAnalysis(text) {
        const analysis = {};
        
        // Average word length
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
        analysis.averageWordLength = words.length > 0 ? (totalWordLength / words.length).toFixed(1) : 0;
        
        // Average sentence length
        const sentences = this.countSentences(text);
        const wordCount = this.countWords(text);
        analysis.averageSentenceLength = sentences > 0 ? (wordCount / sentences).toFixed(1) : 0;
        
        // Average paragraph length
        const paragraphs = this.countParagraphs(text);
        analysis.averageParagraphLength = paragraphs > 0 ? (wordCount / paragraphs).toFixed(1) : 0;
        
        // Character density
        analysis.characterDensity = text.length > 0 ? ((this.countWords(text) / text.length) * 100).toFixed(1) : 0;
        
        // Space percentage
        const spaces = (text.match(/\s/g) || []).length;
        analysis.spacePercentage = text.length > 0 ? ((spaces / text.length) * 100).toFixed(1) : 0;
        
        // Unique words
        const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
        analysis.uniqueWords = uniqueWords.size;
        analysis.uniqueWordPercentage = words.length > 0 ? ((uniqueWords.size / words.length) * 100).toFixed(1) : 0;
        
        // Longest word
        analysis.longestWord = words.reduce((longest, word) => 
            word.length > longest.length ? word : longest, '');
        
        // Most common words (top 5)
        const wordFrequency = {};
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleanWord.length > 2) { // Skip very short words
                wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
            }
        });
        
        const sortedWords = Object.entries(wordFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));
        
        analysis.mostCommonWords = sortedWords;
        
        return analysis;
    }

    generateInsights(text) {
        const insights = [];
        const stats = this.calculateStats(text);
        const analysis = stats.analysis;
        
        // Word count insights
        if (stats.words < 50) {
            insights.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Short Text',
                message: 'Your text is quite short. Consider adding more content to provide comprehensive information.'
            });
        } else if (stats.words > 1000) {
            insights.push({
                icon: 'fas fa-check-circle',
                title: 'Comprehensive Content',
                message: 'Your text has substantial length, which is great for detailed content and SEO.'
            });
        }
        
        // Sentence length insights
        if (analysis.averageSentenceLength > 25) {
            insights.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Long Sentences',
                message: 'Your sentences are quite long. Consider breaking them down for better readability.'
            });
        } else if (analysis.averageSentenceLength < 10) {
            insights.push({
                icon: 'fas fa-info-circle',
                title: 'Short Sentences',
                message: 'Your sentences are concise, which is good for clarity but consider varying sentence length.'
            });
        }
        
        // Paragraph length insights
        if (analysis.averageParagraphLength > 100) {
            insights.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Long Paragraphs',
                message: 'Your paragraphs are quite long. Consider breaking them into smaller chunks for better readability.'
            });
        }
        
        // Vocabulary insights
        if (analysis.uniqueWordPercentage > 80) {
            insights.push({
                icon: 'fas fa-star',
                title: 'Rich Vocabulary',
                message: 'You\'re using a diverse vocabulary, which makes your writing more engaging and professional.'
            });
        } else if (analysis.uniqueWordPercentage < 50) {
            insights.push({
                icon: 'fas fa-lightbulb',
                title: 'Vocabulary Opportunity',
                message: 'Consider using more varied vocabulary to make your writing more engaging.'
            });
        }
        
        // Reading level insights
        const readingLevel = this.calculateReadingLevel(analysis.averageWordLength, analysis.averageSentenceLength);
        insights.push({
            icon: 'fas fa-graduation-cap',
            title: 'Reading Level',
            message: `Your text appears to be at a ${readingLevel} reading level.`
        });
        
        // Content type insights
        const contentType = this.detectContentType(text, stats);
        insights.push({
            icon: 'fas fa-file-alt',
            title: 'Content Type',
            message: `Your text appears to be ${contentType} content.`
        });
        
        return insights;
    }

    calculateReadingLevel(averageWordLength, averageSentenceLength) {
        // Flesch Reading Ease calculation (simplified)
        const fleschScore = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageWordLength);
        
        if (fleschScore >= 90) return 'very easy';
        if (fleschScore >= 80) return 'easy';
        if (fleschScore >= 70) return 'fairly easy';
        if (fleschScore >= 60) return 'standard';
        if (fleschScore >= 50) return 'fairly difficult';
        if (fleschScore >= 30) return 'difficult';
        return 'very difficult';
    }

    detectContentType(text, stats) {
        const lowerText = text.toLowerCase();
        
        // Check for academic indicators
        if (lowerText.includes('research') || lowerText.includes('study') || 
            lowerText.includes('analysis') || lowerText.includes('methodology')) {
            return 'academic';
        }
        
        // Check for story indicators
        if (lowerText.includes('said') || lowerText.includes('story') || 
            lowerText.includes('character') || lowerText.includes('plot')) {
            return 'narrative';
        }
        
        // Check for technical indicators
        if (lowerText.includes('technology') || lowerText.includes('software') || 
            lowerText.includes('system') || lowerText.includes('technical')) {
            return 'technical';
        }
        
        // Check for business indicators
        if (lowerText.includes('business') || lowerText.includes('company') || 
            lowerText.includes('market') || lowerText.includes('strategy')) {
            return 'business';
        }
        
        return 'general';
    }

    displayResults(stats) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';

        // Update main statistics
        document.getElementById('wordCount').textContent = stats.words;
        document.getElementById('charCount').textContent = stats.characters;
        document.getElementById('charNoSpaceCount').textContent = stats.charactersNoSpaces;
        document.getElementById('paragraphCount').textContent = stats.paragraphs;
        document.getElementById('sentenceCount').textContent = stats.sentences;
        document.getElementById('lineCount').textContent = stats.lines;

        // Update reading time
        document.getElementById('readingTimeText').textContent = 
            `Estimated reading time: ${stats.readingTime}`;

        // Display detailed analysis
        this.displayDetailedAnalysis(stats.analysis);

        // Display insights
        this.displayInsights(stats.insights);
    }

    displayDetailedAnalysis(analysis) {
        const analysisGrid = document.getElementById('analysisGrid');
        
        const analysisItems = [
            { label: 'Average Word Length', value: `${analysis.averageWordLength} characters` },
            { label: 'Average Sentence Length', value: `${analysis.averageSentenceLength} words` },
            { label: 'Average Paragraph Length', value: `${analysis.averageParagraphLength} words` },
            { label: 'Character Density', value: `${analysis.characterDensity}%` },
            { label: 'Space Percentage', value: `${analysis.spacePercentage}%` },
            { label: 'Unique Words', value: `${analysis.uniqueWords} (${analysis.uniqueWordPercentage}%)` },
            { label: 'Longest Word', value: analysis.longestWord || 'N/A' }
        ];

        let analysisHTML = '';
        analysisItems.forEach(item => {
            analysisHTML += `
                <div class="analysis-item">
                    <span class="analysis-label">${item.label}</span>
                    <span class="analysis-value">${item.value}</span>
                </div>
            `;
        });

        // Add most common words if available
        if (analysis.mostCommonWords && analysis.mostCommonWords.length > 0) {
            const commonWords = analysis.mostCommonWords
                .map(word => `${word.word} (${word.count})`)
                .join(', ');
            
            analysisHTML += `
                <div class="analysis-item">
                    <span class="analysis-label">Most Common Words</span>
                    <span class="analysis-value">${commonWords}</span>
                </div>
            `;
        }

        analysisGrid.innerHTML = analysisHTML;
    }

    displayInsights(insights) {
        const insightsContainer = document.getElementById('insightsContainer');
        
        let insightsHTML = '';
        insights.forEach(insight => {
            insightsHTML += `
                <div class="insight-item">
                    <div class="insight-icon">
                        <i class="${insight.icon}"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${insight.title}</h4>
                        <p>${insight.message}</p>
                    </div>
                </div>
            `;
        });

        insightsContainer.innerHTML = insightsHTML;
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
    }

    updateLiveCounter(stats) {
        // Update the live counter that's always visible
        const liveCharCount = document.getElementById('liveCharCount');
        const liveCharNoSpaceCount = document.getElementById('liveCharNoSpaceCount');
        const liveWordCount = document.getElementById('liveWordCount');
        
        // Debug: Check if elements exist
        console.log('Live counter elements found:', {
            liveCharCount: !!liveCharCount,
            liveCharNoSpaceCount: !!liveCharNoSpaceCount,
            liveWordCount: !!liveWordCount
        });
        
        // Ensure elements exist and update them
        if (liveCharCount) {
            liveCharCount.textContent = stats.characters || 0;
            console.log('Updated char count:', stats.characters || 0);
        }
        if (liveCharNoSpaceCount) {
            liveCharNoSpaceCount.textContent = stats.charactersNoSpaces || 0;
            console.log('Updated char no space count:', stats.charactersNoSpaces || 0);
        }
        if (liveWordCount) {
            liveWordCount.textContent = stats.words || 0;
            console.log('Updated word count:', stats.words || 0);
        }
    }

    clearText() {
        const textInput = document.getElementById('textInput');
        textInput.value = '';
        textInput.style.height = '300px';
        this.hideResults();
        this.updateLiveCounter({ characters: 0, charactersNoSpaces: 0, words: 0 });
        textInput.focus();
    }

    async copyText() {
        const textInput = document.getElementById('textInput');
        try {
            await navigator.clipboard.writeText(textInput.value);
            this.showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            textInput.select();
            document.execCommand('copy');
            this.showNotification('Text copied to clipboard!', 'success');
        }
    }

    async pasteText() {
        const textInput = document.getElementById('textInput');
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            this.analyzeText();
            this.showNotification('Text pasted successfully!', 'success');
        } catch (err) {
            this.showNotification('Unable to paste text. Please use Ctrl+V instead.', 'error');
        }
    }

    selectAllText() {
        const textInput = document.getElementById('textInput');
        textInput.select();
    }

    undoText() {
        const textInput = document.getElementById('textInput');
        document.execCommand('undo');
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const textInput = document.getElementById('textInput');
        
        try {
            let text = '';
            
            if (file.type === 'text/plain') {
                text = await this.readTextFile(file);
            } else {
                this.showNotification('Please upload a .txt file for best results.', 'warning');
                return;
            }
            
            textInput.value = text;
            this.analyzeText();
            this.showNotification('File uploaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error reading file:', error);
            this.showNotification('Error reading file. Please try again.', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    loadSampleText() {
        const textInput = document.getElementById('textInput');
        const sample = this.sampleTexts[this.currentSampleIndex];
        
        textInput.value = sample.text;
        this.analyzeText();
        
        this.currentSampleIndex = (this.currentSampleIndex + 1) % this.sampleTexts.length;
        this.showNotification(`Loaded: ${sample.title}`, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#00aa00',
            error: '#ff0000',
            warning: '#ffaa00',
            info: 'var(--accent-primary)'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Test function for live counter
function testLiveCounter() {
    console.log('Testing live counter...');
    if (window.wordCharacterCounter) {
        window.wordCharacterCounter.updateLiveCounter({
            characters: 123,
            charactersNoSpaces: 100,
            words: 25
        });
    } else {
        console.log('WordCharacterCounter not found');
    }
}

// Initialize the word character counter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing word counter...');
    window.wordCharacterCounter = new WordCharacterCounter();
    
    // Ensure live counter is initialized after DOM is ready
    setTimeout(() => {
        console.log('Initializing live counter...');
        if (window.wordCharacterCounter) {
            window.wordCharacterCounter.updateLiveCounter({ 
                characters: 0, 
                charactersNoSpaces: 0, 
                words: 0 
            });
        }
    }, 200);
    
    // Additional initialization after a longer delay to ensure everything is ready
    setTimeout(() => {
        console.log('Final live counter initialization...');
        if (window.wordCharacterCounter) {
            window.wordCharacterCounter.updateLiveCounter({ 
                characters: 0, 
                charactersNoSpaces: 0, 
                words: 0 
            });
        }
    }, 1000);
});
