/**
 * Test script for the secure API proxy
 */

// Use built-in fetch (Node.js 18+)

async function testProxy() {
  console.log('🧪 Testing Secure API Proxy...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   API Keys: ${JSON.stringify(healthData.api_keys_configured)}`);
    console.log('');

    // Test 2: Proxy endpoint with httpbin
    console.log('2. Testing proxy endpoint with httpbin...');
    const proxyResponse = await fetch(`${baseUrl}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baseUrl: 'https://httpbin.org',
        path: 'get',
        method: 'GET'
      })
    });

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      console.log('✅ Proxy test passed');
      console.log(`   Status: ${proxyData.status}`);
      console.log(`   Response time: ${proxyData.responseTime}ms`);
      console.log(`   Success: ${proxyData.success}`);
    } else {
      console.log('❌ Proxy test failed');
      console.log(`   Status: ${proxyResponse.status}`);
      const errorText = await proxyResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    console.log('');

    // Test 3: IP lookup through existing endpoint
    console.log('3. Testing IP lookup endpoint...');
    const ipResponse = await fetch(`${baseUrl}/api/ip/8.8.8.8`);
    
    if (ipResponse.ok) {
      const ipData = await ipResponse.json();
      console.log('✅ IP lookup test passed');
      console.log(`   Success: ${ipData.success}`);
      console.log(`   Source: ${ipData.source}`);
      console.log(`   IP: ${ipData.data.ip}`);
    } else {
      console.log('❌ IP lookup test failed');
      console.log(`   Status: ${ipResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testProxy().catch(console.error);
