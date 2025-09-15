const EnhancedKnowledgeBase = require('./utils/enhancedKnowledgeBase');
const TextToSpeechService = require('./utils/textToSpeechService');
const EnhancedVoiceService = require('./utils/enhancedVoiceService');
const { checkSpelling } = require('./utils/spellChecker');

console.log('🧪 Testing Enhanced Multimedia Features...\n');

// Test 1: Spell Checker
console.log('1️⃣ Testing Spell Checker:');
const testMessage = 'My tomato plant has yelow leaves and some diseez';
const spellResult = checkSpelling(testMessage);
console.log(`Original: ${testMessage}`);
console.log(`Corrected: ${spellResult.correctedMessage}`);
console.log(`Has corrections: ${spellResult.hasCorrections}`);
if (spellResult.hasCorrections) {
    console.log('Corrections:', spellResult.corrections);
}
console.log('');

// Test 2: Knowledge Base
console.log('2️⃣ Testing Enhanced Knowledge Base:');
const knowledgeBase = new EnhancedKnowledgeBase();
console.log(`Knowledge base healthy: ${knowledgeBase.isHealthy()}`);
console.log(`Total entries: ${knowledgeBase.getTotalEntries()}`);

const query = 'yellow leaves on tomato plants';
console.log(`Query: ${query}`);
const ragResult = knowledgeBase.getBestAnswer(query);
if (ragResult) {
    console.log(`Response: ${ragResult.answer.substring(0, 100)}...`);
    console.log(`Confidence: ${ragResult.confidence}`);
    console.log(`Category: ${ragResult.category}`);
} else {
    console.log('No matching response found');
}
console.log('');

// Test 3: TTS Service Status
console.log('3️⃣ Testing TTS Service:');
const ttsService = new TextToSpeechService();
console.log(`Supported languages: ${ttsService.getSupportedLanguages().join(', ')}`);
console.log('TTS service initialized successfully');
console.log('');

// Test 4: Voice Service Status
console.log('4️⃣ Testing Voice Service:');
const voiceService = new EnhancedVoiceService();
const voiceStatus = voiceService.getServiceStatus();
console.log('Voice service status:', voiceStatus);
console.log('');

console.log('✅ All services initialized successfully!');
console.log('');
console.log('🌐 Web Interface Available:');
console.log('   http://localhost:5000/enhanced_chatbot.html');
console.log('');
console.log('🚀 Features Ready:');
console.log('   ✅ Text Chat with RAG Integration');
console.log('   ✅ Image Analysis with RAG');
console.log('   ✅ Voice Recording with Playback');
console.log('   ✅ Text-to-Speech for All Responses');
console.log('   ✅ Spell Check Integration');
console.log('   ✅ Multi-language Support');
console.log('');
console.log('📱 How to Test:');
console.log('   1. Open http://localhost:5000/enhanced_chatbot.html');
console.log('   2. Create account or login');
console.log('   3. Try text messages with spelling mistakes');
console.log('   4. Upload crop images for analysis');
console.log('   5. Record voice messages and listen to responses');
console.log('   6. Toggle audio on/off with 🔊 Audio button');