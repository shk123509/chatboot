const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ChatConversation = require('../models/ChatConversation');
const fetchuser = require('../middleware/fetchuser');

// Import enhanced services
const EnhancedImageAnalysis = require('../utils/enhancedImageAnalysis');
const TextToSpeechService = require('../utils/textToSpeechService');
const EnhancedVoiceService = require('../utils/enhancedVoiceService');
const EnhancedKnowledgeBase = require('../utils/enhancedKnowledgeBase');
const EnhancedResponseGenerator = require('../utils/enhancedResponseGenerator');
const { checkSpelling } = require('../utils/spellChecker');

// Initialize services with error handling
let imageAnalysis, ttsService, voiceService, knowledgeBase, responseGenerator;

try {
    imageAnalysis = new EnhancedImageAnalysis();
    ttsService = new TextToSpeechService();
    voiceService = new EnhancedVoiceService();
    knowledgeBase = new EnhancedKnowledgeBase();
    responseGenerator = new EnhancedResponseGenerator();
    console.log('✅ All enhanced services initialized successfully');
} catch (error) {
    console.error('❌ Error initializing enhanced services:', error.message);
    console.log('🔄 Attempting to continue with available services...');
    
    // Initialize what we can
    try {
        responseGenerator = new EnhancedResponseGenerator();
        console.log('✅ Enhanced Response Generator initialized as fallback');
    } catch (e) {
        console.error('❌ Critical: Enhanced Response Generator failed to initialize:', e.message);
    }
}

// Simple in-memory storage for fallback - replace with MongoDB later
let conversations = [];
let messages = [];

/**
 * Advanced Farmer Chatbot API with LLM/ML Pipeline
 * Features: Chat History, Image Recognition, Voice Support, RAG Integration
 */

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'images');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `crop-image-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Configure multer for audio uploads
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'audio');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `voice-message-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Image upload configuration
const uploadImage = multer({ 
    storage: imageStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Audio upload configuration
const uploadAudio = multer({ 
    storage: audioStorage,
    fileFilter: function (req, file, cb) {
        const allowedAudioTypes = [
            'audio/wav', 'audio/wave', 'audio/x-wav',
            'audio/mp3', 'audio/mpeg', 'audio/mp4',
            'audio/ogg', 'audio/webm', 'audio/x-m4a',
            'video/webm' // for webm audio recorded from browser
        ];
        
        if (allowedAudioTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit for audio
    }
});

// Utility function to run Python scripts
const runPythonScript = (scriptPath, args = [], input = null) => {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [scriptPath, ...args], {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
                PYTHONPATH: process.env.PYTHONPATH
            },
            encoding: 'utf8'
        });
        let stdout = '';
        let stderr = '';

        if (input) {
            python.stdin.write(input);
            python.stdin.end();
        }

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(stdout.trim());
                    resolve(result);
                } catch (e) {
                    resolve({ output: stdout.trim(), raw: true });
                }
            } else {
                reject(new Error(`Python script failed: ${stderr}`));
            }
        });
    });
};

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to advanced chatbot with RAG integration
 * @access  Private
 */
