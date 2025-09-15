const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SpellChecker = require('../utils/spellChecker');
const EnhancedKnowledgeBase = require('../utils/enhancedKnowledgeBase');
const ChatConversation = require('../models/ChatConversation');

// Initialize Gemini AI with environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let apiKeyValid = false;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
    console.error('❌ GEMINI_API_KEY is not set in environment variables!');
    console.log('Please add a valid GEMINI_API_KEY to your .env file');
    console.log('Get your API key from: https://makersuite.google.com/app/apikey');
    apiKeyValid = false;
} else {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        apiKeyValid = true;
        console.log('🔑 Gemini API Key loaded: ✅ Available');
    } catch (error) {
        console.error('❌ Error initializing Gemini AI:', error.message);
        apiKeyValid = false;
    }
}

// Initialize spell checker
const spellChecker = new SpellChecker();
console.log('📝 Spell checker initialized');

// Initialize enhanced knowledge base
const knowledgeBase = new EnhancedKnowledgeBase();
const kbStats = knowledgeBase.getCategoryStats();
console.log('📚 Enhanced Knowledge Base initialized with categories:', kbStats);

// Fallback responses for when API is not available
const fallbackResponses = {
    greeting: "Hello! I'm your Agricultural AI Assistant. I can help with farming questions, but I'm currently running in limited mode due to API configuration issues. Please ask me about crops, farming practices, or agricultural problems!",
    general: "I'd be happy to help with your agricultural question! However, I'm currently experiencing some technical difficulties with my AI services. Please try asking about specific farming topics like crop diseases, fertilizers, irrigation, or pest management.",
    technical: "I'm experiencing technical difficulties at the moment. Please check that the Gemini API key is properly configured and try again. You can still ask basic farming questions!",
    apology: "I apologize for any inconvenience. While I work to resolve technical issues, feel free to ask about farming best practices, crop management, or agricultural techniques."
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// In-memory storage for conversations
const conversations = new Map();

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to chatbot
 * @access  Public (for testing)
 */
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId, language = 'en' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log('📨 Processing message:', message);

        // Apply spell checking to user message
        const spellCheckResult = spellChecker.checkAndCorrect(message);
        const processedMessage = spellCheckResult.corrected;
        
        if (spellCheckResult.hasCorrections) {
            console.log('📝 Spell corrections applied:', spellCheckResult.corrections);
        }

        // Get or create conversation
        let conversation;
        if (conversationId && conversations.has(conversationId)) {
            conversation = conversations.get(conversationId);
        } else {
            const newConvId = Date.now().toString();
            conversation = {
                id: newConvId,
                messages: [],
                createdAt: new Date()
            };
            conversations.set(newConvId, conversation);
        }

        // Add user message (use original message for storage)
        conversation.messages.push({
            role: 'user',
            content: message,
            corrected: spellCheckResult.hasCorrections ? processedMessage : undefined,
            timestamp: new Date()
        });

        // Try RAG system first, then fallback to Gemini or basic responses
        let response = '';
        let confidence = 0.8;
        let sources = [];
        let correctionInfo = null;
        
        // Add correction info if any corrections were made
        if (spellCheckResult.hasCorrections) {
            correctionInfo = {
                hasCorrections: true,
                corrections: spellCheckResult.corrections,
                original: message,
                corrected: processedMessage
            };
        }
        
        try {
            // Use RAG system for farmer-specific queries (with corrected message and context)
            const ragResponse = await getRagResponse(processedMessage, language, conversation.messages);
            
            if (ragResponse && ragResponse.confidence > 0.3) {
                response = ragResponse.response;
                confidence = ragResponse.confidence;
                sources = ragResponse.sources || [];
                console.log(`🌾 RAG Response - Confidence: ${confidence.toFixed(2)}`);
                
                // Add spell correction notice if corrections were made
                if (spellCheckResult.hasCorrections) {
                    const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                    const correctionNote = `\n\n---\n📝 **Spell Correction Applied:** ${corrections}\n*I understood your question as:* "${processedMessage}"\n---`;
                    response = response + correctionNote;
                }
            } else if (apiKeyValid && genAI) {
                // Fallback to Gemini AI
                console.log('🤖 Using Gemini AI fallback');
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                
                const context = conversation.messages.slice(-10).map(m => 
                    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
                ).join('\n');
                
                const prompt = `You are an agricultural expert assistant helping farmers with their queries. 
                Previous conversation:
                ${context}
                
                Current question: ${processedMessage}
                
                Please provide a helpful, accurate response focusing on agricultural topics, farming practices, crop management, and related areas.
                
                If the question is not related to agriculture, politely redirect the conversation to farming topics.`;
                
                const result = await model.generateContent(prompt);
                response = result.response.text();
                confidence = 0.7;
                
                // Add spell correction notice if corrections were made
                if (spellCheckResult.hasCorrections) {
                    const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                    const correctionNote = `\n\n---\n📝 **Spell Correction Applied:** ${corrections}\n*I understood your question as:* "${processedMessage}"\n---`;
                    response = response + correctionNote;
                }
            } else {
                // Use fallback responses when no AI service is available
                console.log('📝 Using fallback responses');
                response = getFallbackResponse(processedMessage);
                confidence = 0.5;
                
                // Add spell correction notice if corrections were made
                if (spellCheckResult.hasCorrections) {
                    const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                    const correctionNote = `\n\n---\n📝 **Spell Correction Applied:** ${corrections}\n*I understood your question as:* "${processedMessage}"\n---`;
                    response = response + correctionNote;
                }
            }
        } catch (error) {
            console.error('🚫 Error in AI response:', error);
            
            // Provide more specific error handling
            if (error.message && error.message.includes('API key not valid')) {
                response = fallbackResponses.technical + '\n\nError: Invalid API key. Please check your Gemini API configuration.';
            } else if (error.message && error.message.includes('quota')) {
                response = 'I\'m currently experiencing high usage. Please try again in a moment, or consider upgrading your API plan.';
            } else {
                response = getFallbackResponse(processedMessage) + '\n\n(Note: AI services are currently unavailable)';
            }
            confidence = 0.2;
        }

        // Add bot response
        conversation.messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        res.json({
            success: true,
            data: {
                conversationId: conversation.id,
                response: response,
                confidence: confidence,
                sources: sources,
                spellCheck: correctionInfo,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error in chatbot message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message',
            details: error.message
        });
    }
});

