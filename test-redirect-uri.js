// Test script to verify redirect URI format
const clientId = '86osahl2qwesp9';
const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback';

console.log('🔍 LinkedIn OAuth Redirect URI Test\n');

console.log('📋 Current Configuration:');
console.log(`Client ID: ${clientId}`);
console.log(`Redirect URI: ${redirectUri}`);
console.log(`Encoded Redirect URI: ${encodeURIComponent(redirectUri)}`);
console.log('');

console.log('🔗 Full OAuth URL:');
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test-user&scope=r_liteprofile r_emailaddress w_messaging`;
console.log(authUrl);
console.log('');

console.log('✅ What to add in LinkedIn Developer Portal:');
console.log('Redirect URI (exact copy):');
console.log(redirectUri);
console.log('');

console.log('📝 Steps to fix:');
console.log('1. Go to https://www.linkedin.com/developers/');
console.log('2. Find your app with Client ID: 86osahl2qwesp9');
console.log('3. Go to "Auth" tab');
console.log('4. Add this exact redirect URI:');
console.log(`   ${redirectUri}`);
console.log('5. Save changes');
console.log('6. Wait 2-3 minutes for propagation');
console.log('7. Test the "Connect LinkedIn" button again');
