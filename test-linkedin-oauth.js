// Test script to verify LinkedIn OAuth configuration
const https = require('https');

console.log('🔍 Testing LinkedIn OAuth Configuration...\n');

// Check environment variables
const clientId = process.env.LINKEDIN_CLIENT_ID || '86osahl2qwesp9';
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

console.log('📋 Configuration:');
console.log(`Client ID: ${clientId}`);
console.log(`Client Secret: ${clientSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`Redirect URI: ${redirectUri}`);
console.log('');

// Test OAuth URL generation
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test-user&scope=r_liteprofile r_emailaddress w_messaging`;

console.log('🔗 Generated OAuth URL:');
console.log(authUrl);
console.log('');

// Test API endpoint availability
const testApiEndpoint = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/linkedin?userId=test-user',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          resolve({ error: 'Invalid JSON response', data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

console.log('🧪 Testing API endpoint...');
testApiEndpoint()
  .then((response) => {
    console.log('✅ API Response:', response);
  })
  .catch((error) => {
    console.log('❌ API Error:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  });

console.log('\n📝 Next Steps:');
console.log('1. Make sure your LinkedIn app has the correct redirect URI configured');
console.log('2. Ensure your LinkedIn app has the required permissions');
console.log('3. Test the OAuth flow in your browser');
console.log('4. Check the LinkedIn Developer Portal for any issues');
