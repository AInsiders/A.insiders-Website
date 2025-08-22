/**
 * Test script for IP detection
 */

// Use built-in fetch (Node.js 18+)

async function testIPDetection() {
  console.log('🧪 Testing IP Detection...\n');

  try {
    // Test 1: Direct httpbin call
    console.log('1. Testing direct httpbin call...');
    const httpbinResponse = await fetch('https://httpbin.org/ip');
    const httpbinData = await httpbinResponse.json();
    
    console.log('✅ httpbin response:', httpbinData);
    console.log('');

    // Test 2: Our API client
    console.log('2. Testing our API client...');
    const apiClient = require('./lib/apiClient');
    
    try {
      const result = await apiClient.fetch({
        url: 'https://httpbin.org',
        path: 'ip',
        authStyle: apiClient.AUTH_STYLES.NONE,
        timeout: 5000
      });
      
      console.log('✅ API client result:', result);
    } catch (error) {
      console.log('❌ API client error:', error.message);
    }
    console.log('');

    // Test 3: Server endpoint
    console.log('3. Testing server endpoint...');
    const serverResponse = await fetch('http://localhost:3000/api/current-ip');
    const serverData = await serverResponse.json();
    
    console.log('✅ Server response:', serverData);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testIPDetection().catch(console.error);