/**
 * @route   POST /api/chatbot/image
 * @desc    Analyze uploaded image
 * @access  Public (for testing)
 */
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        const { question = 'What can you tell me about this crop image?', conversationId, language = 'en' } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                success: false,
                error: 'Image file is required'
            });
        }

        console.log('📷 Processing image:', imageFile.filename);

        // Get or create conversation
        let conversation;
        if (conversationId && conversations.has(conversationId)) {
            conversation = conversations.get(conversationId);
        } else {
            const newConvId = Date.now().toString();
            conversation = {
                id: newConvId,
                messages: [],
                createdAt: new Date()
            };
            conversations.set(newConvId, conversation);
        }

        // Apply spell checking to the question
        const spellCheckResult = spellChecker.checkAndCorrect(question);
        const processedQuestion = spellCheckResult.corrected;
        
        console.log(`📷 Analyzing image with enhanced RAG system`);
        
        let analysisResponse = '';
        let confidence = 0.8;
        let imageAnalysis = {};
        let sources = [];
        
        // Simulate image analysis with agricultural knowledge
        const simulatedImageAnalysis = {
            cropType: 'Unknown crop',
            healthStatus: 'Analyzing...',
            issues: [],
            recommendations: []
        };
        
        // Create context-aware question combining image analysis with user question
        const contextualQuestion = `Image Analysis: Looking at uploaded crop/plant image. User asks: "${processedQuestion}". Please provide detailed agricultural advice for this crop image focusing on identification, health assessment, diseases, pests, and treatment recommendations.`;
        
        try {
            // Use RAG system for image-based queries
            const ragResponse = await getRagResponse(contextualQuestion, language, conversation.messages);
            
            if (ragResponse && ragResponse.confidence > 0.4) {
                // Enhance RAG response with image context
                analysisResponse = `📷 **Image Analysis Results:**\n\n` + ragResponse.response;
                confidence = ragResponse.confidence;
                sources = ragResponse.sources || [];
                
                // Add general image analysis guidance
                analysisResponse += `\n\n🔍 **Image Analysis Tips:**\n• For better analysis, ensure good lighting\n• Show affected plant parts clearly\n• Include surrounding area for context\n• Take multiple angles if problem persists`;
                
                console.log(`🎆 RAG Image Response - Confidence: ${confidence.toFixed(2)}`);
            } else if (apiKeyValid && genAI) {
                // Fallback to Gemini Vision if available
                console.log('🤖 Using Gemini Vision for image analysis');
                
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
                    
                    const imageData = fs.readFileSync(imageFile.path);
                    const base64Image = imageData.toString('base64');
                    
                    const prompt = `You are an agricultural expert analyzing a crop/plant image. User question: "${processedQuestion}".
                    
                    Please provide detailed analysis covering:
                    1. Crop/plant identification
                    2. Overall health assessment
                    3. Disease/pest detection
                    4. Nutritional deficiencies
                    5. Environmental stress signs
                    6. Specific treatment recommendations
                    7. Prevention strategies`;
                    
                    const imagePart = {
                        inlineData: {
                            data: base64Image,
                            mimeType: imageFile.mimetype
                        }
                    };
                    
                    const result = await model.generateContent([prompt, imagePart]);
                    analysisResponse = '📷 **AI Image Analysis:**\n\n' + result.response.text();
                    confidence = 0.75;
                } catch (geminiError) {
                    console.error('❌ Gemini Vision failed:', geminiError);
                    throw geminiError;
                }
            } else {
                // Enhanced fallback analysis using knowledge base patterns
                analysisResponse = `📷 **Image Analysis - Agricultural Assessment:**\n\n` + 
                    `**Based on your question: "${processedQuestion}"**\n\n` +
                    getImageAnalysisFallback(processedQuestion);
                confidence = 0.6;
            }
            
            // Add spell correction notice if any
            if (spellCheckResult.hasCorrections) {
                const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                analysisResponse += `\n\n---\n📝 **Image + Spell Correction:** ${corrections}\n---`;
            }
            
        } catch (error) {
            console.error('❌ Error in image analysis:', error);
            
            // Fallback response
            analysisResponse = `📷 **Image Analysis - Basic Assessment:**\n\n` +
                `I can see you've uploaded an image asking: "${processedQuestion}"\n\n` +
                getImageAnalysisFallback(processedQuestion);
            
            if (spellCheckResult.hasCorrections) {
                const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                analysisResponse += `\n\n📝 **Spell Correction:** ${corrections}`;
            }
            
            confidence = 0.4;
        }

        // Add to conversation
        conversation.messages.push({
            role: 'user',
            content: question,
            corrected: spellCheckResult.hasCorrections ? processedQuestion : undefined,
            image: `/uploads/${imageFile.filename}`,
            timestamp: new Date()
        });

        conversation.messages.push({
            role: 'assistant',
            content: analysisResponse,
            timestamp: new Date()
        });

        res.json({
            success: true,
            data: {
                conversationId: conversation.id,
                response: analysisResponse,
                confidence: confidence,
                sources: sources,
                imageAnalysis: simulatedImageAnalysis,
                spellCheck: spellCheckResult.hasCorrections ? {
                    hasCorrections: true,
                    corrections: spellCheckResult.corrections,
                    original: question,
                    corrected: processedQuestion
                } : null,
                imageUrl: `/uploads/${imageFile.filename}`,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error in image analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze image. Please try again with a clear crop image.',
            details: error.message
        });
    }
});

