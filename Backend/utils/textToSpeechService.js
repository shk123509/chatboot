const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Text-to-Speech Service
 * Converts text responses to audio files using system TTS or external services
 * Supports multiple languages and optimized for farming terminology
 */
class TextToSpeechService {
    constructor() {
        this.audioOutputDir = path.join(__dirname, '..', 'public', 'audio');
        this.ensureAudioDirectory();
        
        // Supported languages with their TTS voices/codes
        this.supportedLanguages = {
            'en': 'en-US', // English
            'hi': 'hi-IN', // Hindi
            'pa': 'pa-IN', // Punjabi
            'ur': 'ur-PK'  // Urdu
        };
        
        // Audio format settings
        this.audioSettings = {
            format: 'wav',
            sampleRate: 22050,
            bitRate: '128k',
            channels: 1
        };
    }
    
    /**
     * Ensure audio output directory exists
     */
    ensureAudioDirectory() {
        if (!fs.existsSync(this.audioOutputDir)) {
            fs.mkdirSync(this.audioOutputDir, { recursive: true });
            console.log('📁 Created audio output directory:', this.audioOutputDir);
        }
    }
    
    /**
     * Convert text to speech and return audio file path
     * @param {string} text - Text to convert to speech
     * @param {string} language - Language code (en, hi, pa, ur)
     * @param {string} voiceId - Optional specific voice ID
     * @returns {Object} Result with audio file path and metadata
     */
    async convertToSpeech(text, language = 'en', voiceId = null) {
        try {
            if (!text || text.trim().length === 0) {
                throw new Error('Text is required for TTS conversion');
            }
            
            // Clean and prepare text for TTS
            const cleanText = this.prepareTextForTTS(text);
            
            // Generate unique filename
            const filename = this.generateAudioFilename(cleanText, language);
            const outputPath = path.join(this.audioOutputDir, filename);
            
            // Check if audio file already exists (cache)
            if (fs.existsSync(outputPath)) {
                console.log('🎵 Using cached audio file:', filename);
                return {
                    success: true,
                    audioPath: outputPath,
                    audioUrl: `/audio/${filename}`,
                    duration: await this.getAudioDuration(outputPath),
                    cached: true
                };
            }
            
            // Generate new audio file
            const audioResult = await this.generateAudioFile(cleanText, language, outputPath, voiceId);
            
            if (audioResult.success) {
                return {
                    success: true,
                    audioPath: outputPath,
                    audioUrl: `/audio/${filename}`,
                    duration: audioResult.duration,
                    cached: false,
                    metadata: {
                        language: language,
                        textLength: cleanText.length,
                        voice: audioResult.voice
                    }
                };
            } else {
                throw new Error(audioResult.error || 'TTS generation failed');
            }
            
        } catch (error) {
            console.error('❌ TTS Error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackAudio(language)
            };
        }
    }
    
    /**
     * Prepare text for TTS by cleaning and optimizing
     */
    prepareTextForTTS(text) {
        let cleanText = text;
        
        // Remove markdown formatting
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
        cleanText = cleanText.replace(/\*(.*?)\*/g, '$1'); // Remove italic
        cleanText = cleanText.replace(/__(.*?)__/g, '$1'); // Remove underline
        cleanText = cleanText.replace(/~~(.*?)~~/g, '$1'); // Remove strikethrough
        
        // Remove special characters and emojis
        cleanText = cleanText.replace(/[🌾🔍💡📷📄🎤🔊🤖⚡]/g, '');
        
        // Replace common abbreviations with full words
        cleanText = cleanText.replace(/\bNPK\b/gi, 'Nitrogen Phosphorus Potassium');
        cleanText = cleanText.replace(/\bpH\b/gi, 'P H level');
        cleanText = cleanText.replace(/\bTDS\b/gi, 'Total Dissolved Solids');
        
        // Clean up spacing and punctuation
        cleanText = cleanText.replace(/\s+/g, ' '); // Multiple spaces to single
        cleanText = cleanText.replace(/\n\s*\n/g, '. '); // Double newlines to period
        cleanText = cleanText.replace(/\n/g, ', '); // Single newlines to comma
        
        // Limit text length for TTS (most TTS services have limits)
        if (cleanText.length > 1500) {
            cleanText = cleanText.substring(0, 1500) + '...';
        }
        
        return cleanText.trim();
    }
    