router.post('/message', fetchuser, async (req, res) => {
    try {
        const { message, conversationId, language = 'en' } = req.body;
        const userId = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log(`🤖 Processing message from user ${userId}: ${message}`);

        // Create or get conversation
        let conversation;
        if (conversationId) {
            conversation = await ChatConversation.findById(conversationId);
            if (!conversation || conversation.userId.toString() !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
        } else {
            conversation = new ChatConversation({
                userId: userId,
                title: message.length > 50 ? message.substring(0, 50) + '...' : message,
                language: language,
                messages: []
            });
        }

        // Add user message to conversation
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
            type: 'text'
        };
        conversation.messages.push(userMessage);

        // Apply spell check to user message
        const spellCheckResult = checkSpelling(message, language);
        const correctedMessage = spellCheckResult.correctedMessage;
        
        // Get RAG response using enhanced knowledge base
        const ragResponse = await getEnhancedRAGResponse(correctedMessage, language, conversation.messages);
        
        // Generate audio response if requested or for voice queries
        let audioResponse = null;
        try {
            const audioResult = await ttsService.convertToSpeech(ragResponse.response, language);
            if (audioResult.success) {
                audioResponse = {
                    audioUrl: audioResult.audioUrl,
                    duration: audioResult.duration,
                    cached: audioResult.cached
                };
            }
        } catch (audioError) {
            console.warn('TTS generation failed, continuing without audio:', audioError.message);
        }

        // Add bot response to conversation
        const botMessage = {
            role: 'assistant',
            content: ragResponse.response,
            timestamp: new Date(),
            type: 'text',
            confidence: ragResponse.confidence || 0.8,
            sources: ragResponse.sources || [],
            audioResponse: audioResponse,
            metadata: {
                ragUsed: true,
                enhanced: true,
                spellCheck: spellCheckResult,
                audioGenerated: audioResponse !== null
            }
        };
        conversation.messages.push(botMessage);

        // Update conversation metadata
        conversation.lastMessage = ragResponse.response;
        conversation.updatedAt = new Date();

        await conversation.save();

        res.json({
            success: true,
            data: {
                conversationId: conversation._id,
                response: ragResponse.response,
                confidence: ragResponse.confidence,
                sources: ragResponse.sources,
                messageId: botMessage._id,
                timestamp: botMessage.timestamp,
                spellCheck: spellCheckResult,
                audioResponse: audioResponse,
                metadata: botMessage.metadata
            }
        });

    } catch (error) {
        console.error('❌ Error in chatbot message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

/**
 * @route   POST /api/chatbot/image
 * @desc    Analyze crop image and provide diagnosis
 * @access  Private
 */
router.post('/image', fetchuser, uploadImage.single('image'), async (req, res) => {
    try {
        const { conversationId, question, language = 'en' } = req.body;
        const userId = req.user.id;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                success: false,
                error: 'Image file is required'
            });
        }

        console.log(`📷 Processing image analysis for user ${userId}`);

        // Create or get conversation
        let conversation;
        if (conversationId) {
            conversation = await ChatConversation.findById(conversationId);
            if (!conversation || conversation.userId.toString() !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
        } else {
            conversation = new ChatConversation({
                userId: userId,
                title: '📷 Image Analysis - ' + (question || 'Crop Problem'),
                language: language,
                messages: []
            });
        }

        // Add user message with image
        const userMessage = {
            role: 'user',
            content: question || 'Please analyze this crop image',
            timestamp: new Date(),
            type: 'image',
            imageUrl: `/uploads/images/${imageFile.filename}`,
            imagePath: imageFile.path
        };
        conversation.messages.push(userMessage);

        // Apply spell check to user question
        const spellCheckResult = checkSpelling(question || 'Analyze this image', language);
        const correctedQuestion = spellCheckResult.correctedMessage;
        
        // Analyze image using enhanced image analysis with RAG integration
        const imageAnalysisResult = await imageAnalysis.analyzeImage(imageFile.path, correctedQuestion, language);
        
        // Generate audio response for image analysis
        let audioResponse = null;
        try {
            const audioResult = await ttsService.convertToSpeech(imageAnalysisResult.response, language);
            if (audioResult.success) {
                audioResponse = {
                    audioUrl: audioResult.audioUrl,
                    duration: audioResult.duration,
                    cached: audioResult.cached
                };
            }
        } catch (audioError) {
            console.warn('TTS generation for image analysis failed:', audioError.message);
        }

        // Add bot response to conversation
        const botMessage = {
            role: 'assistant',
            content: imageAnalysisResult.response,
            timestamp: new Date(),
            type: 'image_analysis',
            confidence: imageAnalysisResult.confidence,
            sources: imageAnalysisResult.sources || [],
            audioResponse: audioResponse,
            metadata: {
                imageAnalysis: {
                    category: imageAnalysisResult.category,
                    detectedProblems: imageAnalysisResult.detectedProblems,
                    recommendations: imageAnalysisResult.recommendations,
                    visualResponse: imageAnalysisResult.visualResponse
                },
                ragUsed: true,
                spellCheck: spellCheckResult,
                audioGenerated: audioResponse !== null
            }
        };
        conversation.messages.push(botMessage);

        // Update conversation with proper response truncation
        const truncatedResponse = imageAnalysisResult.response.length > 2000 
            ? imageAnalysisResult.response.substring(0, 1997) + '...' 
            : imageAnalysisResult.response;
        conversation.lastMessage = truncatedResponse;
        conversation.updatedAt = new Date();
        
        // Save with error handling
        try {
            await conversation.save();
            console.log('✅ Image analysis conversation saved successfully');
        } catch (saveError) {
            console.warn('⚠️ Failed to save image conversation, continuing with response:', saveError.message);
        }

        res.json({
            success: true,
            data: {
                conversationId: conversation._id,
                response: imageAnalysisResult.response,
                confidence: imageAnalysisResult.confidence,
                imageAnalysis: {
                    category: imageAnalysisResult.category,
                    detectedProblems: imageAnalysisResult.detectedProblems,
                    recommendations: imageAnalysisResult.recommendations,
                    visualResponse: imageAnalysisResult.visualResponse
                },
                sources: imageAnalysisResult.sources,
                messageId: botMessage._id,
                timestamp: botMessage.timestamp,
                spellCheck: spellCheckResult,
                audioResponse: audioResponse
            }
        });

    } catch (error) {
        console.error('❌ Error in image analysis:', error);
        
        // Provide helpful error message based on error type
        let errorMessage = 'Failed to analyze image';
        let statusCode = 500;
        
        if (error.message.includes('validation failed')) {
            errorMessage = 'Database validation error - response too long or invalid format';
            statusCode = 400;
        } else if (error.message.includes('Image file')) {
            errorMessage = 'Image file processing failed - check format and size';
            statusCode = 400;
        } else if (error.message.includes('Canvas')) {
            errorMessage = 'Image processing library unavailable - using text-based analysis';
            statusCode = 422;
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            fallbackSuggestion: 'Try uploading a clear JPEG or PNG image under 10MB with a specific question'
        });
    }
});

/**
 * @route   POST /api/chatbot/voice
 * @desc    Process voice message and return voice response
 * @access  Private
 */
router.post('/voice', fetchuser, uploadAudio.single('audio'), async (req, res) => {
    try {
        const { conversationId, language = 'en' } = req.body;
        const userId = req.user.id;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({
                success: false,
                error: 'Audio file is required'
            });
        }

        console.log(`🎤 Processing voice message for user ${userId}`);

        // Create or get conversation for context
        let conversation;
        if (conversationId) {
            conversation = await ChatConversation.findById(conversationId);
            if (!conversation || conversation.userId.toString() !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }
        } else {
            conversation = new ChatConversation({
                userId: userId,
                title: '🎤 Voice Message',
                language: language,
                messages: []
            });
        }

        // Process voice message using enhanced service
        const voiceProcessingResult = await voiceService.processVoiceMessage(
            audioFile.path, 
            language, 
            conversation.messages
        );
        
        if (!voiceProcessingResult.success) {
            return res.status(400).json({
                success: false,
                error: voiceProcessingResult.error || 'Voice processing failed',
                fallbackResponse: voiceProcessingResult.response
            });
        }

        const transcribedText = voiceProcessingResult.transcription.corrected;
        const voiceResponse = voiceProcessingResult.response;

        // Convert response to speech for audio playback
        let audioResponse = null;
        try {
            const audioResult = await ttsService.convertToSpeech(voiceResponse, language);
            if (audioResult.success) {
                audioResponse = {
                    audioUrl: audioResult.audioUrl,
                    duration: audioResult.duration,
                    cached: audioResult.cached
                };
            }
        } catch (audioError) {
            console.warn('TTS generation for voice response failed:', audioError.message);
        }

        // Add user message with voice metadata
        const userMessage = {
            role: 'user',
            content: transcribedText,
            timestamp: new Date(),
            type: 'voice',
            audioUrl: `/uploads/audio/${audioFile.filename}`,
            transcription: transcribedText // Store corrected text as string for MongoDB
        };
        conversation.messages.push(userMessage);

        // Add bot response with voice metadata
        const botMessage = {
            role: 'assistant',
            content: voiceResponse,
            timestamp: new Date(),
            type: 'voice_response',
            confidence: voiceProcessingResult.confidence,
            sources: voiceProcessingResult.sources,
            audioResponse: audioResponse,
            metadata: {
                ragUsed: true,
                voiceProcessing: voiceProcessingResult.metadata,
                audioGenerated: audioResponse !== null
            }
        };
        conversation.messages.push(botMessage);

        // Update conversation metadata with length checking
        const truncatedResponse = voiceResponse.length > 2000 
            ? voiceResponse.substring(0, 1997) + '...' 
            : voiceResponse;
        conversation.lastMessage = truncatedResponse;
        conversation.updatedAt = new Date();
        
        // Save with error handling for database validation
        try {
            await conversation.save();
            console.log('✅ Voice conversation saved successfully');
        } catch (saveError) {
            console.warn('⚠️ Failed to save conversation, continuing with response:', saveError.message);
            // Continue processing even if save fails - user still gets response
        }

        res.json({
            success: true,
            data: {
                conversationId: conversation._id,
                transcription: {
                    original: voiceProcessingResult.transcription.original,
                    corrected: voiceProcessingResult.transcription.corrected,
                    spellCheck: voiceProcessingResult.transcription.spellCheck
                },
                response: voiceResponse,
                audioResponse: audioResponse,
                confidence: voiceProcessingResult.confidence,
                sources: voiceProcessingResult.sources,
                messageId: botMessage._id,
                timestamp: botMessage.timestamp,
                metadata: voiceProcessingResult.metadata
            }
        });

    } catch (error) {
        console.error('❌ Error in voice processing:', error);
        
        // Provide helpful error message based on error type
        let errorMessage = 'Failed to process voice message';
        let statusCode = 500;
        
        if (error.message.includes('validation failed')) {
            errorMessage = 'Database validation error - message too long or invalid format';
            statusCode = 400;
        } else if (error.message.includes('Audio file')) {
            errorMessage = 'Audio file processing failed - check format and size';
            statusCode = 400;
        } else if (error.message.includes('Speech recognition')) {
            errorMessage = 'Speech recognition failed - try speaking more clearly';
            statusCode = 422;
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            fallbackSuggestion: 'Try uploading a clear WAV or MP3 audio file under 25MB'
        });
    }
});

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get user's chat conversations
 * @access  Private
 */
