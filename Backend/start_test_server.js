/**
 * Test server startup with enhanced chatbot
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');

// Test the enhanced response generator first
console.log('🧪 Testing Enhanced Response Generator...');
try {
    const EnhancedResponseGenerator = require('./utils/enhancedResponseGenerator');
    const testGenerator = new EnhancedResponseGenerator();
    
    const testResult = testGenerator.generateDetailedResponse("How to grow rice effectively?", [], 'en');
    console.log(`✅ Enhanced Generator Test: ${testResult.wordCount} words generated`);
    
    if (testResult.wordCount < 2000) {
        console.log('⚠️ WARNING: Word count is below 2000');
    } else {
        console.log('🎉 SUCCESS: Enhanced responses are working!');
    }
} catch (error) {
    console.error('❌ Enhanced Generator Test Failed:', error.message);
}

// Connect to MongoDB
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// Basic logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Enhanced FarmAssist API is working',
        timestamp: new Date().toISOString(),
        features: [
            'Enhanced AI responses (2000+ words)',
            'Settings functionality',
            'Comprehensive farming guidance'
        ]
    });
});

// Import and use routes
try {
    app.use("/api/auth", require("./router/auth"));
    app.use("/api/chatbot", require("./router/advanced_chatbot"));
    console.log('✅ Routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
}

// Test chatbot endpoint specifically
app.post('/api/test-enhanced-chat', async (req, res) => {
    try {
        const { message = "How to grow rice effectively in India?" } = req.body;
        
        console.log(`🤖 Test chat request: ${message}`);
        
        const EnhancedResponseGenerator = require('./utils/enhancedResponseGenerator');
        const generator = new EnhancedResponseGenerator();
        
        const result = generator.generateDetailedResponse(message, [], 'en');
        
        res.json({
            success: true,
            data: {
                botResponse: {
                    response: result.content,
                    confidence: result.confidence,
                    wordCount: result.wordCount,
                    sources: [{
                        category: 'comprehensive_farming_guide',
                        source: 'Enhanced Agricultural Knowledge Base'
                    }]
                },
                conversationId: 'test-' + Date.now(),
                messageId: 'msg-' + Date.now(),
                timestamp: new Date().toISOString()
            }
        });
        
        console.log(`✅ Enhanced response generated: ${result.wordCount} words`);
        
    } catch (error) {
        console.error('❌ Test chat error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Enhanced chat test failed',
            details: error.message
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(port, () => {
    console.log('🚀 Enhanced FarmAssist Server Started!');
    console.log(`📡 Server: http://localhost:${port}`);
    console.log(`🧪 Test API: http://localhost:${port}/api/test`);
    console.log(`🤖 Test Chat: POST http://localhost:${port}/api/test-enhanced-chat`);
    console.log(`⚙️ Settings Test: http://localhost:${port}/api/auth/test-settings`);
    console.log('\n🌾 Ready to provide detailed farming guidance!');
});

module.exports = app;