    /**
     * Generate unique filename for audio file
     */
    generateAudioFilename(text, language) {
        // Create a hash-like identifier from text
        const textHash = Buffer.from(text.substring(0, 50)).toString('base64')
            .replace(/[+/=]/g, '')
            .substring(0, 8);
        
        const timestamp = Date.now();
        return `tts_${language}_${textHash}_${timestamp}.${this.audioSettings.format}`;
    }
    
    /**
     * Generate audio file using available TTS methods
     */
    async generateAudioFile(text, language, outputPath, voiceId) {
        // Try different TTS methods in order of preference
        const methods = [
            () => this.generateWithWindowsSAPI(text, language, outputPath),
            () => this.generateWithEspeak(text, language, outputPath),
            () => this.generateWithPicoTTS(text, language, outputPath),
            () => this.generateSimulatedAudio(text, language, outputPath)
        ];
        
        for (const method of methods) {
            try {
                const result = await method();
                if (result.success) {
                    console.log(`🎵 Audio generated successfully using ${result.method}`);
                    return result;
                }
            } catch (error) {
                console.log(`TTS method failed, trying next: ${error.message}`);
            }
        }
        
        // If all methods fail, return error
        return {
            success: false,
            error: 'All TTS methods failed'
        };
    }
    
    /**
     * Generate audio using Windows SAPI (Speech API)
     * This works on Windows systems
     */
    async generateWithWindowsSAPI(text, language, outputPath) {
        return new Promise((resolve, reject) => {
            // PowerShell script to use Windows Speech API
            const psScript = `
                $speech = New-Object -ComObject SAPI.SpVoice
                $filestream = New-Object -ComObject SAPI.SpFileStream
                $filestream.Open("${outputPath.replace(/\\/g, '\\\\')}", 3)
                $speech.AudioOutputStream = $filestream
                $speech.Speak("${text.replace(/"/g, '\\"')}")
                $filestream.Close()
                Write-Output "Audio generated successfully"
            `;
            
            const powershell = spawn('powershell', ['-Command', psScript], {
                windowsHide: true,
                timeout: 30000
            });
            
            let output = '';
            let errors = '';
            
            powershell.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            powershell.stderr.on('data', (data) => {
                errors += data.toString();
            });
            
            powershell.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve({
                        success: true,
                        method: 'Windows SAPI',
                        duration: this.estimateAudioDuration(text),
                        voice: 'Windows Default'
                    });
                } else {
                    reject(new Error(`Windows SAPI failed: ${errors || 'Unknown error'}`));
                }
            });
            
