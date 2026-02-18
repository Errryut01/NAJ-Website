'use client';

import { useState } from 'react';

export default function LinkedInTestPage() {
  const [testResult, setTestResult] = useState('');

  const testLinkedInApp = async () => {
    try {
      setTestResult('🔄 Testing LinkedIn app configuration...');
      
      // Test 1: Check if we can generate OAuth URL
      const response = await fetch('/api/auth/linkedin?userId=test-user');
      const data = await response.json();
      
      if (data.authUrl) {
        setTestResult(prev => prev + '\n✅ OAuth URL generated successfully');
        
        // Test 2: Check the URL format
        const url = new URL(data.authUrl);
        const params = new URLSearchParams(url.search);
        
        setTestResult(prev => prev + `\n\n🔍 URL Analysis:
Client ID: ${params.get('client_id')}
Redirect URI: ${decodeURIComponent(params.get('redirect_uri') || '')}
State: ${params.get('state')}
Scope: ${params.get('scope')}
Prompt: ${params.get('prompt')}

Full URL: ${data.authUrl}`);
        
        // Test 3: Check if the URL is valid
        if (params.get('client_id') === '86osahl2qwesp9' && 
            params.get('redirect_uri') === 'http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Flinkedin%2Fcallback' &&
            params.get('scope') === 'openid profile email') {
          setTestResult(prev => prev + '\n\n✅ URL format looks correct');
        } else {
          setTestResult(prev => prev + '\n\n❌ URL format has issues');
        }
        
        setTestResult(prev => prev + '\n\n🎯 Next Steps:\n1. Copy the URL above\n2. Open it in a new tab\n3. If you get "Network Will Be Back Soon", the issue is with your LinkedIn app configuration\n4. Check your LinkedIn Developer Portal settings');
        
      } else {
        setTestResult(prev => prev + '\n❌ Failed to generate OAuth URL');
      }
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '40px', maxWidth: '800px', color: '#333' }}>
      <h1 style={{ color: '#000', fontSize: '28px', marginBottom: '30px' }}>🔍 LinkedIn App Configuration Test</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa', color: '#333' }}>
        <h3 style={{ color: '#000', marginTop: '0' }}>Test Your LinkedIn App</h3>
        <button 
          onClick={testLinkedInApp}
          style={{ background: '#0077b5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', margin: '5px', fontSize: '16px' }}
        >
          Test LinkedIn App
        </button>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #28a745', background: '#d4edda', color: '#333' }}>
        <h3 style={{ color: '#000', marginTop: '0' }}>Common LinkedIn OAuth Issues:</h3>
        <ul style={{ color: '#333' }}>
          <li><strong>Wrong Redirect URI:</strong> Must be exactly <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>http://localhost:3000/api/auth/linkedin/callback</code></li>
          <li><strong>App in Development Mode:</strong> Can only test with your own account</li>
          <li><strong>Missing Scopes:</strong> Need <code style={{ background: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>r_liteprofile</code> enabled</li>
          <li><strong>App Not Approved:</strong> Some scopes require LinkedIn approval</li>
          <li><strong>Rate Limiting:</strong> Too many requests can cause temporary blocks</li>
        </ul>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #ffc107', background: '#fff3cd', color: '#333' }}>
        <h3 style={{ color: '#000', marginTop: '0' }}>Test Results:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: '15px', borderRadius: '4px', color: '#333', fontSize: '14px', lineHeight: '1.4' }}>
          {testResult || 'Click "Test LinkedIn App" to start...'}
        </pre>
      </div>
    </div>
  );
}
