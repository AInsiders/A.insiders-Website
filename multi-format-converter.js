/**
 * Multi-Format File Converter
 * Handles dynamic format selection, interface updates, and file conversions
 */

class MultiFormatConverter {
    constructor() {
        this.files = [];
        this.inputFormat = '';
        this.outputFormat = '';
        this.conversionOptions = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.initializeFormatMappings();
    }

    // Format compatibility mappings
    initializeFormatMappings() {
        this.formatMappings = {
            // Image formats
            webp: {
                category: 'image',
                mimeType: 'image/webp',
                extensions: ['.webp'],
                maxSize: 50 * 1024 * 1024, // 50MB
                outputFormats: ['png', 'jpg', 'gif', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            png: {
                category: 'image',
                mimeType: 'image/png',
                extensions: ['.png'],
                maxSize: 50 * 1024 * 1024,
                outputFormats: ['webp', 'jpg', 'gif', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    compression: { type: 'range', min: 0, max: 9, step: 1, default: 6, label: 'Compression Level' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            jpg: {
                category: 'image',
                mimeType: 'image/jpeg',
                extensions: ['.jpg', '.jpeg'],
                maxSize: 50 * 1024 * 1024,
                outputFormats: ['webp', 'png', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            gif: {
                category: 'image',
                mimeType: 'image/gif',
                extensions: ['.gif'],
                maxSize: 50 * 1024 * 1024,
                outputFormats: ['webp', 'png', 'jpg', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            bmp: {
                category: 'image',
                mimeType: 'image/bmp',
                extensions: ['.bmp'],
                maxSize: 50 * 1024 * 1024,
                outputFormats: ['png', 'jpg', 'webp', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            svg: {
                category: 'image',
                mimeType: 'image/svg+xml',
                extensions: ['.svg'],
                maxSize: 10 * 1024 * 1024, // 10MB for SVG
                outputFormats: ['png', 'jpg', 'pdf', 'webp', 'gif'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    width: { type: 'number', min: 1, max: 4000, default: 800, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 600, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            tiff: {
                category: 'image',
                mimeType: 'image/tiff',
                extensions: ['.tiff', '.tif'],
                maxSize: 100 * 1024 * 1024,
                outputFormats: ['png', 'jpg', 'webp', 'gif', 'pdf'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    compression: { type: 'select', options: ['none', 'lzw', 'jpeg', 'deflate'], default: 'lzw', label: 'Compression' },
                    resize: { type: 'checkbox', default: false, label: 'Resize Image' },
                    width: { type: 'number', min: 1, max: 4000, default: 1920, label: 'Width (px)' },
                    height: { type: 'number', min: 1, max: 4000, default: 1080, label: 'Height (px)' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' },
                    marginSize: { type: 'select', options: ['none', 'small', 'medium', 'large'], default: 'medium', label: 'Margin Size' },
                    imageFit: { type: 'select', options: ['fit', 'stretch', 'original'], default: 'fit', label: 'Image Fit' }
                }
            },
            ico: {
                category: 'image',
                mimeType: 'image/x-icon',
                extensions: ['.ico'],
                maxSize: 10 * 1024 * 1024,
                outputFormats: ['png', 'jpg', 'webp', 'gif'],
                options: {
                    quality: { type: 'range', min: 0.1, max: 1, step: 0.1, default: 0.8, label: 'Quality' },
                    sizes: { type: 'select', options: ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256'], default: '32x32', label: 'Icon Size' }
                }
            },
            // Document formats
            pdf: {
                category: 'document',
                mimeType: 'application/pdf',
                extensions: ['.pdf'],
                maxSize: 100 * 1024 * 1024, // 100MB
                outputFormats: ['png', 'jpg', 'txt'],
                options: {
                    page: { type: 'number', min: 1, default: 1, label: 'Page Number' },
                    dpi: { type: 'range', min: 72, max: 300, step: 72, default: 150, label: 'DPI' },
                    format: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Format' },
                    extractText: { type: 'checkbox', default: false, label: 'Extract Text Only' }
                }
            },
            txt: {
                category: 'document',
                mimeType: 'text/plain',
                extensions: ['.txt'],
                maxSize: 10 * 1024 * 1024, // 10MB
                outputFormats: ['pdf'],
                options: {
                    fontSize: { type: 'range', min: 8, max: 72, step: 1, default: 12, label: 'Font Size' },
                    fontFamily: { type: 'select', options: ['Arial', 'Times New Roman', 'Courier New'], default: 'Arial', label: 'Font Family' },
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' }
                }
            },
            doc: {
                category: 'document',
                mimeType: 'application/msword',
                extensions: ['.doc'],
                maxSize: 50 * 1024 * 1024, // 50MB
                outputFormats: ['pdf', 'txt'],
                options: {
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' }
                }
            },
            docx: {
                category: 'document',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                extensions: ['.docx'],
                maxSize: 50 * 1024 * 1024, // 50MB
                outputFormats: ['pdf', 'txt', 'rtf'],
                options: {
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' }
                }
            },
            rtf: {
                category: 'document',
                mimeType: 'application/rtf',
                extensions: ['.rtf'],
                maxSize: 20 * 1024 * 1024, // 20MB
                outputFormats: ['pdf', 'txt', 'docx'],
                options: {
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' }
                }
            },
            odt: {
                category: 'document',
                mimeType: 'application/vnd.oasis.opendocument.text',
                extensions: ['.odt'],
                maxSize: 50 * 1024 * 1024, // 50MB
                outputFormats: ['pdf', 'txt', 'docx', 'rtf'],
                options: {
                    pageSize: { type: 'select', options: ['a4', 'letter', 'legal'], default: 'a4', label: 'Page Size' },
                    orientation: { type: 'select', options: ['portrait', 'landscape'], default: 'portrait', label: 'Orientation' }
                }
            },
            // Audio formats
            mp3: {
                category: 'audio',
                mimeType: 'audio/mpeg',
                extensions: ['.mp3'],
                maxSize: 100 * 1024 * 1024, // 100MB
                outputFormats: ['wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' }
                }
            },
            wav: {
                category: 'audio',
                mimeType: 'audio/wav',
                extensions: ['.wav'],
                maxSize: 200 * 1024 * 1024, // 200MB
                outputFormats: ['mp3', 'ogg', 'aac', 'm4a', 'flac', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' },
                    quality: { type: 'select', options: ['low', 'medium', 'high', 'lossless'], default: 'high', label: 'Quality' }
                }
            },
            ogg: {
                category: 'audio',
                mimeType: 'audio/ogg',
                extensions: ['.ogg'],
                maxSize: 100 * 1024 * 1024,
                outputFormats: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' }
                }
            },
            aac: {
                category: 'audio',
                mimeType: 'audio/aac',
                extensions: ['.aac'],
                maxSize: 100 * 1024 * 1024,
                outputFormats: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' }
                }
            },
            m4a: {
                category: 'audio',
                mimeType: 'audio/mp4',
                extensions: ['.m4a'],
                maxSize: 100 * 1024 * 1024,
                outputFormats: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' }
                }
            },
            flac: {
                category: 'audio',
                mimeType: 'audio/flac',
                extensions: ['.flac'],
                maxSize: 200 * 1024 * 1024,
                outputFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'wma'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' },
                    compression: { type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], default: '5', label: 'Compression Level' }
                }
            },
            wma: {
                category: 'audio',
                mimeType: 'audio/x-ms-wma',
                extensions: ['.wma'],
                maxSize: 100 * 1024 * 1024,
                outputFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['64k', '128k', '192k', '256k', '320k'], default: '192k', label: 'Bitrate' },
                    sampleRate: { type: 'select', options: ['22050', '44100', '48000', '96000'], default: '44100', label: 'Sample Rate' },
                    channels: { type: 'select', options: ['mono', 'stereo'], default: 'stereo', label: 'Channels' }
                }
            },
            // Video formats
            mp4: {
                category: 'video',
                mimeType: 'video/mp4',
                extensions: ['.mp4'],
                maxSize: 500 * 1024 * 1024, // 500MB
                outputFormats: ['webm', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            },
            webm: {
                category: 'video',
                mimeType: 'video/webm',
                extensions: ['.webm'],
                maxSize: 500 * 1024 * 1024,
                outputFormats: ['mp4', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            },
            avi: {
                category: 'video',
                mimeType: 'video/x-msvideo',
                extensions: ['.avi'],
                maxSize: 500 * 1024 * 1024,
                outputFormats: ['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            },
            mov: {
                category: 'video',
                mimeType: 'video/quicktime',
                extensions: ['.mov'],
                maxSize: 500 * 1024 * 1024,
                outputFormats: ['mp4', 'webm', 'avi', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            },
            mkv: {
                category: 'video',
                mimeType: 'video/x-matroska',
                extensions: ['.mkv'],
                maxSize: 500 * 1024 * 1024,
                outputFormats: ['mp4', 'webm', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            },
            flv: {
                category: 'video',
                mimeType: 'video/x-flv',
                extensions: ['.flv'],
                maxSize: 500 * 1024 * 1024,
                outputFormats: ['mp4', 'webm', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
                options: {
                    bitrate: { type: 'select', options: ['1000k', '2000k', '4000k', '8000k'], default: '2000k', label: 'Video Bitrate' },
                    audioBitrate: { type: 'select', options: ['128k', '192k', '256k', '320k'], default: '192k', label: 'Audio Bitrate' },
                    resolution: { type: 'select', options: ['480p', '720p', '1080p', '1440p', '4K'], default: '720p', label: 'Resolution' },
                    extractAudio: { type: 'checkbox', default: false, label: 'Extract Audio Only' },
                    audioFormat: { type: 'select', options: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'], default: 'mp3', label: 'Audio Format' }
                }
            }
        };
    }

    setupEventListeners() {
        const inputFormatSelect = document.getElementById('inputFormat');
        const outputFormatSelect = document.getElementById('outputFormat');
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');

        inputFormatSelect.addEventListener('change', (e) => this.handleInputFormatChange(e));
        outputFormatSelect.addEventListener('change', (e) => this.handleOutputFormatChange(e));
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        convertBtn.addEventListener('click', () => this.convertFiles());
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileDrop(e.dataTransfer.files);
        });
    }

    handleInputFormatChange(event) {
        const inputFormat = event.target.value;
        const outputFormatSelect = document.getElementById('outputFormat');
        const uploadSection = document.getElementById('uploadSection');
        const uploadHint = document.getElementById('uploadHint');

        if (inputFormat) {
            this.inputFormat = inputFormat;
            const formatInfo = this.formatMappings[inputFormat];
            
            // Update upload hint
            uploadHint.textContent = `Supports ${formatInfo.extensions.join(', ')} files, max ${this.formatFileSize(formatInfo.maxSize)}`;
            
            // Update file input accept attribute
            document.getElementById('fileInput').accept = formatInfo.extensions.join(',') + ',' + formatInfo.mimeType;
            
            // Populate output format options
            this.populateOutputFormats(inputFormat);
            
            // Show upload section
            uploadSection.style.display = 'block';
            
            this.showStatus(`Selected input format: ${inputFormat.toUpperCase()}`, 'info');
        } else {
            outputFormatSelect.innerHTML = '<option value="">Select output format...</option>';
            outputFormatSelect.disabled = true;
            uploadSection.style.display = 'none';
        }
    }

    handleOutputFormatChange(event) {
        const outputFormat = event.target.value;
        if (outputFormat) {
            this.outputFormat = outputFormat;
            this.updateConversionOptions();
            this.showStatus(`Selected output format: ${outputFormat.toUpperCase()}`, 'info');
        }
    }

    populateOutputFormats(inputFormat) {
        const outputFormatSelect = document.getElementById('outputFormat');
        const formatInfo = this.formatMappings[inputFormat];
        
        outputFormatSelect.innerHTML = '<option value="">Select output format...</option>';
        
        formatInfo.outputFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            outputFormatSelect.appendChild(option);
        });
        
        outputFormatSelect.disabled = false;
    }

    updateConversionOptions() {
        const optionsSection = document.getElementById('optionsSection');
        const optionsGrid = document.getElementById('optionsGrid');
        
        if (!this.inputFormat || !this.outputFormat) {
            optionsSection.style.display = 'none';
            return;
        }

        const inputFormatInfo = this.formatMappings[this.inputFormat];
        const outputFormatInfo = this.formatMappings[this.outputFormat];
        
        // Combine options from both formats
        const allOptions = { ...inputFormatInfo.options, ...outputFormatInfo.options };
        
        optionsGrid.innerHTML = '';
        
        Object.entries(allOptions).forEach(([key, option]) => {
            const optionGroup = document.createElement('div');
            optionGroup.className = 'option-group';
            
            const label = document.createElement('label');
            label.textContent = option.label;
            label.setAttribute('for', key);
            
            let input;
            
            switch (option.type) {
                case 'range':
                    input = document.createElement('input');
                    input.type = 'range';
                    input.min = option.min;
                    input.max = option.max;
                    input.step = option.step;
                    input.value = option.default;
                    input.id = key;
                    
                    // Add value display for quality slider
                    if (key === 'quality') {
                        const valueDisplay = document.createElement('div');
                        valueDisplay.className = 'value-display';
                        valueDisplay.id = 'quality-value';
                        valueDisplay.textContent = `${Math.round(option.default * 100)}%`;
                        optionGroup.appendChild(valueDisplay);
                        
                        // Add event listener for real-time updates
                        input.addEventListener('input', async (e) => {
                            const value = e.target.value;
                            valueDisplay.textContent = `${Math.round(value * 100)}%`;
                            await this.updateFileSizeEstimate();
                        });
                    }
                    break;
                    
                case 'number':
                    input = document.createElement('input');
                    input.type = 'number';
                    input.min = option.min;
                    input.max = option.max;
                    input.value = option.default;
                    input.id = key;
                    
                    // Add event listener for width/height changes
                    if (key === 'width' || key === 'height') {
                        input.addEventListener('input', async () => {
                            await this.updateFileSizeEstimate();
                        });
                    }
                    break;
                    
                case 'checkbox':
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = option.default;
                    input.id = key;
                    
                    // Add event listener for resize checkbox
                    if (key === 'resize') {
                        input.addEventListener('change', async () => {
                            await this.updateFileSizeEstimate();
                            this.toggleResizeOptions();
                        });
                    }
                    break;
                    
                case 'select':
                    input = document.createElement('select');
                    input.id = key;
                    option.options.forEach(opt => {
                        const optionElement = document.createElement('option');
                        optionElement.value = opt;
                        optionElement.textContent = opt;
                        if (opt === option.default) {
                            optionElement.selected = true;
                        }
                        input.appendChild(optionElement);
                    });
                    break;
            }
            
            optionGroup.appendChild(label);
            optionGroup.appendChild(input);
            optionsGrid.appendChild(optionGroup);
        });
        
        // Add quality presets for image formats
        if (inputFormatInfo.category === 'image' && outputFormatInfo.category === 'image') {
            this.addQualityPresets();
        }
        
        // Add file size estimate display
        this.addFileSizeEstimate();
        
        optionsSection.style.display = 'block';
        
        // Initialize resize options visibility
        this.toggleResizeOptions();
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleFileDrop(files) {
        const fileArray = Array.from(files);
        this.processFiles(fileArray);
    }

    processFiles(files) {
        const formatInfo = this.formatMappings[this.inputFormat];
        const validFiles = files.filter(file => {
            // Check file extension
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const isValidExtension = formatInfo.extensions.includes(fileExtension);
            
            // Check file size
            const isValidSize = file.size <= formatInfo.maxSize;
            
            // Check MIME type
            const isValidMimeType = file.type === formatInfo.mimeType;
            
            return isValidExtension && isValidSize && isValidMimeType;
        });

        if (validFiles.length === 0) {
            this.showStatus('No valid files selected. Please check file format and size.', 'error');
            return;
        }

        this.files = validFiles;
        this.updateFileInfo();
        this.showPreview();
        this.enableConvertButton();
        this.showStatus(`Loaded ${validFiles.length} valid file(s) successfully.`, 'success');
    }

    updateFileInfo() {
        const fileInfo = document.getElementById('fileInfo');
        const fileList = document.getElementById('fileList');
        
        fileList.innerHTML = '';
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.innerHTML = `
                <p><strong>${index + 1}.</strong> ${file.name} (${this.formatFileSize(file.size)})</p>
            `;
            fileList.appendChild(fileItem);
        });
        
        fileInfo.style.display = 'block';
    }

    showPreview() {
        const previewSection = document.getElementById('previewSection');
        const previewGrid = document.getElementById('previewGrid');
        
        previewGrid.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            if (this.formatMappings[this.inputFormat].category === 'image') {
                this.createImagePreview(file, index, previewItem);
            } else {
                this.createFilePreview(file, index, previewItem);
            }
            
            previewGrid.appendChild(previewItem);
        });
        
        previewSection.style.display = 'block';
    }

    createImagePreview(file, index, previewItem) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const canvas = document.createElement('canvas');
            canvas.className = 'preview-canvas';
            canvas.id = `preview-${index}`;
            
            const img = new Image();
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                const maxSize = 200;
                
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = e.target.result;
            
            previewItem.innerHTML = `
                <h3>Image ${index + 1}</h3>
            `;
            previewItem.appendChild(canvas);
        };
        reader.readAsDataURL(file);
    }

    createFilePreview(file, index, previewItem) {
        const icon = this.getFileIcon(this.inputFormat);
        previewItem.innerHTML = `
            <h3>File ${index + 1}</h3>
            <div style="font-size: 3rem; color: #667eea; margin: 1rem 0;">
                <i class="${icon}"></i>
            </div>
            <p style="color: #666;">${file.name}</p>
            <p style="color: #999; font-size: 0.9rem;">${this.formatFileSize(file.size)}</p>
        `;
    }

    getFileIcon(format) {
        const iconMap = {
            pdf: 'fas fa-file-pdf',
            txt: 'fas fa-file-alt',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            mp3: 'fas fa-file-audio',
            wav: 'fas fa-file-audio',
            ogg: 'fas fa-file-audio',
            aac: 'fas fa-file-audio',
            mp4: 'fas fa-file-video',
            webm: 'fas fa-file-video',
            avi: 'fas fa-file-video',
            mov: 'fas fa-file-video'
        };
        return iconMap[format] || 'fas fa-file';
    }

    enableConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = false;
    }

    async convertFiles() {
        if (this.files.length === 0 || !this.inputFormat || !this.outputFormat) {
            this.showStatus('Please select files and formats first.', 'error');
            return;
        }

        const convertBtn = document.getElementById('convertBtn');
        const btnText = convertBtn.querySelector('span');
        const btnIcon = convertBtn.querySelector('i');

        convertBtn.disabled = true;
        btnText.textContent = 'Converting...';
        btnIcon.style.display = 'inline-block';

        this.showProgressBar();

        try {
            const options = this.getConversionOptions();
            const results = await this.performConversions(options);
            
            this.showDownloadSection(results);
            this.showStatus('File conversion completed successfully!', 'success');
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showStatus(`Conversion failed: ${error.message}`, 'error');
        } finally {
            convertBtn.disabled = false;
            btnText.textContent = 'Convert Files';
            btnIcon.style.display = 'none';
            this.hideProgressBar();
        }
    }

    getConversionOptions() {
        const options = {};
        const optionsSection = document.getElementById('optionsSection');
        const inputs = optionsSection.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                options[input.id] = input.checked;
            } else {
                options[input.id] = input.value;
            }
        });
        
        return options;
    }

    async performConversions(options) {
        const results = [];
        
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            this.updateProgress((i / this.files.length) * 100);
            
            try {
                const result = await this.convertFile(file, options);
                results.push(result);
            } catch (error) {
                console.error(`Error converting ${file.name}:`, error);
                results.push({ error: error.message, fileName: file.name });
            }
        }
        
        this.updateProgress(100);
        return results;
    }

    async convertFile(file, options) {
        const inputFormat = this.inputFormat;
        const outputFormat = this.outputFormat;
        
        // Handle different conversion types
        if (this.formatMappings[inputFormat].category === 'image' && 
            this.formatMappings[outputFormat].category === 'image') {
            return await this.convertImage(file, inputFormat, outputFormat, options);
        } else if (this.formatMappings[inputFormat].category === 'image' && 
                   outputFormat === 'pdf') {
            return await this.convertImageToPdf(file, inputFormat, options);
        } else if (inputFormat === 'pdf' && (outputFormat === 'png' || outputFormat === 'jpg')) {
            return await this.convertPdfToImage(file, outputFormat, options);
        } else if (inputFormat === 'txt' && outputFormat === 'pdf') {
            return await this.convertTextToPdf(file, options);
        } else if ((inputFormat === 'doc' || inputFormat === 'docx') && outputFormat === 'pdf') {
            return await this.convertDocumentToPdf(file, inputFormat, options);
        } else if ((inputFormat === 'doc' || inputFormat === 'docx' || inputFormat === 'rtf' || inputFormat === 'odt') && outputFormat === 'pdf') {
            return await this.convertDocumentToPdf(file, inputFormat, options);
        } else if ((inputFormat === 'doc' || inputFormat === 'docx' || inputFormat === 'rtf' || inputFormat === 'odt') && outputFormat === 'txt') {
            return await this.convertDocumentToText(file, inputFormat, options);
        } else if ((inputFormat === 'rtf' || inputFormat === 'odt') && outputFormat === 'docx') {
            return await this.convertDocumentToDocx(file, inputFormat, options);
        } else if (this.formatMappings[inputFormat].category === 'audio') {
            return await this.convertAudio(file, inputFormat, outputFormat, options);
        } else if (this.formatMappings[inputFormat].category === 'video' && 
                   this.formatMappings[outputFormat].category === 'audio') {
            return await this.extractAudioFromVideo(file, inputFormat, outputFormat, options);
        } else if (this.formatMappings[inputFormat].category === 'video') {
            return await this.convertVideo(file, inputFormat, outputFormat, options);
        } else {
            throw new Error(`Conversion from ${inputFormat} to ${outputFormat} is not yet supported.`);
        }
    }

    async convertImage(file, inputFormat, outputFormat, options) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Apply resize if requested
                    let { width, height } = img;
                    if (options.resize && options.width && options.height) {
                        width = parseInt(options.width);
                        height = parseInt(options.height);
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to desired format
                    let mimeType;
                    let quality = options.quality || 0.8;
                    
                    switch (outputFormat) {
                        case 'png':
                            mimeType = 'image/png';
                            break;
                        case 'jpg':
                            mimeType = 'image/jpeg';
                            break;
                        case 'webp':
                            mimeType = 'image/webp';
                            break;
                        case 'gif':
                            mimeType = 'image/gif';
                            break;
                        case 'bmp':
                            mimeType = 'image/bmp';
                            break;
                        default:
                            mimeType = 'image/png';
                    }
                    
                    canvas.toBlob((blob) => {
                        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat;
                        resolve({
                            blob: blob,
                            fileName: fileName,
                            size: blob.size
                        });
                    }, mimeType, quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async convertImageToPdf(file, inputFormat, options) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const { jsPDF } = window.jspdf;
                    
                    // Get PDF options
                    const pageSize = options.pageSize || 'a4';
                    const orientation = options.orientation || 'portrait';
                    const marginSize = options.marginSize || 'medium';
                    const imageFit = options.imageFit || 'fit';
                    
                    // Create PDF
                    const pdf = new jsPDF(orientation, 'mm', pageSize);
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    
                    // Calculate margins
                    const margins = this.getMargins(marginSize);
                    const contentWidth = pageWidth - (margins.left + margins.right);
                    const contentHeight = pageHeight - (margins.top + margins.bottom);
                    
                    // Calculate image dimensions and position
                    const imageOptions = this.calculateImageOptions(
                        img.width, img.height, contentWidth, contentHeight, imageFit
                    );
                    
                    // Add image to PDF
                    pdf.addImage(e.target.result, 'JPEG', 
                        margins.left + imageOptions.x, 
                        margins.top + imageOptions.y, 
                        imageOptions.width, 
                        imageOptions.height
                    );
                    
                    const pdfBlob = pdf.output('blob');
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                    
                    resolve({
                        blob: pdfBlob,
                        fileName: fileName,
                        size: pdfBlob.size
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async convertPdfToImage(file, outputFormat, options) {
        // This would require PDF.js library for PDF rendering
        // For now, return a placeholder with format-specific information
        const dpi = options.dpi || 150;
        const page = options.page || 1;
        
        throw new Error(`PDF to ${outputFormat.toUpperCase()} conversion (${dpi} DPI, page ${page}) requires PDF.js library. Coming soon!`);
    }

    async convertTextToPdf(file, options) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const { jsPDF } = window.jspdf;
                
                const pdf = new jsPDF();
                const fontSize = parseInt(options.fontSize) || 12;
                const fontFamily = options.fontFamily || 'Arial';
                const pageSize = options.pageSize || 'a4';
                
                pdf.setFontSize(fontSize);
                pdf.setFont(fontFamily);
                
                const lines = pdf.splitTextToSize(text, 180);
                let y = 20;
                
                lines.forEach(line => {
                    if (y > 270) {
                        pdf.addPage();
                        y = 20;
                    }
                    pdf.text(line, 20, y);
                    y += fontSize * 0.5;
                });
                
                const pdfBlob = pdf.output('blob');
                const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                
                resolve({
                    blob: pdfBlob,
                    fileName: fileName,
                    size: pdfBlob.size
                });
            };
            reader.readAsText(file);
        });
    }

    async convertAudio(file, inputFormat, outputFormat, options) {
        return new Promise((resolve, reject) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    // Decode the audio file
                    const arrayBuffer = e.target.result;
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    
                    // Get conversion options
                    const sampleRate = parseInt(options.sampleRate) || 44100;
                    const channels = options.channels === 'mono' ? 1 : 2;
                    const bitrate = options.bitrate || '192k';
                    
                    // Create offline audio context for processing
                    const offlineContext = new OfflineAudioContext(
                        channels,
                        audioBuffer.length,
                        sampleRate
                    );
                    
                    // Create buffer source
                    const source = offlineContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(offlineContext.destination);
                    source.start();
                    
                    // Render the audio
                    const renderedBuffer = await offlineContext.startRendering();
                    
                    // Convert to desired format
                    let blob;
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + outputFormat;
                    
                                         switch (outputFormat) {
                         case 'wav':
                             blob = this.audioBufferToWav(renderedBuffer, sampleRate);
                             break;
                         case 'mp3':
                             // MP3 encoding requires additional libraries
                             throw new Error(`MP3 encoding (${bitrate}, ${sampleRate}Hz, ${channels}) requires additional libraries like lame.js. Coming soon!`);
                         case 'ogg':
                             // OGG encoding requires additional libraries
                             throw new Error(`OGG encoding (${bitrate}, ${sampleRate}Hz, ${channels}) requires additional libraries like ogg.js. Coming soon!`);
                         case 'aac':
                             // AAC encoding requires additional libraries
                             throw new Error(`AAC encoding (${bitrate}, ${sampleRate}Hz, ${channels}) requires additional libraries. Coming soon!`);
                         case 'm4a':
                             // M4A encoding requires additional libraries
                             throw new Error(`M4A encoding (${bitrate}, ${sampleRate}Hz, ${channels}) requires additional libraries. Coming soon!`);
                         case 'flac':
                             // FLAC encoding requires additional libraries
                             throw new Error(`FLAC encoding (${sampleRate}Hz, ${channels}) requires additional libraries. Coming soon!`);
                         case 'wma':
                             // WMA encoding requires additional libraries
                             throw new Error(`WMA encoding (${bitrate}, ${sampleRate}Hz, ${channels}) requires additional libraries. Coming soon!`);
                         default:
                             blob = this.audioBufferToWav(renderedBuffer, sampleRate);
                     }
                    
                    resolve({
                        blob: blob,
                        fileName: fileName,
                        size: blob.size
                    });
                    
                } catch (error) {
                    reject(new Error(`Audio conversion failed: ${error.message}`));
                } finally {
                    audioContext.close();
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read audio file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    audioBufferToWav(buffer, sampleRate) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRateInt = Math.round(sampleRate);
        
        // Create WAV header
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV file header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        const writeUint32 = (offset, value) => {
            view.setUint32(offset, value, true);
        };
        
        const writeUint16 = (offset, value) => {
            view.setUint16(offset, value, true);
        };
        
        // RIFF chunk descriptor
        writeString(0, 'RIFF');
        writeUint32(4, 36 + length * numberOfChannels * 2);
        writeString(8, 'WAVE');
        
        // fmt sub-chunk
        writeString(12, 'fmt ');
        writeUint32(16, 16);
        writeUint16(20, 1);
        writeUint16(22, numberOfChannels);
        writeUint32(24, sampleRateInt);
        writeUint32(28, sampleRateInt * numberOfChannels * 2);
        writeUint16(32, numberOfChannels * 2);
        writeUint16(34, 16);
        
        // data sub-chunk
        writeString(36, 'data');
        writeUint32(40, length * numberOfChannels * 2);
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    async extractAudioFromVideo(file, inputFormat, outputFormat, options) {
        // This would require FFmpeg.js or similar library
        // For now, return a placeholder with detailed information
        const audioFormat = options.audioFormat || 'mp3';
        const bitrate = options.audioBitrate || '192k';
        const sampleRate = options.sampleRate || '44100';
        
        throw new Error(`Audio extraction from ${inputFormat} to ${outputFormat} (${audioFormat}, ${bitrate}, ${sampleRate}Hz) requires FFmpeg.js library. This feature will extract audio tracks from video files. Coming soon!`);
    }

    async convertVideo(file, inputFormat, outputFormat, options) {
        // This would require FFmpeg.js or similar library
        // For now, return a placeholder with detailed information
        const bitrate = options.bitrate || '2000k';
        const resolution = options.resolution || '720p';
        const audioBitrate = options.audioBitrate || '192k';
        
        throw new Error(`Video conversion from ${inputFormat} to ${outputFormat} (${bitrate}, ${resolution}, ${audioBitrate}) requires FFmpeg.js library. Coming soon!`);
    }

    async convertDocumentToPdf(file, inputFormat, options) {
        // This would require a library like mammoth.js for DOCX or similar for DOC
        // For now, return a placeholder with more helpful information
        const pageSize = options.pageSize || 'a4';
        const orientation = options.orientation || 'portrait';
        
        throw new Error(`${inputFormat.toUpperCase()} to PDF conversion (${pageSize}, ${orientation}) requires additional libraries like mammoth.js. Coming soon!`);
    }

    async convertDocumentToText(file, inputFormat, options) {
        // This would require a library like mammoth.js for DOCX or similar for DOC
        // For now, return a placeholder with more helpful information
        throw new Error(`${inputFormat.toUpperCase()} to TXT conversion requires additional libraries like mammoth.js. Coming soon!`);
    }

    async convertDocumentToDocx(file, inputFormat, options) {
        // This would require a library like mammoth.js for DOCX conversion
        // For now, return a placeholder with more helpful information
        const pageSize = options.pageSize || 'a4';
        const orientation = options.orientation || 'portrait';
        
        throw new Error(`${inputFormat.toUpperCase()} to DOCX conversion (${pageSize}, ${orientation}) requires additional libraries like mammoth.js. Coming soon!`);
    }

    showDownloadSection(results) {
        const downloadSection = document.getElementById('downloadSection');
        const downloadButtons = document.getElementById('downloadButtons');
        
        downloadButtons.innerHTML = '';
        
        results.forEach((result, index) => {
            if (result.error) {
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'color: #dc3545; margin: 0.5rem 0;';
                errorDiv.textContent = `Error converting ${result.fileName}: ${result.error}`;
                downloadButtons.appendChild(errorDiv);
            } else {
                const url = URL.createObjectURL(result.blob);
                const downloadBtn = document.createElement('a');
                downloadBtn.href = url;
                downloadBtn.download = result.fileName;
                downloadBtn.className = 'download-btn';
                downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download ${result.fileName}`;
                
                // Clean up URL after download
                downloadBtn.addEventListener('click', () => {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                });
                
                downloadButtons.appendChild(downloadBtn);
            }
        });
        
        downloadSection.style.display = 'block';
    }

    showProgressBar() {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.display = 'block';
    }

    hideProgressBar() {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.display = 'none';
        this.updateProgress(0);
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
    }

    showStatus(message, type) {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getMargins(marginSize) {
        const marginValues = {
            none: { top: 0, right: 0, bottom: 0, left: 0 },
            small: { top: 10, right: 10, bottom: 10, left: 10 },
            medium: { top: 20, right: 20, bottom: 20, left: 20 },
            large: { top: 30, right: 30, bottom: 30, left: 30 }
        };
        return marginValues[marginSize] || marginValues.medium;
    }

    calculateImageOptions(imgWidth, imgHeight, maxWidth, maxHeight, fitType) {
        let width, height, x, y;
        
        switch (fitType) {
            case 'stretch':
                width = maxWidth;
                height = maxHeight;
                x = 0;
                y = 0;
                break;
            case 'original':
                width = Math.min(imgWidth, maxWidth);
                height = Math.min(imgHeight, maxHeight);
                x = (maxWidth - width) / 2;
                y = (maxHeight - height) / 2;
                break;
            case 'fit':
            default:
                const aspectRatio = imgWidth / imgHeight;
                if (maxWidth / maxHeight > aspectRatio) {
                    height = maxHeight;
                    width = height * aspectRatio;
                } else {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
                x = (maxWidth - width) / 2;
                y = (maxHeight - height) / 2;
                break;
        }

        return { width, height, x, y };
    }

    addQualityPresets() {
        const optionsGrid = document.getElementById('optionsGrid');
        
        const presetsGroup = document.createElement('div');
        presetsGroup.className = 'option-group quality-presets';
        
        const label = document.createElement('label');
        label.textContent = 'Quality Presets';
        
        const presetsContainer = document.createElement('div');
        presetsContainer.className = 'presets-container';
        
        const presets = [
            { name: '480p', width: 854, height: 480, quality: 0.6 },
            { name: '720p', width: 1280, height: 720, quality: 0.7 },
            { name: '1080p', width: 1920, height: 1080, quality: 0.8 },
            { name: '2K', width: 2560, height: 1440, quality: 0.85 },
            { name: '4K', width: 3840, height: 2160, quality: 0.9 }
        ];
        
        presets.forEach(preset => {
            const presetBtn = document.createElement('button');
            presetBtn.type = 'button';
            presetBtn.className = 'preset-btn';
            presetBtn.textContent = preset.name;
            presetBtn.dataset.width = preset.width;
            presetBtn.dataset.height = preset.height;
            presetBtn.dataset.quality = preset.quality;
            
            presetBtn.addEventListener('click', () => {
                this.applyQualityPreset(preset);
            });
            
            presetsContainer.appendChild(presetBtn);
        });
        
        presetsGroup.appendChild(label);
        presetsGroup.appendChild(presetsContainer);
        optionsGrid.appendChild(presetsGroup);
    }

    async applyQualityPreset(preset) {
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        const qualityInput = document.getElementById('quality');
        const resizeCheckbox = document.getElementById('resize');
        
        if (widthInput && heightInput && qualityInput) {
            // Check if preset quality is valid for current image
            const isValidQuality = await this.validateQualityPreset(preset);
            
            if (isValidQuality) {
                widthInput.value = preset.width;
                heightInput.value = preset.height;
                qualityInput.value = preset.quality;
                resizeCheckbox.checked = true;
                
                // Update displays
                const qualityValue = document.getElementById('quality-value');
                if (qualityValue) {
                    qualityValue.textContent = `${Math.round(preset.quality * 100)}%`;
                }
                
                await this.updateFileSizeEstimate();
                this.toggleResizeOptions();
                this.updatePresetButtons(preset);
            } else {
                this.showStatus(`Quality preset ${preset.name} exceeds image's maximum quality`, 'warning');
            }
        }
    }

    validateQualityPreset(preset) {
        // Get current image dimensions
        if (this.files.length === 0) return true;
        
        const file = this.files[0];
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const maxQuality = this.calculateMaxQuality(img.width, img.height, preset.width, preset.height);
                    resolve(preset.quality <= maxQuality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    calculateMaxQuality(originalWidth, originalHeight, targetWidth, targetHeight) {
        // Calculate maximum quality based on image scaling
        const scaleFactor = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
        
        if (scaleFactor >= 1) {
            // Upscaling - limit quality to prevent artifacts
            return Math.min(0.95, 1 / scaleFactor);
        } else {
            // Downscaling - can use higher quality
            return Math.min(0.95, 1 + (1 - scaleFactor) * 0.2);
        }
    }

    updatePresetButtons(selectedPreset) {
        const presetBtns = document.querySelectorAll('.preset-btn');
        
        presetBtns.forEach(btn => {
            const preset = {
                name: btn.textContent,
                width: parseInt(btn.dataset.width),
                height: parseInt(btn.dataset.height),
                quality: parseFloat(btn.dataset.quality)
            };
            
            // Validate each preset
            this.validateQualityPreset(preset).then(isValid => {
                if (isValid) {
                    btn.classList.remove('disabled');
                    btn.classList.toggle('active', btn.textContent === selectedPreset.name);
                } else {
                    btn.classList.add('disabled');
                    btn.classList.remove('active');
                }
            });
        });
    }

    addFileSizeEstimate() {
        const optionsGrid = document.getElementById('optionsGrid');
        
        const estimateGroup = document.createElement('div');
        estimateGroup.className = 'option-group file-size-estimate';
        
        const label = document.createElement('label');
        label.textContent = 'File Size Estimate';
        
        const estimateDisplay = document.createElement('div');
        estimateDisplay.className = 'estimate-display';
        estimateDisplay.id = 'file-size-estimate';
        estimateDisplay.innerHTML = '<span class="estimate-label">Original:</span> <span class="estimate-value">-</span>';
        
        estimateGroup.appendChild(label);
        estimateGroup.appendChild(estimateDisplay);
        optionsGrid.appendChild(estimateGroup);
        
        // Initial estimate
        this.updateFileSizeEstimate();
    }

    async updateFileSizeEstimate() {
        if (this.files.length === 0) return;
        
        const file = this.files[0];
        const estimateDisplay = document.getElementById('file-size-estimate');
        
        if (!estimateDisplay) return;
        
        const originalSize = this.formatFileSize(file.size);
        const options = this.getConversionOptions();
        
        // Calculate estimated size based on quality and dimensions
        const estimatedSize = await this.calculateEstimatedSize(file, options);
        
        estimateDisplay.innerHTML = `
            <span class="estimate-label">Original:</span> <span class="estimate-value">${originalSize}</span>
            <br>
            <span class="estimate-label">Estimated:</span> <span class="estimate-value">${estimatedSize}</span>
        `;
    }

    calculateEstimatedSize(file, options) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    const quality = options.quality || 0.8;
                    
                    // Apply resize if enabled
                    if (options.resize && options.width && options.height) {
                        width = parseInt(options.width);
                        height = parseInt(options.height);
                    }
                    
                    // Calculate estimated size based on dimensions and quality
                    const pixels = width * height;
                    const bytesPerPixel = this.getBytesPerPixel(this.outputFormat);
                    const compressionRatio = this.getCompressionRatio(this.outputFormat, quality);
                    
                    const estimatedBytes = pixels * bytesPerPixel * compressionRatio;
                    const estimatedSize = this.formatFileSize(estimatedBytes);
                    
                    resolve(estimatedSize);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    getBytesPerPixel(format) {
        const bytesPerPixel = {
            'png': 4, // RGBA
            'jpg': 3, // RGB
            'webp': 3, // RGB
            'gif': 1  // Indexed
        };
        return bytesPerPixel[format] || 3;
    }

    getCompressionRatio(format, quality) {
        const baseCompression = {
            'png': 0.8,
            'jpg': 0.1,
            'webp': 0.15,
            'gif': 0.5
        };
        
        const formatCompression = baseCompression[format] || 0.3;
        return formatCompression * quality;
    }

    toggleResizeOptions() {
        const resizeCheckbox = document.getElementById('resize');
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        
        if (resizeCheckbox && widthInput && heightInput) {
            const isChecked = resizeCheckbox.checked;
            widthInput.disabled = !isChecked;
            heightInput.disabled = !isChecked;
            
            // Update styling
            const widthGroup = widthInput.closest('.option-group');
            const heightGroup = heightInput.closest('.option-group');
            
            if (isChecked) {
                widthGroup.classList.remove('disabled');
                heightGroup.classList.remove('disabled');
            } else {
                widthGroup.classList.add('disabled');
                heightGroup.classList.add('disabled');
            }
        }
    }
}

// Initialize converter when page loads
let converter;
document.addEventListener('DOMContentLoaded', () => {
    converter = new MultiFormatConverter();
});

// Reset function
function resetConverter() {
    location.reload();
}
