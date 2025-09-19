/**
 * Quick test for Enhanced Response Generator
 */

const EnhancedResponseGenerator = require('./utils/enhancedResponseGenerator');

async function testGenerator() {
    try {
        console.log('🧪 Testing Enhanced Response Generator...');
        
        const generator = new EnhancedResponseGenerator();
        
        console.log('✅ Generator initialized successfully');
        
        // Test with a simple farming query
        const testQuery = "How to grow rice effectively in India?";
        console.log(`📝 Testing query: ${testQuery}`);
        
        const result = generator.generateDetailedResponse(testQuery, [], 'en');
        
        console.log('✅ Response generated successfully');
        console.log(`📊 Word count: ${result.wordCount}`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📅 Timestamp: ${result.timestamp}`);
        
        // Show preview (first 500 characters)
        const preview = result.content.substring(0, 500);
        console.log('\n📋 Response Preview:');
        console.log(preview + '...\n');
        
        if (result.wordCount >= 2000) {
            console.log('🎉 SUCCESS: Generated detailed farming response with 2000+ words!');
        } else {
            console.log(`⚠️ WARNING: Response is ${result.wordCount} words (expected 2000+)`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

if (require.main === module) {
    testGenerator().then(success => {
        if (success) {
            console.log('\n✅ Enhanced Response Generator is working correctly!');
            console.log('🚀 Your chatbot should now provide detailed farming responses.');
        } else {
            console.log('\n❌ Enhanced Response Generator test failed.');
            console.log('🔧 Please check the error messages above.');
        }
    });
}

module.exports = { testGenerator };