/**
 * @route   POST /api/chatbot/voice
 * @desc    Process voice message
 * @access  Public (for testing)
 */
router.post('/voice', upload.single('audio'), async (req, res) => {
    try {
        const { conversationId, language = 'en' } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({
                success: false,
                error: 'Audio file is required'
            });
        }

        console.log('🎤 Processing voice message:', audioFile.filename);

        // Get or create conversation
        let conversation;
        if (conversationId && conversations.has(conversationId)) {
            conversation = conversations.get(conversationId);
        } else {
            const newConvId = Date.now().toString();
            conversation = {
                id: newConvId,
                messages: [],
                createdAt: new Date()
            };
            conversations.set(newConvId, conversation);
        }

        // Simulate speech-to-text (in production, use Google Speech-to-Text or similar)
        const simulatedTranscriptions = [
            "Why is my crop not growing properly?",
            "How to improve soil quality?",
            "What fertilizer should I use for wheat?",
            "My plants have yellow leaves, what should I do?",
            "How much water do vegetables need?"
        ];
        
        const transcription = simulatedTranscriptions[Math.floor(Math.random() * simulatedTranscriptions.length)];
        console.log('🎤 Simulated transcription:', transcription);

        // Apply spell checking to transcription
        const spellCheckResult = spellChecker.checkAndCorrect(transcription);
        const processedMessage = spellCheckResult.corrected;

        // Add user message to conversation
        conversation.messages.push({
            role: 'user',
            content: transcription,
            audioFile: audioFile.filename,
            corrected: spellCheckResult.hasCorrections ? processedMessage : undefined,
            timestamp: new Date()
        });

        // Get response from RAG system
        let response = '';
        let confidence = 0.8;
        let sources = [];
        
        try {
            // Use RAG system for voice queries
            const ragResponse = await getRagResponse(processedMessage, language, conversation.messages);
            
            if (ragResponse && ragResponse.confidence > 0.3) {
                response = ragResponse.response;
                confidence = ragResponse.confidence;
                sources = ragResponse.sources || [];
                console.log(`🌾 RAG Voice Response - Confidence: ${confidence.toFixed(2)}`);
                
                // Add spell correction notice if corrections were made
                if (spellCheckResult.hasCorrections) {
                    const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                    const correctionNote = `\n\n---\n📝 **Voice + Spell Correction:** ${corrections}\n---`;
                    response = response + correctionNote;
                }
            } else {
                // Fallback response for voice
                response = getFallbackResponse(processedMessage);
                if (spellCheckResult.hasCorrections) {
                    const corrections = spellCheckResult.corrections.map(c => `"${c.original}" → "${c.corrected}"`).join(', ');
                    response += `\n\n---\n📝 **Voice + Spell Correction:** ${corrections}\n---`;
                }
                confidence = 0.6;
            }
        } catch (error) {
            console.error('❌ Error in voice RAG response:', error);
            response = `🎤 I heard: "${transcription}"\n\n` + getFallbackResponse(processedMessage);
            confidence = 0.5;
        }

        // Add bot response to conversation
        conversation.messages.push({
            role: 'assistant',
            content: response,
            confidence: confidence,
            sources: sources,
            timestamp: new Date()
        });

        // Save to database if user is authenticated
        try {
            await saveConversationToDatabase(conversation, req.user);
        } catch (dbError) {
            console.error('❌ Error saving conversation to database:', dbError);
            // Don't fail the response if database save fails
        }

        res.json({
            success: true,
            data: {
                conversationId: conversation.id,
                transcription: transcription,
                response: response,
                confidence: confidence,
                sources: sources,
                spellCheck: spellCheckResult.hasCorrections ? {
                    hasCorrections: true,
                    corrections: spellCheckResult.corrections,
                    original: transcription,
                    corrected: processedMessage
                } : null,
                audioUrl: `/uploads/${audioFile.filename}`,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error in voice processing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process voice message',
            details: error.message
        });
    }
});

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get all conversations
 * @access  Public
 */
