'use client';

import { useState } from 'react';

export default function TestOAuthPage() {
  const [oauthUrl, setOauthUrl] = useState('');
  const [status, setStatus] = useState('Ready to test...');
  const [result, setResult] = useState('');

  const generateOAuthUrl = async () => {
    try {
      setStatus('🔄 Generating OAuth URL...');
      const response = await fetch('/api/auth/linkedin?userId=test-user');
      const data = await response.json();
      
      if (data.authUrl) {
        setOauthUrl(data.authUrl);
        setResult(`
          <div style="background: #d4edda; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745; margin: 10px 0;">
            <p><strong>✅ OAuth URL generated successfully!</strong></p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 10px 0;">
              ${data.authUrl}
            </div>
          </div>
        `);
        setStatus('✅ OAuth URL ready - you can now test the flow');
      } else {
        setResult(`
          <div style="background: #f8d7da; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545; margin: 10px 0;">
            <p><strong>❌ Failed to generate OAuth URL</strong></p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        `);
        setStatus('❌ Failed to generate OAuth URL');
      }
    } catch (error: any) {
      setResult(`
        <div style="background: #f8d7da; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545; margin: 10px 0;">
          <p><strong>❌ Network error: ${error.message}</strong></p>
          <p>Make sure the development server is running.</p>
        </div>
      `);
      setStatus('❌ Network error - check server');
    }
  };

  const testOAuthFlow = () => {
    if (!oauthUrl) {
      alert('Please generate OAuth URL first!');
      return;
    }
    
    setStatus('🔄 Opening LinkedIn OAuth...');
    window.open(oauthUrl, '_blank');
    
    // Set up a listener for when the user comes back
    setTimeout(() => {
      setStatus('⏳ Waiting for LinkedIn redirect... Check the URL after authorization!');
    }, 2000);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '40px', maxWidth: '800px' }}>
      <h1>🔍 LinkedIn OAuth Flow Test</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa' }}>
        <h3>Step 1: Generate OAuth URL</h3>
        <button 
          onClick={generateOAuthUrl}
          style={{ background: '#0077b5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', margin: '5px' }}
        >
          Generate OAuth URL
        </button>
        <div dangerouslySetInnerHTML={{ __html: result }} />
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa' }}>
        <h3>Step 2: Test OAuth Flow</h3>
        <button 
          onClick={testOAuthFlow}
          style={{ background: '#0077b5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', margin: '5px' }}
        >
          Open LinkedIn OAuth
        </button>
        <p><strong>Important:</strong> After clicking "Allow" on LinkedIn, check the URL in the address bar and tell me what you see.</p>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa' }}>
        <h3>Step 3: Check Callback URL</h3>
        <p>After LinkedIn authorization, you should be redirected to:</p>
        <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', wordBreak: 'break-all', margin: '10px 0' }}>
          http://localhost:3000/api/auth/linkedin/callback?code=...&state=...
        </div>
        <p>If you see a different URL, that's the problem!</p>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa' }}>
        <h3>Step 4: Verify LinkedIn Developer Portal</h3>
        <p>Make sure your LinkedIn app has this exact redirect URI:</p>
        <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', wordBreak: 'break-all', margin: '10px 0' }}>
          http://localhost:3000/api/auth/linkedin/callback
        </div>
        <a href="https://www.linkedin.com/developers/" target="_blank">
          <button style={{ background: '#0077b5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', margin: '5px' }}>
            Open LinkedIn Developer Portal
          </button>
        </a>
      </div>

      <div style={{ margin: '20px 0', padding: '15px', borderLeft: '4px solid #0077b5', background: '#f8f9fa' }}>
        <h3>Current Status</h3>
        <div style={{ fontWeight: 'bold', margin: '10px 0' }}>{status}</div>
      </div>
    </div>
  );
}