router.get('/conversations', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const conversations = await ChatConversation.find({ userId })
            .select('title lastMessage updatedAt language messagesCount')
            .sort({ updatedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ChatConversation.countDocuments({ userId });

        res.json({
            success: true,
            data: {
                conversations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('❌ Error getting conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        });
    }
});

/**
 * @route   GET /api/chatbot/conversation/:id
 * @desc    Get specific conversation with messages
 * @access  Private
 */
router.get('/conversation/:id', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        const conversation = await ChatConversation.findOne({
            _id: conversationId,
            userId: userId
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            data: conversation
        });

    } catch (error) {
        console.error('❌ Error getting conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation'
        });
    }
});

/**
 * @route   DELETE /api/chatbot/conversation/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversation/:id', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        const conversation = await ChatConversation.findOneAndDelete({
            _id: conversationId,
            userId: userId
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        res.json({
            success: true,
            message: 'Conversation deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete conversation'
        });
    }
});

// Enhanced Helper Functions

async function getEnhancedRAGResponse(message, language = 'en', conversationHistory = []) {
    try {
        console.log(`🧠 Processing enhanced RAG response for: ${message}`);
        
        // Safety check: ensure responseGenerator is available
        if (!responseGenerator) {
            console.error('❌ Enhanced Response Generator not available, falling back to basic response');
            return generateBasicResponse(message, language);
        }
        
        // First, try to get contextual response from knowledge base
        let ragResult = null;
        if (knowledgeBase && typeof knowledgeBase.getContextualResponse === 'function') {
            try {
                ragResult = knowledgeBase.getContextualResponse(message, conversationHistory, language);
            } catch (kbError) {
                console.warn('⚠️ Knowledge base error, continuing with enhanced response:', kbError.message);
            }
        } else {
            console.log('📝 Knowledge base not available, generating enhanced response without RAG data');
        }
        
        // Use enhanced response generator for comprehensive farming advice
        let ragResults = [];
        if (ragResult && ragResult.confidence > 0.3) {
            ragResults = [{
                similarity_score: ragResult.confidence,
                category: ragResult.category,
                crop: 'general',
                problem: message,
                solution: ragResult.answer,
                original_id: ragResult.id
            }];
        }
        
        // Generate comprehensive detailed response (2000+ words)
        const enhancedResponse = responseGenerator.generateDetailedResponse(
            message, 
            ragResults, 
            language
        );
        
        console.log(`✅ Generated enhanced response: ${enhancedResponse.wordCount} words`);
        
        return {
            response: enhancedResponse.content,
            confidence: enhancedResponse.confidence,
            wordCount: enhancedResponse.wordCount,
            sources: [{
                id: enhancedResponse.timestamp,
                category: 'comprehensive_farming_guide',
                source: 'Enhanced Agricultural Knowledge Base',
                confidence: enhancedResponse.confidence,
                wordCount: enhancedResponse.wordCount
            }]
        };
        
    } catch (error) {
        console.error('❌ Error getting enhanced RAG response:', error);
        // Fallback to enhanced response even without RAG data
        try {
            const fallbackResponse = responseGenerator.generateDetailedResponse(
                message, 
                [], // Empty RAG results
                language
            );
            
            return {
                response: fallbackResponse.content,
                confidence: 0.7,
                wordCount: fallbackResponse.wordCount,
                sources: [{
                    category: 'comprehensive_farming_guide',
                    source: 'Enhanced Agricultural Knowledge Base (Fallback)',
                    confidence: 0.7
                }]
            };
        } catch (fallbackError) {
            console.error('❌ Fallback response generation failed:', fallbackError);
            return generateDirectEnhancedResponse(message, language);
        }
    }
}

function generateDirectEnhancedResponse(message, language = 'en') {
    try {
        const enhanced = responseGenerator.generateDetailedResponse(message, [], language);
        return {
            response: enhanced.content,
            confidence: enhanced.confidence || 0.7,
            wordCount: enhanced.wordCount || enhanced.content.split(' ').length,
            sources: [{ category: 'comprehensive_farming_guide', source: 'Enhanced Agricultural Knowledge Base (Direct)' }]
        };
    } catch (e) {
        console.error('❌ Direct enhanced generation failed, falling back to basic:', e.message);
        return generateBasicResponse(message, language);
    }
}

function generateBasicResponse(message, language = 'en') {
    const messageLower = message.toLowerCase();
    
    // Basic farming responses for common keywords
    const responses = {
        'en': {
            'yellow leaves': 'Yellow leaves often indicate nitrogen deficiency or overwatering. Apply nitrogen-rich fertilizer and check soil drainage.',
            'brown spots': 'Brown spots on leaves usually indicate fungal diseases. Apply fungicide and improve air circulation.',
            'pest': 'For pest control, use integrated pest management. Try neem oil spray and beneficial insects.',
            'water': 'Most crops need 1-2 inches of water per week. Check soil moisture regularly and consider drip irrigation.',
            'fertilizer': 'Use balanced NPK fertilizer based on soil test results. Organic options include compost and manure.',
            'default': 'Thank you for your farming question. I recommend consulting with local agricultural extension services for specific guidance.'
        },
        'hi': {
            'default': 'आपके कृषि प्रश्न के लिए धन्यवाद। विशिष्ट मार्गदर्शन के लिए स्थानीय कृषि विस्तार सेवाओं से सलाह लें।'
        }
    };
    
    const langResponses = responses[language] || responses['en'];
    
    // Find matching response
    for (const keyword in langResponses) {
        if (keyword !== 'default' && messageLower.includes(keyword)) {
            return {
                response: langResponses[keyword],
                confidence: 0.7,
                sources: [{ category: 'basic_knowledge', source: 'Built-in responses' }]
            };
        }
    }
    
    // Default response
    return {
        response: langResponses['default'],
        confidence: 0.5,
        sources: []
    };
}

// Cleanup function for old files
async function cleanupServices() {
    try {
        // Cleanup old audio files
        await ttsService.cleanupOldFiles(24); // 24 hours
        await voiceService.cleanupOldFiles(6); // 6 hours
        
        console.log('🧹 Service cleanup completed');
    } catch (error) {
        console.error('Error during service cleanup:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupServices, 60 * 60 * 1000);

/**
 * @route   POST /api/chatbot/tts
 * @desc    Generate audio from text
 * @access  Private
 */
router.post('/tts', fetchuser, async (req, res) => {
    try {
        const { text, language = 'en', voiceId = null } = req.body;
        const userId = req.user.id;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Text is required for TTS'
            });
        }

        console.log(`🔊 Generating TTS for user ${userId}`);

        // Generate audio using TTS service
        const audioResult = await ttsService.convertToSpeech(text, language, voiceId);

        if (audioResult.success) {
            res.json({
                success: true,
                data: {
                    audioUrl: audioResult.audioUrl,
                    duration: audioResult.duration,
                    cached: audioResult.cached,
                    metadata: audioResult.metadata
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: audioResult.error || 'TTS generation failed',
                fallback: audioResult.fallback
            });
        }

    } catch (error) {
        console.error('❌ Error generating TTS:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate audio'
        });
    }
});

/**
 * @route   GET /api/chatbot/capabilities
 * @desc    Get chatbot capabilities and service status
 * @access  Public
 */
router.get('/capabilities', (req, res) => {
    try {
        const capabilities = {
            features: {
                textChat: true,
                imageAnalysis: true,
                voiceProcessing: true,
                textToSpeech: true,
                spellCheck: true,
                ragIntegration: true,
                conversationHistory: true
            },
            supportedLanguages: ['en', 'hi', 'pa', 'ur'],
            imageFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
            audioFormats: ['wav', 'mp3', 'ogg', 'webm', 'm4a'],
            services: {
                knowledgeBase: knowledgeBase.isHealthy(),
                tts: ttsService.getSupportedLanguages(),
                voiceProcessing: voiceService.getServiceStatus()
            },
            limits: {
                maxImageSize: '10MB',
                maxAudioDuration: '2 minutes',
                maxTextLength: '1500 characters'
            }
        };

        res.json({
            success: true,
            data: capabilities
        });
        
    } catch (error) {
        console.error('❌ Error getting capabilities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get capabilities'
        });
    }
});

module.exports = router;