router.get('/conversations', async (req, res) => {
    try {
        // Get user ID from auth token if available
        const userId = req.user ? req.user.id : null;
        
        // Load conversations from database
        const dbConversations = await loadConversationsFromDatabase(userId, 20);
        
        // Also include in-memory conversations for current session
        const memoryConversations = Array.from(conversations.values()).map(conv => ({
            id: conv.id,
            title: conv.messages[0]?.content.substring(0, 50) + '...' || 'New Conversation',
            messageCount: conv.messages.length,
            lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
            createdAt: conv.createdAt,
            updatedAt: new Date(),
            category: 'general',
            source: 'memory'
        }));
        
        // Combine and deduplicate
        const allConversations = [...dbConversations, ...memoryConversations];
        const uniqueConversations = allConversations.filter((conv, index, self) => 
            index === self.findIndex(c => c.id === conv.id)
        );
        
        // Sort by most recent
        uniqueConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json({
            success: true,
            data: {
                conversations: uniqueConversations.slice(0, 20),
                total: uniqueConversations.length
            }
        });
    } catch (error) {
        console.error('❌ Error getting conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations',
            details: error.message
        });
    }
});

/**
 * @route   GET /api/chatbot/conversation/:id
 * @desc    Get specific conversation
 * @access  Public
 */
