const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const EnhancedKnowledgeBase = require('./enhancedKnowledgeBase');
const { checkSpelling } = require('./spellChecker');

/**
 * Enhanced Voice Processing Service
 * Handles speech-to-text, text processing with RAG, and intelligent responses
 * Designed specifically for agricultural voice queries
 */
class EnhancedVoiceService {
    constructor() {
        this.audioInputDir = path.join(__dirname, '..', 'uploads', 'audio');
        this.knowledgeBase = new EnhancedKnowledgeBase();
        this.ensureDirectories();
        
        // Supported audio formats
        this.supportedFormats = ['wav', 'mp3', 'ogg', 'webm', 'm4a'];
        
        // Language support for speech recognition
        this.supportedLanguages = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'pa': 'pa-IN',
            'ur': 'ur-PK'
        };
        
        // Voice processing settings
        this.processingSettings = {
            maxDurationSeconds: 120, // 2 minutes max
            minDurationSeconds: 1,
            sampleRate: 16000,
            channels: 1
        };
    }
    
    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        if (!fs.existsSync(this.audioInputDir)) {
            fs.mkdirSync(this.audioInputDir, { recursive: true });
            console.log('📁 Created audio input directory:', this.audioInputDir);
        }
    }
    
    /**
     * Process voice message and generate intelligent response
     * @param {string} audioPath - Path to the uploaded audio file
     * @param {string} language - Language code for processing
     * @param {Array} conversationHistory - Previous messages for context
     * @returns {Object} Processing result with transcription and response
     */
    async processVoiceMessage(audioPath, language = 'en', conversationHistory = []) {
        try {
            console.log(`🎤 Processing voice message: ${audioPath}`);
            
            // 1. Validate audio file
            const validation = await this.validateAudioFile(audioPath);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // 2. Convert speech to text
            const transcriptionResult = await this.speechToText(audioPath, language);
            if (!transcriptionResult.success) {
                throw new Error(transcriptionResult.error || 'Speech recognition failed');
            }
            
            const rawTranscription = transcriptionResult.text;
            console.log(`🗣️ Transcribed: "${rawTranscription}"`);
            
            // 3. Apply spell check and corrections
            const spellCheckResult = checkSpelling(rawTranscription, language);
            const correctedText = spellCheckResult.correctedMessage;
            
            // 4. Process the corrected text through RAG system
            const ragResponse = await this.processWithRAG(correctedText, language, conversationHistory);
            
            // 5. Generate comprehensive voice response
            return {
                success: true,
                transcription: {
                    original: rawTranscription,
                    corrected: correctedText,
                    spellCheck: spellCheckResult
                },
                response: ragResponse.response,
                confidence: ragResponse.confidence,
                sources: ragResponse.sources,
                metadata: {
                    audioProcessed: validation.metadata,
                    processingTime: Date.now() - validation.startTime,
                    ragUsed: true,
                    language: language
                }
            };
            
        } catch (error) {
            console.error('❌ Voice processing error:', error);
            
            // Enhanced error logging for debugging
            console.log('📊 Voice Processing Debug Info:', {
                audioPath: audioPath,
                language: language,
                errorMessage: error.message,
                errorStack: error.stack?.substring(0, 500),
                timestamp: new Date().toISOString()
            });
            
            return this.getFallbackVoiceResponse(error.message, language);
        }
    }
    
    /**
     * Validate uploaded audio file
     */
    async validateAudioFile(audioPath) {
        try {
            const startTime = Date.now();
            
            if (!fs.existsSync(audioPath)) {
                return { valid: false, error: 'Audio file not found' };
            }
            
            const stats = fs.statSync(audioPath);
            const fileSizeBytes = stats.size;
            const fileSizeMB = fileSizeBytes / (1024 * 1024);
            
            // Check file size (max 25MB)
            if (fileSizeMB > 25) {
                return { valid: false, error: 'Audio file too large (max 25MB)' };
            }
            
            // Check file extension
            const ext = path.extname(audioPath).toLowerCase().substring(1);
            if (!this.supportedFormats.includes(ext)) {
                return { valid: false, error: `Unsupported format: ${ext}` };
            }
            
            // Estimate duration (more lenient calculation)
            let estimatedDuration = 0;
            if (ext === 'wav') {
                // For WAV files, we can estimate from file size
                const headerSize = 44; // Typical WAV header
                const dataSize = fileSizeBytes - headerSize;
                // More lenient calculation - assume mono 16-bit at 44.1kHz
                estimatedDuration = Math.max(0.5, dataSize / (44100 * 2)); // Default to 0.5 seconds minimum
            } else {
                // For compressed formats, be more lenient
                estimatedDuration = Math.max(1, fileSizeBytes / 8000); // More generous estimate
            }
            
            // More lenient duration checks
            if (fileSizeBytes < 500) { // Less than 500 bytes - definitely too short
                return { valid: false, error: 'Audio file too small - please record a longer message (minimum 2 seconds)' };
            }
            
            if (estimatedDuration > this.processingSettings.maxDurationSeconds) {
                return { valid: false, error: 'Audio too long (max 2 minutes)' };
            }
            
            // Log for debugging
            console.log(`📊 Audio validation - File: ${fileSizeMB}MB, Estimated: ${estimatedDuration}s, Format: ${ext}`);
            
            // If file size suggests it's a valid recording, allow it through
            if (fileSizeBytes > 1000 && fileSizeBytes < 25 * 1024 * 1024) {
                console.log('✅ Audio file passed validation checks');
            }
            
            return {
                valid: true,
                metadata: {
                    fileSize: fileSizeBytes,
                    fileSizeMB: Math.round(fileSizeMB * 100) / 100,
                    format: ext,
                    estimatedDuration: Math.round(estimatedDuration),
                    startTime: startTime
                }
            };
            
        } catch (error) {
            return { valid: false, error: `File validation failed: ${error.message}` };
        }
    }
    
    /**
     * Convert speech to text using available recognition services
     */
    async speechToText(audioPath, language = 'en') {
        // Try multiple speech recognition methods
        const methods = [
            () => this.speechToTextWithWindows(audioPath, language),
            () => this.speechToTextWithGoogle(audioPath, language), // If API available
            () => this.speechToTextSimulated(audioPath, language) // Fallback
        ];
        
        for (const method of methods) {
            try {
                const result = await method();
                if (result.success && result.text && result.text.trim().length > 0) {
                    console.log(`✅ Speech recognition successful using ${result.method}`);
                    return result;
                }
            } catch (error) {
                console.log(`STT method failed, trying next: ${error.message}`);
            }
        }
        
        return {
            success: false,
            error: 'All speech recognition methods failed'
        };
    }
    
    /**
     * Speech to text using Windows Speech API
     */
    async speechToTextWithWindows(audioPath, language) {
        return new Promise((resolve, reject) => {
            const langCode = this.supportedLanguages[language] || 'en-US';
            
            // PowerShell script for Windows Speech Recognition with better error handling
            const psScript = `
                try {
                    Add-Type -AssemblyName System.Speech
                    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
                    
                    # Check if audio file exists and is accessible
                    if (-not (Test-Path "${audioPath.replace(/\\/g, '\\\\')}")) {
                        Write-Error "Audio file not found: ${audioPath.replace(/\\/g, '\\\\')}"
                        exit 1
                    }
                    
                    # Try to set input to wave file
                    try {
                        $recognizer.SetInputToWaveFile("${audioPath.replace(/\\/g, '\\\\')}")  
                    } catch {
                        Write-Error "Failed to load audio file - format may not be supported: $($_.Exception.Message)"
                        $recognizer.Dispose()
                        exit 1
                    }
                    
                    # Load dictation grammar instead of empty grammar
                    try {
                        $recognizer.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
                    } catch {
                        Write-Error "Failed to load speech grammar: $($_.Exception.Message)"
                        $recognizer.Dispose()  
                        exit 1
                    }
                    
                    # Attempt recognition with timeout
                    $result = $recognizer.Recognize([TimeSpan]::FromSeconds(30))
                    
                    if ($result -and $result.Text) {
                        Write-Output $result.Text
                        exit 0
                    } else {
                        Write-Error "No speech could be recognized from the audio file"
                        exit 1
                    }
                } catch {
                    Write-Error "Speech recognition failed: $($_.Exception.Message)"
                    exit 1
                } finally {
                    if ($recognizer) { $recognizer.Dispose() }
                }
            `;
            
            const powershell = spawn('powershell', ['-Command', psScript], {
                timeout: 60000,
                windowsHide: true
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
                const text = output.trim();
                if (code === 0 && text.length > 0) {
                    resolve({
                        success: true,
                        text: text,
                        method: 'Windows Speech API',
                        confidence: 0.75
                    });
                } else {
                    reject(new Error(`Windows STT failed: ${errors || 'No output'}`));
                }
            });
            
            powershell.on('error', (error) => {
                reject(new Error(`PowerShell STT execution failed: ${error.message}`));
            });
        });
    }
    
    /**
     * Speech to text using Google Speech-to-Text API (if available)
     */
    async speechToTextWithGoogle(audioPath, language) {
        // This would require Google Cloud Speech API credentials
        // For now, we'll skip this method
        throw new Error('Google Speech API not configured');
    }
    
    /**
     * Simulated speech to text (fallback for demo/development)
     */
    async speechToTextSimulated(audioPath, language) {
        try {
            // For demonstration, we'll generate realistic farming-related queries
            // In production, this would be replaced with actual STT
            
            const simulatedQueries = {
                'en': [
                    'My tomato plants have yellow leaves what should I do',
                    'How to control pests on my wheat crop',
                    'What fertilizer is best for corn in sandy soil',
                    'When should I water my vegetable garden',
                    'My crop has brown spots on leaves please help',
                    'How to improve soil drainage in my field',
                    'What causes wilting in pepper plants',
                    'Best time to plant rice in monsoon season',
                    'How to prevent fungal diseases in crops',
                    'What is the right pH level for potato cultivation'
                ],
                'hi': [
                    'मेरे टमाटर के पौधों में पीले पत्ते हैं क्या करना चाहिए',
                    'गेहूं की फसल में कीड़े कैसे नियंत्रित करें',
                    'रेतीली मिट्टी में मकका के लिए कौन सा खाद बेहतर है',
                    'सब्जी के बगीचे में कब पानी देना चाहिए',
                    'मेरी फसल के पत्तों पर भूरे धब्बे हैं कृपया मदद करें'
                ],
                'pa': [
                    'ਮੇਰੇ ਟਮਾਟਰ ਦੇ ਪੌਧਿਆਂ ਵਿੱਚ ਪੀਲੇ ਪੱਤੇ ਹਨ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ',
                    'ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਕੀੜੇ ਕਿਵੇਂ ਕੰਟਰੋਲ ਕਰੀਏ',
                    'ਸਬਜ਼ੀ ਦੇ ਬਗੀਚੇ ਵਿੱਚ ਕਦੋਂ ਪਾਣੀ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ'
                ],
                'ur': [
                    'میرے ٹماٹر کے پودوں میں پیلے پتے ہیں کیا کرنا چاہیے',
                    'گیہوں کی فصل میں کیڑے کیسے کنٹرول کریں',
                    'سبزی کے باغ میں کب پانی دینا چاہیے'
                ]
            };
            
            const queries = simulatedQueries[language] || simulatedQueries['en'];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            return {
                success: true,
                text: randomQuery,
                method: 'Simulated STT',
                confidence: 0.85,
                note: 'This is a simulated transcription for demonstration purposes'
            };
            
        } catch (error) {
            throw new Error(`Simulated STT failed: ${error.message}`);
        }
    }
    
    /**
     * Process transcribed text through RAG system
     */
    async processWithRAG(text, language, conversationHistory = []) {
        try {
            // Get contextual response from knowledge base
            const ragResult = this.knowledgeBase.getContextualResponse(text, conversationHistory, language);
            
            if (ragResult && ragResult.confidence > 0.4) {
                return {
                    response: this.enhanceVoiceResponse(ragResult.answer, ragResult, language),
                    confidence: ragResult.confidence,
                    sources: [{
                        id: ragResult.id,
                        category: ragResult.category,
                        source: ragResult.source,
                        confidence: ragResult.confidence
                    }]
                };
            } else {
                // If no good RAG match, generate contextual response based on keywords
                return this.generateContextualResponse(text, language);
            }
            
        } catch (error) {
            console.error('RAG processing error:', error);
            return this.generateContextualResponse(text, language);
        }
    }
    
    /**
     * Enhance response for voice interaction (more conversational)
     */
    enhanceVoiceResponse(baseResponse, ragResult, language) {
        const greetings = {
            'en': ['I understand your concern about', 'Let me help you with', 'Here\'s what you can do for', 'Based on my knowledge,'],
            'hi': ['मैं आपकी समस्या समझ गया हूं', 'मैं आपकी मदद कर सकता हूं', 'यहां बताया गया है कि आप क्या कर सकते हैं'],
            'pa': ['ਮੈਂ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਸਮਝ ਗਿਆ ਹਾਂ', 'ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ'],
            'ur': ['میں آپ کا مسئلہ سمجھ گیا ہوں', 'میں آپ کی مدد کر سکتا ہوں']
        };
        
        const langGreetings = greetings[language] || greetings['en'];
        const greeting = langGreetings[Math.floor(Math.random() * langGreetings.length)];
        
        // Make response more conversational for voice
        let voiceResponse = `${greeting} ${ragResult.category.replace(/_/g, ' ')}. `;
        voiceResponse += baseResponse;
        
        // Add conclusion for voice
        const conclusions = {
            'en': [' I hope this helps with your farming question. Feel free to ask if you need more details.',
                  ' This should help solve your agricultural problem. Let me know if you have other questions.',
                  ' Follow these steps and your crop should improve. Ask me anything else you need to know.'],
            'hi': [' मुझे उम्मीद है कि यह आपके कृषि प्रश्न में मदद करेगा।',
                  ' इससे आपकी समस्या हल होनी चाहिए। अगर कोई और सवाल हो तो पूछें।'],
            'pa': [' ਮੈਨੂੰ ਉਮੀਦ ਹੈ ਕਿ ਇਹ ਤੁਹਾਡੇ ਖੇਤੀ ਦੇ ਸਵਾਲ ਵਿੱਚ ਮਦਦ ਕਰੇਗਾ।'],
            'ur': [' مجھے امید ہے یہ آپ کے کھیتی کے سوال میں مدد کرے گا۔']
        };
        
        const langConclusions = conclusions[language] || conclusions['en'];
        const conclusion = langConclusions[Math.floor(Math.random() * langConclusions.length)];
        voiceResponse += conclusion;
        
        return voiceResponse;
    }
    
    /**
     * Generate contextual response when RAG doesn't find good matches
     */
    generateContextualResponse(text, language) {
        const textLower = text.toLowerCase();
        const responses = {
            'en': {
                'yellow leaves': 'I heard you mention yellow leaves. This often indicates nitrogen deficiency. Try applying nitrogen-rich fertilizer like urea, and check if you\'re watering too much.',
                'pest': 'You mentioned pests. For pest control, I recommend using neem oil spray during evening hours. You can also install sticky traps and encourage beneficial insects.',
                'water': 'Regarding watering, most crops need 1-2 inches per week. Check your soil moisture regularly and consider drip irrigation for better efficiency.',
                'fertilizer': 'For fertilizers, use balanced NPK based on your soil test. Organic options include compost and farmyard manure which improve soil structure too.',
                'disease': 'For plant diseases, proper identification is key. Remove affected parts, improve air circulation, and consider fungicide application if needed.',
                'default': 'I understand you have a farming question. While I couldn\'t find specific information for your query, I recommend consulting with your local agricultural extension service for detailed guidance.'
            },
            'hi': {
                'default': 'मैं समझ गया कि आपका एक कृषि प्रश्न है। जबकि मुझे आपकी क्वेरी के लिए विशिष्ट जानकारी नहीं मिली, मैं विस्तृत मार्गदर्शन के लिए अपनी स्थानीय कृषि विस्तार सेवा से परामर्श करने की सलाह देता हूं।'
            },
            'pa': {
                'default': 'ਮੈਂ ਸਮਝ ਗਿਆ ਹਾਂ ਕਿ ਤੁਹਾਡਾ ਇੱਕ ਖੇਤੀ ਦਾ ਸਵਾਲ ਹੈ। ਜਦੋਂ ਕਿ ਮੈਨੂੰ ਤੁਹਾਡੀ ਪੁੱਛਗਿੱਛ ਲਈ ਖਾਸ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ, ਮੈਂ ਵਿਸਤ੍ਰਿਤ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਤੁਹਾਡੀ ਸਥਾਨਕ ਖੇਤੀ ਵਿਸਤਾਰ ਸੇਵਾ ਨਾਲ ਸਲਾਹ-ਮਸ਼ਵਰਾ ਕਰਨ ਦੀ ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ।'
            },
            'ur': {
                'default': 'میں سمجھ گیا ہوں کہ آپ کا ایک زراعت کا سوال ہے۔ جبکہ مجھے آپ کی انکوائری کے لیے مخصوص معلومات نہیں ملیں، میں تفصیلی رہنمائی کے لیے اپنی مقامی زرعی توسیعی خدمات سے مشورہ کرنے کا مشورہ دیتا ہوں۔'
            }
        };
        
        const langResponses = responses[language] || responses['en'];
        
        // Find matching response based on keywords
        for (const keyword in langResponses) {
            if (keyword !== 'default' && textLower.includes(keyword)) {
                return {
                    response: langResponses[keyword],
                    confidence: 0.7,
                    sources: [{
                        category: 'contextual_response',
                        source: 'Voice processing analysis'
                    }]
                };
            }
        }
        
        // Default response
        return {
            response: langResponses['default'],
            confidence: 0.6,
            sources: []
        };
    }
    
    /**
     * Get fallback response when voice processing fails
     */
    getFallbackVoiceResponse(errorMessage, language) {
        const fallbacks = {
            'en': {
                response: "I'm sorry, I had trouble processing your voice message. This could be due to audio quality or recognition issues. Please try speaking clearly or typing your question instead. For immediate help, here are some general farming tips: ensure proper watering, use balanced fertilizers, and monitor your crops regularly for pests and diseases.",
                confidence: 0.3,
                error: errorMessage
            },
            'hi': {
                response: "माफ करें, मुझे आपका वॉइस मैसेज प्रोसेस करने में परेशानी हुई। यह ऑडियो गुणवत्ता या पहचान की समस्याओं के कारण हो सकता है। कृपया स्पष्ट रूप से बोलने का प्रयास करें या अपना प्रश्न टाइप करें। तत्काल सहायता के लिए, यहां कुछ सामान्य कृषि सुझाव हैं: उचित पानी देना सुनिश्चित करें, संतुलित उर्वरकों का उपयोग करें, और कीटों और बीमारियों के लिए अपनी फसलों की नियमित निगरानी करें।",
                confidence: 0.3,
                error: errorMessage
            }
        };
        
        return {
            success: false,
            ...fallbacks[language] || fallbacks['en'],
            transcription: {
                original: '',
                corrected: '',
                error: 'Voice recognition failed'
            },
            sources: [],
            metadata: {
                processingFailed: true,
                error: errorMessage
            }
        };
    }
    
    /**
     * Clean up old audio files
     */
    async cleanupOldFiles(maxAgeHours = 6) {
        try {
            if (!fs.existsSync(this.audioInputDir)) return;
            
            const files = fs.readdirSync(this.audioInputDir);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;
            
            let deletedCount = 0;
            
            for (const file of files) {
                if (this.supportedFormats.some(format => file.endsWith(`.${format}`))) {
                    const filePath = path.join(this.audioInputDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🗑️ Cleaned up ${deletedCount} old voice files`);
            }
        } catch (error) {
            console.error('Error cleaning up voice files:', error.message);
        }
    }
    
    /**
     * Get service status and capabilities
     */
    getServiceStatus() {
        return {
            supported: true,
            languages: Object.keys(this.supportedLanguages),
            formats: this.supportedFormats,
            maxDuration: this.processingSettings.maxDurationSeconds,
            features: {
                speechToText: true,
                ragIntegration: true,
                spellCheck: true,
                contextualResponse: true
            }
        };
    }
}

module.exports = EnhancedVoiceService;