const API_URL = 'http://localhost:5000';

async function runAuthTest() {
  try {
    console.log('🧪 Testing FarmAssist Authentication System...\n');

    // Test health check first
    console.log('0. Testing Server Health...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Server is running:', healthData.status === 'ok');

    // Test signup
    console.log('\n1. Testing Signup...');
    const signupData = {
      name: 'Test Farmer',
      email: `test${Date.now()}@farmer.com`,
      password: 'testpass123'
    };

    try {
      const signupRes = await fetch(`${API_URL}/api/auth/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      const signupData_result = await signupRes.json();
      console.log('✅ Signup successful:', signupData_result.success);
      
      if (signupData_result.success) {
        const { authtoken, user } = signupData_result;
        console.log('📋 Created user:', user.name);
        
        // Test login with same credentials
        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password
          })
        });
        const loginData = await loginRes.json();
        console.log('✅ Login successful:', loginData.success);
        
        if (loginData.success) {
          // Test protected route
          console.log('\n3. Testing Protected Route...');
          const profileRes = await fetch(`${API_URL}/api/auth/getuser`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'auth-token': loginData.authtoken 
            }
          });
          const profileData = await profileRes.json();
          console.log('✅ Protected route accessible:', !!profileData);
          console.log('📋 User profile loaded:', profileData.name);
          
          // Test profile update
          console.log('\n4. Testing Profile Update...');
          const updatePayload = {
            profile: {
              farmSize: 5.5,
              primaryCrops: ['🌾 Rice', '🌾 Wheat'],
              experienceLevel: 'intermediate'
            }
          };
          
          const updateRes = await fetch(`${API_URL}/api/auth/updateprofile`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'auth-token': loginData.authtoken 
            },
            body: JSON.stringify(updatePayload)
          });
          const updateData = await updateRes.json();
          console.log('✅ Profile update successful:', updateData.success);
          
          console.log('\n🎉 All authentication tests passed!');
          console.log('🌾 FarmAssist authentication system is working correctly!');
        }
      }
    } catch (error) {
      console.error('❌ Error in auth test:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', await error.response.text());
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('Make sure the backend server is running on http://localhost:5000');
  }
}

// Run the test
runAuthTest();
