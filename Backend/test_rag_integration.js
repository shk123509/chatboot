const axios = require('axios');

// Test RAG system integration
async function testRAGSystem() {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🧪 Testing RAG System Integration...\n');
    
    try {
        // 1. Check RAG system status
        console.log('1️⃣ Checking RAG system status...');
        const statusResponse = await axios.get(`${baseURL}/rag/status`);
        console.log('✅ RAG Status:', statusResponse.data.status);
        console.log('   - Dataset exists:', statusResponse.data.status.dataset_exists);
        console.log('   - RAG system exists:', statusResponse.data.status.rag_system_exists);
        console.log('   - Vector index exists:', statusResponse.data.status.vector_index_exists);
        console.log('');
        
        // 2. Test RAG query
        console.log('2️⃣ Testing RAG query...');
        const queries = [
            "My tomato leaves are turning yellow",
            "मेरे टमाटर के पत्ते पीले हो रहे हैं",
            "How to control pests in rice crop?",
            "What is the best irrigation method for wheat?"
        ];
        
        for (const query of queries) {
            console.log(`\n   Query: "${query}"`);
            try {
                const response = await axios.post(`${baseURL}/rag/query`, {
                    query: query,
                    topK: 3
                });
                
                if (response.data.success && response.data.data) {
                    const result = response.data.data;
                    console.log(`   ✅ Response received (Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
                    console.log(`   Response preview: ${result.response.substring(0, 100)}...`);
                    console.log(`   Sources found: ${result.sources ? result.sources.length : 0}`);
                } else {
                    console.log('   ⚠️ No valid response from RAG system');
                }
            } catch (error) {
                console.log(`   ❌ Query failed: ${error.message}`);
            }
        }
        
        // 3. Test chatbot message endpoint
        console.log('\n3️⃣ Testing chatbot message endpoint...');
        const chatResponse = await axios.post(`${baseURL}/chatbot/message`, {
            message: "What should I do if my wheat crop has yellow rust?",
            language: 'en'
        });
        
        if (chatResponse.data.success) {
            console.log('✅ Chatbot response received');
            console.log(`   Response preview: ${chatResponse.data.data.response.substring(0, 150)}...`);
            console.log(`   Confidence: ${(chatResponse.data.data.confidence * 100).toFixed(1)}%`);
        }
        
        // 4. Test categories endpoint
        console.log('\n4️⃣ Testing categories endpoint...');
        const categoriesResponse = await axios.get(`${baseURL}/rag/categories`);
        console.log('✅ Categories loaded:', categoriesResponse.data.categories.length, 'categories');
        categoriesResponse.data.categories.forEach(cat => {
            console.log(`   - ${cat.name}: ${cat.description}`);
        });
        
        console.log('\n✨ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run tests if server is running
console.log('⚠️  Make sure the backend server is running on port 5000\n');
console.log('If not running, start it with: npm run dev\n');

setTimeout(() => {
    testRAGSystem();
}, 2000);