router.get('/conversation/:id', (req, res) => {
    try {
        const conversationId = req.params.id;
        const conversation = conversations.get(conversationId);

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

// Python Image Analysis Integration
async function analyzeImageWithPython(imagePath, question, language = 'en') {
    try {
        console.log(`🔍 Running Python image analysis on: ${imagePath}`);
        
        const scriptPath = path.join(__dirname, '..', 'data', 'analyze_image.py');
        const result = await runPythonScript(scriptPath, [], JSON.stringify({
            imagePath: imagePath,
            question: question || 'What can you tell me about this crop image?',
            language: language
        }));
        
        if (result && result.response) {
            return {
                response: result.response,
                confidence: result.confidence || 0.8,
                imageAnalysis: result.imageAnalysis || {},
                detectedProblems: result.detectedProblems || [],
                recommendations: result.recommendations || []
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Python image analysis error:', error);
        return null;
    }
}

// Enhanced RAG System Integration
async function getRagResponse(message, language = 'en', previousMessages = []) {
    try {
        console.log(`🔍 Querying Enhanced Knowledge Base for: "${message}"`);
        
        // First try the enhanced knowledge base
        const kbResult = knowledgeBase.getContextualResponse(message, previousMessages, language);
        
        if (kbResult && kbResult.confidence > 0.5) {
            console.log(`🎆 Enhanced KB found high-confidence answer: ${kbResult.confidence.toFixed(2)}`);
            return {
                response: kbResult.answer,
                confidence: kbResult.confidence,
                sources: [kbResult.source],
                category: kbResult.category
            };
        }
        
        // Fallback to Python RAG system if available
        try {
            const scriptPath = path.join(__dirname, '..', 'data', 'query_rag.py');
            const result = await runPythonScript(scriptPath, [], JSON.stringify({
                query: message,
                language: language,
                topK: 3
            }));
            
            if (result && result.response) {
                console.log('🐍 Python RAG system provided fallback response');
                return {
                    response: result.response,
                    confidence: result.confidence || 0.6,
                    sources: result.sources || []
                };
            }
        } catch (pythonError) {
            console.log('🐍 Python RAG system unavailable, using knowledge base only');
        }
        
        // If knowledge base had a low-confidence result, still return it
        if (kbResult) {
            console.log(`📚 Returning lower-confidence KB answer: ${kbResult.confidence.toFixed(2)}`);
            return {
                response: kbResult.answer,
                confidence: kbResult.confidence,
                sources: [kbResult.source],
                category: kbResult.category
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Enhanced RAG system error:', error);
        return null;
    }
}

// Fallback response generator
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting patterns
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return fallbackResponses.greeting;
    }
    
    // Crop growth issues (common question)
    if (lowerMessage.includes('growth') || lowerMessage.includes('grow') || lowerMessage.includes('not growing')) {
        return `🌱 **Crop Growth Issues - Common Solutions:**

**1. Soil Problems:**
• Test soil pH (should be 6.0-7.0 for most crops)
• Check for proper drainage - waterlogged soil prevents growth
• Add organic compost to improve soil structure

**2. Nutrition Issues:**
• Nitrogen deficiency causes yellowing and slow growth
• Apply balanced NPK fertilizer (10:10:10)
• Use organic options: cow manure, vermicompost

**3. Water Management:**
• Maintain consistent moisture (not too wet, not too dry)
• Water deeply but less frequently
• Check if roots are getting enough water

**4. Environmental Factors:**
• Ensure adequate sunlight (6-8 hours daily)
• Protect from extreme temperatures
• Check for pest damage on roots/stems

**5. Seed/Planting Issues:**
• Use quality seeds from reliable sources
• Plant at correct depth and spacing
• Ensure proper germination conditions

**Quick Action:** Check soil moisture, add compost, and ensure good drainage. Most growth issues are soil-related!`;
    }
    
    // Farming topic keywords
    const farmingKeywords = ['crop', 'plant', 'seed', 'fertilizer', 'pest', 'disease', 'soil', 'water', 'farm', 'agriculture', 'harvest', 'fasal'];
    const hasFarmingKeywords = farmingKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasFarmingKeywords) {
        // Provide specific farming advice based on keywords
        if (lowerMessage.includes('disease') || lowerMessage.includes('pest') || lowerMessage.includes('bimari')) {
            return "🔬 **Plant Disease & Pest Management:**\n\n1) **Identify the Problem First** - Look for specific symptoms (yellowing, spots, holes)\n2) **Integrated Pest Management (IPM)** - Combine different control methods\n3) **Organic Solutions:** Neem oil, beneficial insects, garlic spray\n4) **Proper Plant Spacing** - Ensure good air circulation\n5) **Preventive Measures:** Crop rotation, resistant varieties\n6) **Contact Local Extension Services** for region-specific advice\n\n**Emergency Action:** Remove infected parts immediately and improve ventilation.";
        }
        if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrition') || lowerMessage.includes('khad')) {
            return "🌿 **Plant Nutrition Guide:**\n\n1) **Soil Testing First** - Check pH and nutrient levels\n2) **Organic Options:** Compost, cow manure, vermicompost\n3) **NPK Ratios:** 10:10:10 for general use, adjust based on crop needs\n4) **Application Timing:** Early morning or evening, avoid hot sun\n5) **Slow-Release Fertilizers** - Prevent nutrient loss\n6) **Micronutrients:** Iron, zinc, boron for healthy growth\n\n**Pro Tip:** Organic matter improves both nutrition and soil structure!";
        }
        if (lowerMessage.includes('water') || lowerMessage.includes('irrigation') || lowerMessage.includes('paani')) {
            return "💧 **Smart Water Management:**\n\n1) **Deep, Infrequent Watering** - Encourages deep root growth\n2) **Best Times:** Early morning (6-8 AM) or evening (6-8 PM)\n3) **Drip Irrigation** - Most efficient water use\n4) **Mulching** - Reduces evaporation by 50-70%\n5) **Soil Moisture Check** - Insert finger 2-3 inches deep\n6) **Drainage** - Ensure excess water can escape\n\n**Warning:** Overwatering kills more plants than underwatering!";
        }
        if (lowerMessage.includes('soil') || lowerMessage.includes('mitti')) {
            return "🌍 **Healthy Soil Management:**\n\n1) **pH Testing** - Most crops prefer 6.0-7.0 pH\n2) **Organic Matter** - Add 2-3 inches of compost annually\n3) **Crop Rotation** - Prevents soil depletion and disease\n4) **Avoid Compaction** - Don't work wet soil\n5) **Cover Crops** - Protect and enrich soil during off-season\n6) **Natural Amendments:** Bone meal, wood ash, green manure\n\n**Remember:** Good soil = Good crops. Invest in your soil health!";
        }
        if (lowerMessage.includes('seed') || lowerMessage.includes('beej')) {
            return "🌰 **Seed Selection & Planting:**\n\n1) **Quality Seeds** - Buy from certified dealers\n2) **Germination Test** - Test 10 seeds in damp paper\n3) **Proper Depth** - Generally 2-3x seed diameter\n4) **Spacing** - Follow seed packet instructions\n5) **Pre-treatment** - Soak hard seeds overnight\n6) **Storage** - Cool, dry place to maintain viability\n\n**Success Tip:** Good seeds are 50% of successful farming!";
        }
        return fallbackResponses.general;
    }
    
    // Default response with farming focus
    return "🌾 **I'm your Agricultural Assistant!**\n\nI can help you with:\n• Crop growth problems\n• Plant diseases and pests\n• Soil management\n• Fertilizers and nutrition\n• Irrigation techniques\n• Seed selection\n\nWhat specific farming challenge can I help you solve today?";
}

// Image Analysis Fallback Generator
function getImageAnalysisFallback(question) {
    const lowerQuestion = question.toLowerCase();
    
    let response = "**🔍 Image Analysis Guidelines:**\n\n";
    
    if (lowerQuestion.includes('disease') || lowerQuestion.includes('sick') || lowerQuestion.includes('problem')) {
        response += `**🩺 Disease/Problem Identification:**\n\n• **Look for symptoms:** Yellowing leaves, brown spots, wilting, unusual growths\n• **Check leaf patterns:** Circular spots (fungal), streaks (viral), margins (nutrient deficiency)\n• **Examine stems and roots:** Discoloration, soft spots, rot\n• **Common diseases:** Blight, rust, mildew, bacterial wilt\n• **Treatment:** Remove affected parts, improve air circulation, apply fungicide if needed\n\n`;
    }
    
    if (lowerQuestion.includes('pest') || lowerQuestion.includes('insect') || lowerQuestion.includes('bug')) {
        response += `**🐛 Pest Identification:**\n\n• **Visible insects:** Aphids (green/black clusters), caterpillars (holes in leaves), whiteflies\n• **Damage patterns:** Holes (chewing insects), stippling (sucking insects), tunnels (miners)\n• **Signs to look for:** Sticky honeydew, webbing, frass (insect droppings)\n• **Natural control:** Neem oil, insecticidal soap, beneficial insects\n• **Prevention:** Companion planting, proper spacing, regular inspection\n\n`;
    }
    
    if (lowerQuestion.includes('nutrient') || lowerQuestion.includes('deficiency') || lowerQuestion.includes('yellow')) {
        response += `**🌿 Nutrient Deficiency Signs:**\n\n• **Nitrogen deficiency:** Lower leaves turn yellow, slow growth\n• **Phosphorus deficiency:** Purple/red leaves, poor root development\n• **Potassium deficiency:** Brown leaf edges, weak stems\n• **Iron deficiency:** Young leaves yellow with green veins\n• **Magnesium deficiency:** Yellow between leaf veins\n• **Solution:** Soil testing, balanced fertilizer, organic amendments\n\n`;
    }
    
    if (lowerQuestion.includes('identify') || lowerQuestion.includes('what') || lowerQuestion.includes('plant')) {
        response += `**🌱 Crop Identification Tips:**\n\n• **Leaf shape:** Look at leaf arrangement, size, edges (serrated, smooth)\n• **Plant structure:** Height, branching pattern, stem type\n• **Growth habit:** Bushy, vine-like, upright, spreading\n• **Flowers/fruits:** Color, size, arrangement\n• **Common crops:** Tomatoes (compound leaves), corn (grass-like), beans (trifoliate)\n\n`;
    }
    
    // Add general assessment guidelines
    response += `**📊 General Assessment Checklist:**\n\n` +
        `1. **Overall plant health:** Color, size, growth rate\n` +
        `2. **Environmental factors:** Light, water, temperature stress\n` +
        `3. **Soil conditions:** Drainage, pH, compaction\n` +
        `4. **Cultural practices:** Spacing, pruning, fertilization\n` +
        `5. **Seasonal considerations:** Growth stage, weather conditions\n\n` +
        `**💡 For Better Analysis:** Take multiple photos showing:\n` +
        `• Whole plant overview\n` +
        `• Close-up of affected areas\n` +
        `• Leaf details (both sides)\n` +
        `• Soil and root conditions\n\n` +
        `**🎯 Next Steps:** Adjust watering, improve soil, treat specific issues, or consult local agricultural extension services.`;
    
    return response;
}

// Database conversation saving
async function saveConversationToDatabase(conversation, user = null) {
    try {
        // Skip database saving for unauthenticated users
        if (!user || !user.id) {
            console.log(`⏭️ Skipping database save for unauthenticated user - conversation ${conversation.id} kept in memory only`);
            return null;
        }

        // Find existing conversation or create new one
        let dbConversation = await ChatConversation.findOne({ 
            conversationId: conversation.id,
            userId: user.id
        });

        if (dbConversation) {
            // Update existing conversation
            dbConversation.messages = conversation.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                corrected: msg.corrected,
                image: msg.image,
                audioFile: msg.audioFile,
                timestamp: msg.timestamp,
                confidence: msg.confidence,
                sources: msg.sources || [],
                type: getMessageType(msg)
            }));
            
            dbConversation.updatedAt = new Date();
            await dbConversation.save();
            
            console.log(`💾 Updated conversation ${conversation.id} in database`);
        } else {
            // Create new conversation with valid userId
            const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
            const title = firstUserMessage ? 
                firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') 
                : 'New Conversation';
            
            dbConversation = new ChatConversation({
                userId: user.id, // Always valid here due to check above
                conversationId: conversation.id,
                title: title,
                language: 'en',
                messages: conversation.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    corrected: msg.corrected,
                    image: msg.image,
                    audioFile: msg.audioFile,
                    timestamp: msg.timestamp,
                    confidence: msg.confidence,
                    sources: msg.sources || [],
                    type: getMessageType(msg)
                })),
                createdAt: conversation.createdAt,
                updatedAt: new Date()
            });
            
            await dbConversation.save();
            console.log(`💾 Created new conversation ${conversation.id} in database`);
        }
        
        return dbConversation;
    } catch (error) {
        console.error(`❌ Database save error for conversation ${conversation.id}:`, error);
        // Don't throw error for database save failures - just log and continue
        return null;
    }
}

// Helper function to determine message type
function getMessageType(message) {
    if (message.audioFile) return 'voice';
    if (message.image) return 'image';
    return 'text';
}

// Load conversations from database
async function loadConversationsFromDatabase(userId = null, limit = 20) {
    try {
        const query = userId ? { userId } : {};
        const conversations = await ChatConversation.find(query)
            .select('conversationId title lastMessage updatedAt messagesCount category')
            .sort({ updatedAt: -1 })
            .limit(limit);
            
        return conversations.map(conv => ({
            id: conv.conversationId,
            _id: conv._id,
            title: conv.title,
            lastMessage: conv.lastMessage,
            messageCount: conv.messagesCount,
            category: conv.category,
            updatedAt: conv.updatedAt,
            createdAt: conv.createdAt
        }));
    } catch (error) {
        console.error('❌ Error loading conversations from database:', error);
        return [];
    }
}

// Python Script Runner
function runPythonScript(scriptPath, args = [], input = null) {
    return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const python = spawn('python', [scriptPath, ...args]);
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
                console.error(`Python script error: ${stderr}`);
                reject(new Error(`Python script failed with code ${code}: ${stderr}`));
            }
        });

        python.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = router;
