/**
 * Minimal test for chatbot endpoint
 */

const express = require('express');
const app = express();

// Import just the essentials
try {
    const EnhancedResponseGenerator = require('./utils/enhancedResponseGenerator');
    const responseGenerator = new EnhancedResponseGenerator();
    
    console.log('✅ Enhanced Response Generator loaded successfully');
    
    // Test the generation directly
    const testMessage = "How to grow rice effectively in India?";
    console.log(`🧪 Testing message: ${testMessage}`);
    
    const result = responseGenerator.generateDetailedResponse(testMessage, [], 'en');
    
    console.log('📊 Results:');
    console.log(`- Word count: ${result.wordCount}`);
    console.log(`- Confidence: ${result.confidence}`);
    console.log(`- Content length: ${result.content.length} characters`);
    
    // Show first 200 characters
    console.log('\n📋 Preview:');
    console.log(result.content.substring(0, 200) + '...');
    
    if (result.wordCount >= 2000) {
        console.log('\n🎉 SUCCESS: Enhanced response generator is working!');
        console.log('✅ Your chatbot should now provide detailed responses.');
        
        // Test simple response format
        const simpleResponse = {
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
                messageId: 'msg-' + Date.now()
            }
        };
        
        console.log('✅ Response format prepared for API');
        console.log(`📦 API Response size: ${JSON.stringify(simpleResponse).length} bytes`);
        
    } else {
        console.log('⚠️ Response too short');
    }
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Try to identify the specific issue
    console.log('\n🔍 Debugging information:');
    console.log('- Current directory:', __dirname);
    console.log('- Node version:', process.version);
    
    // Check if the file exists
    const fs = require('fs');
    const path = require('path');
    const generatorPath = path.join(__dirname, 'utils', 'enhancedResponseGenerator.js');
    
    console.log('- Generator file exists:', fs.existsSync(generatorPath));
    console.log('- Generator path:', generatorPath);
}