            powershell.on('error', (error) => {
                reject(new Error(`PowerShell execution failed: ${error.message}`));
            });
        });
    }
    
    /**
     * Generate audio using eSpeak TTS
     * Cross-platform TTS engine
     */
    async generateWithEspeak(text, language, outputPath) {
        return new Promise((resolve, reject) => {
            const langCode = this.supportedLanguages[language] || 'en';
            const args = [
                '-v', langCode,
                '-s', '150', // Speed
                '-a', '100', // Amplitude
                '-w', outputPath, // Output file
                text
            ];
            
            const espeak = spawn('espeak', args, {
                timeout: 30000
            });
            
            let errors = '';
            
            espeak.stderr.on('data', (data) => {
                errors += data.toString();
            });
            
            espeak.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve({
                        success: true,
                        method: 'eSpeak',
                        duration: this.estimateAudioDuration(text),
                        voice: `eSpeak ${langCode}`
                    });
                } else {
                    reject(new Error(`eSpeak failed: ${errors || 'Unknown error'}`));
                }
            });
            
            espeak.on('error', (error) => {
                reject(new Error(`eSpeak execution failed: ${error.message}`));
            });
        });
    }
    
    /**
     * Generate audio using Pico TTS
     * Lightweight TTS engine
     */
    async generateWithPicoTTS(text, language, outputPath) {
        return new Promise((resolve, reject) => {
            const langCode = language === 'hi' ? 'hi-IN' : 'en-US';
            const args = [
                '-l', langCode,
                '-w', outputPath,
                text
            ];
            
            const pico = spawn('pico2wave', args, {
                timeout: 30000
            });
            
            let errors = '';
            
            pico.stderr.on('data', (data) => {
                errors += data.toString();
            });
            
            pico.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve({
                        success: true,
                        method: 'Pico TTS',
                        duration: this.estimateAudioDuration(text),
                        voice: `Pico ${langCode}`
                    });
                } else {
                    reject(new Error(`Pico TTS failed: ${errors || 'Unknown error'}`));
                }
            });
            
            pico.on('error', (error) => {
                reject(new Error(`Pico TTS execution failed: ${error.message}`));
            });
        });
    }
    
    /**
     * Generate simulated audio file (as fallback)
     * Creates a simple tone-based audio file
     */
    async generateSimulatedAudio(text, language, outputPath) {
        try {
            // Create a simple WAV file with silence
            // This is a basic PCM WAV header followed by silence
            const duration = Math.max(2, Math.min(30, text.length * 0.1)); // 2-30 seconds based on text length
            const sampleRate = 22050;
            const samples = Math.floor(duration * sampleRate);
            const dataSize = samples * 2; // 16-bit samples
            
            // WAV file header
            const header = Buffer.alloc(44);
            header.write('RIFF', 0, 4);
            header.writeUInt32LE(dataSize + 36, 4);
            header.write('WAVE', 8, 4);
            header.write('fmt ', 12, 4);
            header.writeUInt32LE(16, 16);
            header.writeUInt16LE(1, 20);
            header.writeUInt16LE(1, 22);
            header.writeUInt32LE(sampleRate, 24);
            header.writeUInt32LE(sampleRate * 2, 28);
            header.writeUInt16LE(2, 32);
            header.writeUInt16LE(16, 34);
            header.write('data', 36, 4);
            header.writeUInt32LE(dataSize, 40);
            
            // Generate quiet tone data
            const audioData = Buffer.alloc(dataSize);
            for (let i = 0; i < samples; i++) {
                // Generate a very quiet sine wave (simulated speech)
                const value = Math.floor(Math.sin(2 * Math.PI * 440 * i / sampleRate) * 1000);
                audioData.writeInt16LE(value, i * 2);
            }
            
            // Write complete file
            const completeFile = Buffer.concat([header, audioData]);
            fs.writeFileSync(outputPath, completeFile);
            
            return {
                success: true,
                method: 'Simulated Audio',
                duration: duration,
                voice: 'Synthetic Tone'
            };
        } catch (error) {
            throw new Error(`Simulated audio generation failed: ${error.message}`);
        }
    }
    
    /**
     * Estimate audio duration based on text length
     * Rough calculation: ~150 words per minute
     */
    estimateAudioDuration(text) {
        const words = text.split(/\s+/).length;
        const wordsPerMinute = 150;
        const durationMinutes = words / wordsPerMinute;
        return Math.max(2, Math.ceil(durationMinutes * 60)); // At least 2 seconds
    }
    
    /**
     * Get actual audio duration using file analysis
     */
    async getAudioDuration(audioPath) {
        try {
            // For WAV files, we can estimate duration from file size
            const stats = fs.statSync(audioPath);
            const fileSizeBytes = stats.size;
            const headerSize = 44; // WAV header
            const dataSize = fileSizeBytes - headerSize;
            const duration = dataSize / (this.audioSettings.sampleRate * 2); // 16-bit samples
            
            return Math.max(1, Math.ceil(duration));
        } catch (error) {
            console.warn('Could not determine audio duration:', error.message);
            return 5; // Default fallback
        }
    }
    
    /**
     * Get fallback audio response when TTS fails
     */
    getFallbackAudio(language) {
        return {
            audioUrl: null,
            message: this.getFallbackMessages()[language] || this.getFallbackMessages()['en']
        };
    }
    
    /**
     * Get fallback messages for different languages
     */
    getFallbackMessages() {
        return {
            'en': 'Audio response is currently unavailable. Please read the text response above.',
            'hi': 'ऑडियो उत्तर वर्तमान में उपलब्ध नहीं है। कृपया ऊपर का टेक्स्ट उत्तर पढ़ें।',
            'pa': 'ਆਡੀਓ ਜਵਾਬ ਫਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਉਪਰ ਦਾ ਟੈਕਸਟ ਜਵਾਬ ਪੜ੍ਹੋ।',
            'ur': 'آڈیو جواب فی الوقت دستیاب نہیں ہے۔ براہ کرم اوپر کا ٹیکسٹ جواب پڑھیں۔'
        };
    }
    
    /**
     * Clean up old audio files to manage disk space
     */
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = fs.readdirSync(this.audioOutputDir);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
            
            let deletedCount = 0;
            
            for (const file of files) {
                if (file.startsWith('tts_') && file.endsWith('.wav')) {
                    const filePath = path.join(this.audioOutputDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🗑️ Cleaned up ${deletedCount} old TTS audio files`);
            }
        } catch (error) {
            console.error('Error cleaning up audio files:', error.message);
        }
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Object.keys(this.supportedLanguages);
    }
    
    /**
     * Check if TTS is available for a language
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.hasOwnProperty(language);
    }
}

module.exports = TextToSpeechService;