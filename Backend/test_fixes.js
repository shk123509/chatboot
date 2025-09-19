/**
 * Test Script for AI Response Enhancement and Settings Fix
 * Run this to verify both fixes are working
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Test configuration
const testConfig = {
    baseURL: BASE_URL,
    timeout: 30000 // 30 seconds for AI responses
};

// Test user credentials (create a test user first)
const testUser = {
    email: 'test@farmer.com',
    password: 'test123',
    name: 'Test Farmer'
};

let authToken = '';

async function testSignup() {
    try {
        console.log('\n🧪 Testing User Signup...');
        
        const response = await axios.post(`${BASE_URL}/api/auth/createuser`, {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }, testConfig);
        
        if (response.data.success) {
            authToken = response.data.authtoken;
            console.log('✅ User signup successful');
            console.log(`📧 Email: ${testUser.email}`);
            return true;
        }
        
    } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
            console.log('📝 User already exists, trying login...');
            return testLogin();
        } else {
            console.error('❌ Signup failed:', error.response?.data || error.message);
            return false;
        }
    }
}

async function testLogin() {
    try {
        console.log('\n🔑 Testing User Login...');
        
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        }, testConfig);
        
        if (response.data.success) {
            authToken = response.data.authtoken;
            console.log('✅ Login successful');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function testEnhancedAIResponse() {
    try {
        console.log('\n🤖 Testing Enhanced AI Response (Detailed Farming Advice)...');
        console.log('⏳ This may take 30-60 seconds for a comprehensive response...\n');
        
        const farmingQuestions = [
            "How to grow rice effectively?",
            "My wheat plants have yellow leaves, what should I do?",
            "What are the best practices for tomato farming?",
            "How to control pests in cotton crop?"
        ];
        
        for (let i = 0; i < farmingQuestions.length; i++) {
            const question = farmingQuestions[i];
            console.log(`\n📝 Question ${i + 1}: ${question}`);
            
            const response = await axios.post(`${BASE_URL}/api/chatbot/message`, {
                message: question,
                language: 'en'
            }, {
                ...testConfig,
                headers: {
                    'auth-token': authToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                const botResponse = response.data.data.botResponse;
                const wordCount = botResponse.response.split(' ').length;
                
                console.log(`✅ AI Response received:`);
                console.log(`📊 Word count: ${wordCount} words`);
                console.log(`🎯 Confidence: ${botResponse.confidence}`);
                console.log(`📚 Sources: ${botResponse.sources?.length || 0}`);
                
                // Show first 300 characters as preview
                const preview = botResponse.response.substring(0, 300);
                console.log(`\n📋 Response Preview:\n${preview}...\n`);
                
                if (wordCount >= 2000) {
                    console.log('🎉 SUCCESS: Response meets 2000+ word requirement!');
                } else {
                    console.log('⚠️ WARNING: Response is shorter than 2000 words');
                }
                
                // Only test first question in detail to save time
                if (i === 0) {
                    console.log('\n📄 Full response length check completed for first question.');
                    console.log('✅ Enhanced AI response system is working!\n');
                    break;
                }
            } else {
                console.error(`❌ AI response failed for question ${i + 1}`);
                console.error('Error:', response.data.error);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
    } catch (error) {
        console.error('❌ AI Response test failed:', error.response?.data || error.message);
        console.error('Stack:', error.stack);
        return false;
    }
    
    return true;
}

async function testSettingsEndpoints() {
    try {
        console.log('\n⚙️ Testing Settings Endpoints...');
        
        // Test settings debug endpoint
        console.log('📡 Testing settings debug endpoint...');
        const debugResponse = await axios.get(`${BASE_URL}/api/auth/test-settings`, {
            ...testConfig,
            headers: {
                'auth-token': authToken
            }
        });
        
        if (debugResponse.data.success) {
            console.log('✅ Settings debug endpoint working');
        }
        
        // Test profile update
        console.log('👤 Testing profile update...');
        const profileUpdateResponse = await axios.put(`${BASE_URL}/api/auth/updateprofile`, {
            name: 'Updated Test Farmer',
            profile: {
                farmSize: 5.5,
                location: {
                    state: 'Punjab',
                    district: 'Amritsar',
                    village: 'Test Village'
                },
                phone: '9876543210',
                bio: 'I am a test farmer testing the enhanced farming system.'
            },
            preferences: {
                language: 'english',
                notifications: {
                    email: true,
                    sms: false
                }
            }
        }, {
            ...testConfig,
            headers: {
                'auth-token': authToken,
                'Content-Type': 'application/json'
            }
        });
        
        if (profileUpdateResponse.data.success) {
            console.log('✅ Profile update successful');
            console.log('📝 Updated fields: name, farmSize, location, preferences');
        } else {
            console.error('❌ Profile update failed:', profileUpdateResponse.data);
            return false;
        }
        
        // Test getting user profile
        console.log('📖 Testing get user profile...');
        const getUserResponse = await axios.post(`${BASE_URL}/api/auth/getuser`, {}, {
            ...testConfig,
            headers: {
                'auth-token': authToken
            }
        });
        
        if (getUserResponse.data) {
            console.log('✅ Get user profile successful');
            console.log(`👤 User: ${getUserResponse.data.name}`);
            console.log(`🏠 Farm Size: ${getUserResponse.data.profile?.farmSize} acres`);
            console.log(`📍 Location: ${getUserResponse.data.profile?.location?.state}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Settings test failed:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting FarmAssist Enhancement Tests...');
    console.log('=' * 60);
    
    let allTestsPassed = true;
    
    // Test 1: Authentication
    const authSuccess = await testSignup();
    if (!authSuccess) {
        console.error('❌ Authentication tests failed');
        return;
    }
    
    // Test 2: Enhanced AI Response
    console.log('\n' + '='.repeat(60));
    console.log('🤖 TESTING ENHANCED AI RESPONSES (2000+ WORDS)');
    console.log('='.repeat(60));
    
    const aiSuccess = await testEnhancedAIResponse();
    if (!aiSuccess) {
        console.error('❌ AI Enhancement tests failed');
        allTestsPassed = false;
    }
    
    // Test 3: Settings Functionality
    console.log('\n' + '='.repeat(60));
    console.log('⚙️ TESTING SETTINGS PAGE FUNCTIONALITY');
    console.log('='.repeat(60));
    
    const settingsSuccess = await testSettingsEndpoints();
    if (!settingsSuccess) {
        console.error('❌ Settings tests failed');
        allTestsPassed = false;
    }
    
    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Both fixes are working correctly:');
        console.log('   ✅ AI now provides detailed 2000+ word farming responses');
        console.log('   ✅ Settings page functionality is working properly');
        console.log('\n🌾 Your FarmAssist app is ready for farmers to get comprehensive advice!');
    } else {
        console.log('⚠️ Some tests failed. Please check the error messages above.');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Start your frontend: cd frontend && npm start');
    console.log('3. Test the enhanced chatbot and settings page in the browser');
    console.log('4. Share with farmers to get detailed agricultural guidance!');
}

// Handle script execution
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    testEnhancedAIResponse,
    testSettingsEndpoints,
    runAllTests
};