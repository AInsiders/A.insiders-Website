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
            // Use debounced input for better performance
            let timeout;
            textInput.addEventListener('input', (e) => {
                // Clear previous timeout
                clearTimeout(timeout);
                
                // Auto-resize textarea
                textInput.style.height = 'auto';
                textInput.style.height = Math.max(300, textInput.scrollHeight) + 'px';
                
                // Debounce the analysis to avoid excessive calculations
                timeout = setTimeout(() => {
                    this.analyzeText();
                }, 150); // 150ms delay
            });
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
            
            // Initialize live counter with zero values after a short delay
            setTimeout(() => {
                this.updateLiveCounter({ 
                    characters: 0, 
                    charactersNoSpaces: 0, 
                    words: 0, 
                    sentences: 0, 
                    paragraphs: 0, 
                    letters: 0, 
                    numbers: 0, 
                    symbols: 0 
                });
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
        // Optimized stats calculation - only calculate what's needed for live counter
        const stats = {
            // Basic counts (always needed)
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            words: this.countWords(text),
            sentences: this.countSentences(text),
            paragraphs: this.countParagraphs(text),
            lines: this.countLines(text),
            
            // Character analysis (always needed)
            letters: this.countLetters(text),
            numbers: this.countNumbers(text),
            symbols: this.countSymbols(text),
            punctuation: this.countPunctuation(text),
            spaces: this.countSpaces(text),
            uppercase: this.countUppercase(text),
            lowercase: this.countLowercase(text),
            specialChars: this.countSpecialChars(text),
            whitespace: this.countWhitespace(text),
            
            // Text structure (always needed)
            wordsPerSentence: this.getWordsPerSentence(text),
            wordsPerParagraph: this.getWordsPerParagraph(text),
            sentencesPerParagraph: this.getSentencesPerParagraph(text),
            
            // Reading metrics (always needed)
            readingTime: this.calculateReadingTime(text),
            speakingTime: this.calculateSpeakingTime(text)
        };

        return stats;
    }

    countWords(text) {
        // Handle empty or whitespace-only text
        if (!text || !text.trim()) {
            return 0;
        }
        // Remove extra whitespace and split by whitespace
        const words = text.trim().split(/\s+/);
        // Filter out empty strings
        return words.filter(word => word.length > 0).length;
    }

    countSentences(text) {
        // Handle empty or whitespace-only text
        if (!text || !text.trim()) {
            return 0;
        }
        // Split by sentence endings (., !, ?) followed by space or end of string
        const sentences = text.split(/[.!?]+(?=\s|$)/);
        // Filter out empty strings and count
        return sentences.filter(sentence => sentence.trim().length > 0).length;
    }

    countParagraphs(text) {
        // Handle empty or whitespace-only text
        if (!text || !text.trim()) {
            return 0;
        }
        // Split by double line breaks or single line breaks with empty lines
        const paragraphs = text.split(/\n\s*\n/);
        // Filter out empty paragraphs
        return paragraphs.filter(paragraph => paragraph.trim().length > 0).length;
    }

    countLines(text) {
        // Handle empty or whitespace-only text
        if (!text || !text.trim()) {
            return 0;
        }
        // Count non-empty lines
        const lines = text.split('\n');
        return lines.filter(line => line.trim().length > 0).length;
    }

    // Advanced character counting methods
    countLetters(text) {
        return (text.match(/[a-zA-Z]/g) || []).length;
    }

    countNumbers(text) {
        return (text.match(/\d/g) || []).length;
    }

    countSymbols(text) {
        // Count symbols but exclude letters, numbers, spaces, and common punctuation
        return (text.match(/[^\w\s.,!?;:'"()-]/g) || []).length;
    }

    countPunctuation(text) {
        return (text.match(/[.,!?;:'"()[\]{}\-]/g) || []).length;
    }

    countSpaces(text) {
        return (text.match(/ /g) || []).length;
    }

    countUppercase(text) {
        return (text.match(/[A-Z]/g) || []).length;
    }

    countLowercase(text) {
        return (text.match(/[a-z]/g) || []).length;
    }

    countSpecialChars(text) {
        // Count all non-alphanumeric characters except spaces
        return (text.match(/[^\w\s]/g) || []).length;
    }

    countWhitespace(text) {
        // Count all types of whitespace (spaces, tabs, newlines, etc.)
        return (text.match(/\s/g) || []).length;
    }

    // Text structure analysis methods
    getWordsPerSentence(text) {
        const words = this.countWords(text);
        const sentences = this.countSentences(text);
        return sentences > 0 ? (words / sentences).toFixed(1) : 0;
    }

    getWordsPerParagraph(text) {
        const words = this.countWords(text);
        const paragraphs = this.countParagraphs(text);
        return paragraphs > 0 ? (words / paragraphs).toFixed(1) : 0;
    }

    getSentencesPerParagraph(text) {
        const sentences = this.countSentences(text);
        const paragraphs = this.countParagraphs(text);
        return paragraphs > 0 ? (sentences / paragraphs).toFixed(1) : 0;
    }

    calculateSpeakingTime(text) {
        const wordsPerMinute = 150; // Average speaking speed
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
        
        // Get basic stats for analysis
        const stats = {
            words: this.countWords(text),
            sentences: this.countSentences(text),
            paragraphs: this.countParagraphs(text),
            letters: this.countLetters(text),
            numbers: this.countNumbers(text),
            punctuation: this.countPunctuation(text),
            uppercase: this.countUppercase(text),
            lowercase: this.countLowercase(text),
            spaces: this.countSpaces(text),
            whitespace: this.countWhitespace(text)
        };
        
        // Word analysis
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
        analysis.averageWordLength = words.length > 0 ? (totalWordLength / words.length).toFixed(1) : 0;
        analysis.longestWord = words.reduce((longest, word) => 
            word.length > longest.length ? word : longest, '');
        analysis.shortestWord = words.reduce((shortest, word) => 
            word.length < shortest.length ? word : shortest, words[0] || '');
        
        // Sentence and paragraph analysis
        analysis.averageSentenceLength = stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0;
        analysis.averageParagraphLength = stats.paragraphs > 0 ? (stats.words / stats.paragraphs).toFixed(1) : 0;
        analysis.averageSentencesPerParagraph = stats.paragraphs > 0 ? (stats.sentences / stats.paragraphs).toFixed(1) : 0;
        
        // Character analysis percentages
        const totalChars = text.length;
        analysis.letterPercentage = totalChars > 0 ? ((stats.letters / totalChars) * 100).toFixed(1) : 0;
        analysis.numberPercentage = totalChars > 0 ? ((stats.numbers / totalChars) * 100).toFixed(1) : 0;
        analysis.punctuationPercentage = totalChars > 0 ? ((stats.punctuation / totalChars) * 100).toFixed(1) : 0;
        analysis.uppercasePercentage = stats.letters > 0 ? ((stats.uppercase / stats.letters) * 100).toFixed(1) : 0;
        analysis.lowercasePercentage = stats.letters > 0 ? ((stats.lowercase / stats.letters) * 100).toFixed(1) : 0;
        analysis.spacePercentage = totalChars > 0 ? ((stats.spaces / totalChars) * 100).toFixed(1) : 0;
        analysis.whitespacePercentage = totalChars > 0 ? ((stats.whitespace / totalChars) * 100).toFixed(1) : 0;
        
        // Text density and complexity
        analysis.characterDensity = totalChars > 0 ? ((stats.words / totalChars) * 100).toFixed(1) : 0;
        analysis.lexicalDiversity = this.calculateLexicalDiversity(words);
        
        // Unique words analysis
        const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
        analysis.uniqueWords = uniqueWords.size;
        analysis.uniqueWordPercentage = words.length > 0 ? ((uniqueWords.size / words.length) * 100).toFixed(1) : 0;
        
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
        
        // Readability scores
        analysis.fleschScore = this.calculateFleschScore(stats.words, stats.sentences, this.countSyllables(text));
        analysis.readabilityLevel = this.getReadabilityLevel(analysis.fleschScore);
        
        return analysis;
    }

    calculateLexicalDiversity(words) {
        if (words.length === 0) return 0;
        const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
        return ((uniqueWords.size / words.length) * 100).toFixed(1);
    }

    countSyllables(text) {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        let totalSyllables = 0;
        
        words.forEach(word => {
            let syllables = word.match(/[aeiouy]+/g);
            if (syllables) {
                totalSyllables += syllables.length;
                // Adjust for silent 'e'
                if (word.endsWith('e') && syllables.length > 1) {
                    totalSyllables--;
                }
            } else {
                totalSyllables++; // Every word has at least one syllable
            }
        });
        
        return totalSyllables;
    }

    calculateFleschScore(words, sentences, syllables) {
        if (words === 0 || sentences === 0) return 0;
        return (206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))).toFixed(1);
    }

    getReadabilityLevel(fleschScore) {
        if (fleschScore >= 90) return 'Very Easy';
        if (fleschScore >= 80) return 'Easy';
        if (fleschScore >= 70) return 'Fairly Easy';
        if (fleschScore >= 60) return 'Standard';
        if (fleschScore >= 50) return 'Fairly Difficult';
        if (fleschScore >= 30) return 'Difficult';
        return 'Very Difficult';
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

        // Update additional statistics if elements exist
        const lettersElement = document.getElementById('letterCount');
        if (lettersElement) lettersElement.textContent = stats.letters;
        
        const numbersElement = document.getElementById('numberCount');
        if (numbersElement) numbersElement.textContent = stats.numbers;
        
        const symbolsElement = document.getElementById('symbolCount');
        if (symbolsElement) symbolsElement.textContent = stats.symbols;
        
        const punctuationElement = document.getElementById('punctuationCount');
        if (punctuationElement) punctuationElement.textContent = stats.punctuation;
        
        const spacesElement = document.getElementById('spacesCount');
        if (spacesElement) spacesElement.textContent = stats.spaces;
        
        const uppercaseElement = document.getElementById('uppercaseCount');
        if (uppercaseElement) uppercaseElement.textContent = stats.uppercase;
        
        const lowercaseElement = document.getElementById('lowercaseCount');
        if (lowercaseElement) lowercaseElement.textContent = stats.lowercase;

        // Update reading and speaking time
        document.getElementById('readingTimeText').textContent = 
            `Reading time: ${stats.readingTime} | Speaking time: ${stats.speakingTime}`;

        // Calculate and display detailed analysis
        const textInput = document.getElementById('textInput');
        const analysis = this.performDetailedAnalysis(textInput.value);
        this.displayDetailedAnalysis(analysis);

        // Calculate and display insights
        const insights = this.generateInsights(textInput.value);
        this.displayInsights(insights);
    }

    displayDetailedAnalysis(analysis) {
        const analysisGrid = document.getElementById('analysisGrid');
        
        const analysisItems = [
            // Text structure analysis
            { label: 'Average Word Length', value: `${analysis.averageWordLength} characters` },
            { label: 'Average Sentence Length', value: `${analysis.averageSentenceLength} words` },
            { label: 'Average Paragraph Length', value: `${analysis.averageParagraphLength} words` },
            { label: 'Sentences per Paragraph', value: `${analysis.averageSentencesPerParagraph}` },
            
            // Character composition
            { label: 'Letters', value: `${analysis.letterPercentage}%` },
            { label: 'Numbers', value: `${analysis.numberPercentage}%` },
            { label: 'Punctuation', value: `${analysis.punctuationPercentage}%` },
            { label: 'Spaces', value: `${analysis.spacePercentage}%` },
            { label: 'Whitespace', value: `${analysis.whitespacePercentage}%` },
            
            // Case analysis
            { label: 'Uppercase Letters', value: `${analysis.uppercasePercentage}%` },
            { label: 'Lowercase Letters', value: `${analysis.lowercasePercentage}%` },
            
            // Text complexity
            { label: 'Character Density', value: `${analysis.characterDensity}%` },
            { label: 'Lexical Diversity', value: `${analysis.lexicalDiversity}%` },
            { label: 'Unique Words', value: `${analysis.uniqueWords} (${analysis.uniqueWordPercentage}%)` },
            
            // Word analysis
            { label: 'Longest Word', value: analysis.longestWord || 'N/A' },
            { label: 'Shortest Word', value: analysis.shortestWord || 'N/A' },
            
            // Readability
            { label: 'Flesch Reading Score', value: `${analysis.fleschScore}` },
            { label: 'Reading Level', value: analysis.readabilityLevel }
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
        // Optimized live counter update with animations
        const updates = [
            ['liveCharCount', stats.characters || 0],
            ['liveCharNoSpaceCount', stats.charactersNoSpaces || 0],
            ['liveWordCount', stats.words || 0],
            ['liveSentenceCount', stats.sentences || 0],
            ['liveParagraphCount', stats.paragraphs || 0],
            ['liveLetterCount', stats.letters || 0],
            ['liveNumberCount', stats.numbers || 0],
            ['liveSymbolCount', stats.symbols || 0]
        ];
        
        // Batch update all elements with animation
        updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                const oldValue = parseInt(element.textContent) || 0;
                const newValue = value;
                
                // Only animate if value changed
                if (oldValue !== newValue) {
                    // Add animation class
                    element.classList.add('counter-update');
                    
                    // Update the value
                    element.textContent = newValue;
                    
                    // Remove animation class after animation completes
                    setTimeout(() => {
                        element.classList.remove('counter-update');
                    }, 300);
                }
            }
        });
    }

    clearText() {
        const textInput = document.getElementById('textInput');
        textInput.value = '';
        textInput.style.height = '300px';
        this.hideResults();
        this.updateLiveCounter({ 
            characters: 0, 
            charactersNoSpaces: 0, 
            words: 0, 
            sentences: 0, 
            paragraphs: 0, 
            letters: 0, 
            numbers: 0, 
            symbols: 0 
        });
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

// Manual analyze function for testing
function manualAnalyze() {
    if (window.wordCharacterCounter) {
        window.wordCharacterCounter.analyzeText();
    }
}

// Initialize the word character counter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.wordCharacterCounter = new WordCharacterCounter();
    
    // Initialize counters to zero
    setTimeout(() => {
        if (window.wordCharacterCounter) {
            window.wordCharacterCounter.updateLiveCounter({ 
                characters: 0, 
                charactersNoSpaces: 0, 
                words: 0, 
                sentences: 0, 
                paragraphs: 0, 
                letters: 0, 
                numbers: 0, 
                symbols: 0 
            });
        }
    }, 100);
});
