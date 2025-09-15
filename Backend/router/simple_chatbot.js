const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');

// Simple in-memory storage for conversations
let conversations = [];
let conversationCounter = 1;
let messageCounter = 1;

/**
 * Simple Farmer Chatbot API - Working Version
 * This is a simplified version that works without complex dependencies
 */

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to chatbot (simplified version)
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

        // Find or create conversation
        let conversation = conversations.find(conv => 
            conv._id === conversationId && conv.userId === userId
        );

        if (!conversation) {
            conversation = {
                _id: `conv_${conversationCounter++}`,
                userId: userId,
                title: message.length > 50 ? message.substring(0, 50) + '...' : message,
                language: language,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            conversations.push(conversation);
        }

        // Add user message
        const userMessage = {
            _id: `msg_${messageCounter++}`,
            role: 'user',
            content: message,
            timestamp: new Date(),
            type: 'text'
        };
        conversation.messages.push(userMessage);

        // Generate bot response based on farming keywords
        const botResponse = generateFarmingResponse(message, language);

        // Add bot message
        const botMessage = {
            _id: `msg_${messageCounter++}`,
            role: 'assistant',
            content: botResponse.response,
            timestamp: new Date(),
            type: 'text',
            confidence: botResponse.confidence || 0.8,
            sources: botResponse.sources || []
        };
        conversation.messages.push(botMessage);

        // Update conversation
        conversation.updatedAt = new Date();

        res.json({
            success: true,
            data: {
                conversationId: conversation._id,
                response: botResponse.response,
                confidence: botResponse.confidence,
                sources: botResponse.sources,
                messageId: botMessage._id,
                timestamp: botMessage.timestamp
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
 * @route   GET /api/chatbot/conversations
 * @desc    Get user's chat conversations
 * @access  Private
 */
router.get('/conversations', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const userConversations = conversations
            .filter(conv => conv.userId === userId)
            .map(conv => ({
                _id: conv._id,
                title: conv.title,
                lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : '',
                updatedAt: conv.updatedAt,
                language: conv.language,
                messagesCount: conv.messages.length
            }))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json({
            success: true,
            data: {
                conversations: userConversations,
                pagination: {
                    current: 1,
                    pages: 1,
                    total: userConversations.length
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

        const conversation = conversations.find(conv => 
            conv._id === conversationId && conv.userId === userId
        );

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

        const conversationIndex = conversations.findIndex(conv => 
            conv._id === conversationId && conv.userId === userId
        );

        if (conversationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        conversations.splice(conversationIndex, 1);

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

// Helper function to generate farming responses
function generateFarmingResponse(message, language = 'en') {
    const messageLower = message.toLowerCase();
    
    // Farming-related responses in multiple languages
    const responses = {
        'en': {
            // Crop diseases
            'yellow leaves': 'Yellow leaves often indicate nitrogen deficiency. Apply nitrogen-rich fertilizer like urea or compost. Also check for overwatering or root problems.',
            'brown spots': 'Brown spots on leaves usually indicate fungal diseases. Apply copper-based fungicides and improve air circulation around plants.',
            'wilting': 'Wilting can be caused by lack of water, root rot, or pest damage. Check soil moisture and inspect roots for damage.',
            
            // Pests
            'pest': 'For pest control, use neem oil spray or organic pesticides. Install sticky traps and encourage beneficial insects.',
            'insects': 'Common insects can be controlled with neem-based sprays. Apply during evening hours for best results.',
            'aphid': 'Aphids can be controlled with ladybugs or insecticidal soap. Spray plants with strong water stream to remove them.',
            
            // Soil issues
            'soil dry': 'Dry soil needs proper irrigation. Consider drip irrigation or mulching to retain moisture.',
            'soil hard': 'Hard soil indicates compaction. Add organic matter like compost and avoid heavy machinery on wet soil.',
            'soil acidic': 'Acidic soil can be corrected by adding lime. Test soil pH first and apply lime according to results.',
            
            // Weather
            'drought': 'During drought, use water conservation techniques like mulching and drip irrigation. Choose drought-resistant varieties.',
            'too much rain': 'Excess rain requires good drainage. Create raised beds and ensure proper water runoff.',
            
            // General farming
            'fertilizer': 'Use balanced fertilizers (NPK) based on soil test results. Organic options include compost and farmyard manure.',
            'seeds': 'Use certified seeds from reliable sources. Treat seeds before planting to prevent diseases.',
            
            // Default response
            'default': 'Thank you for your farming question. For specific advice, please provide more details about your crop and the problem you\'re facing.'
        },
        
        'hi': {
            'yellow leaves': 'पीले पत्ते अक्सर नाइट्रोजन की कमी दर्शाते हैं। यूरिया या खाद डालें। पानी की अधिकता या जड़ों की समस्या भी चेक करें।',
            'brown spots': 'पत्तों पर भूरे धब्बे फंगल बीमारी दर्शाते हैं। कॉपर-बेस्ड फंगीसाइड का उपयोग करें और हवा का संचार बढ़ाएं।',
            'pest': 'कीट नियंत्रण के लिए नीम तेल का छिड़काव करें। चिपचिपे जाल लगाएं और लाभकारी कीटों को बढ़ावा दें।',
            'soil dry': 'सूखी मिट्टी के लिए उचित सिंचाई आवश्यक है। ड्रिप सिंचाई या मल्चिंग का उपयोग करें।',
            'default': 'आपके खेती के सवाल के लिए धन्यवाद। विशिष्ट सलाह के लिए कृपया अपनी फसल और समस्या के बारे में और बताएं।'
        },
        
        'pa': {
            'yellow leaves': 'ਪੀਲੇ ਪੱਤੇ ਅਕਸਰ ਨਾਈਟ੍ਰੋਜਨ ਦੀ ਕਮੀ ਦਰਸਾਉਂਦੇ ਹਨ। ਯੂਰੀਆ ਜਾਂ ਖਾਦ ਪਾਓ। ਪਾਣੀ ਦੀ ਜ਼ਿਆਦਤੀ ਜਾਂ ਜੜ੍ਹਾਂ ਦੀ ਸਮੱਸਿਆ ਵੀ ਚੈਕ ਕਰੋ।',
            'pest': 'ਕੀੜੇ ਨਿਯੰਤ੍ਰਣ ਲਈ ਨੀਮ ਤੇਲ ਦਾ ਛਿੜਕਾਅ ਕਰੋ। ਚਿਪਚਿਪੇ ਜਾਲ ਲਗਾਓ ਅਤੇ ਲਾਭਕਾਰੀ ਕੀੜਿਆਂ ਨੂੰ ਵਧਾਵਾ ਦਿਓ।',
            'default': 'ਤੁਹਾਡੇ ਖੇਤੀ ਦੇ ਸਵਾਲ ਲਈ ਧੰਨਵਾਦ। ਖਾਸ ਸਲਾਹ ਲਈ ਆਪਣੀ ਫਸਲ ਅਤੇ ਸਮੱਸਿਆ ਬਾਰੇ ਹੋਰ ਦੱਸੋ।'
        },
        
        'ur': {
            'yellow leaves': 'پیلے پتے اکثر نائٹروجن کی کمی ظاہر کرتے ہیں۔ یوریا یا کھاد ڈالیں۔ پانی کی زیادتی یا جڑوں کا مسئلہ بھی چیک کریں۔',
            'pest': 'کیڑوں کے کنٹرول کے لیے نیم کے تیل کا چھڑکاؤ کریں۔ چپچپے جال لگائیں اور فائدہ مند کیڑوں کو بڑھاوا دیں۔',
            'default': 'آپ کے کھیتی کے سوال کے لیے شکریہ۔ خاص مشورے کے لیے براہ کرم اپنی فصل اور مسئلے کے بارے میں مزید بتائیں۔'
        }
    };

    const langResponses = responses[language] || responses['en'];
    
    // Find matching response
    for (const keyword in langResponses) {
        if (keyword !== 'default' && messageLower.includes(keyword)) {
            return {
                response: langResponses[keyword],
                confidence: 0.8,
                sources: [{
                    category: 'farming_knowledge',
                    similarity: 0.8
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

module.exports = router;