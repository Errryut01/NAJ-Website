'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [oauthUrl, setOauthUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const testOAuthUrl = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/linkedin?userId=test-user')
      const data = await response.json()
      
      if (data.authUrl) {
        setOauthUrl(data.authUrl)
      } else {
        setError('Failed to generate OAuth URL: ' + JSON.stringify(data))
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const testBasicScope = () => {
    const basicUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86osahl2qwesp9&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/linkedin/callback')}&state=test-user&scope=r_liteprofile`
    setOauthUrl(basicUrl)
  }

  const testEmailScope = () => {
    const emailUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86osahl2qwesp9&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/linkedin/callback')}&state=test-user&scope=r_emailaddress`
    setOauthUrl(emailUrl)
  }

  const testNoScope = () => {
    const noScopeUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86osahl2qwesp9&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/linkedin/callback')}&state=test-user`
    setOauthUrl(noScopeUrl)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 LinkedIn OAuth Debug Tool</h1>
          
          {/* Current Configuration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Current Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Client ID:</strong> 86osahl2qwesp9
              </div>
              <div>
                <strong>Redirect URI:</strong> http://localhost:3000/api/auth/linkedin/callback
              </div>
              <div>
                <strong>Scope:</strong> r_liteprofile r_emailaddress
              </div>
              <div>
                <strong>Status:</strong> <span className="text-green-600">✅ Configured</span>
              </div>
            </div>
          </div>

          {/* Test OAuth URL Generation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Test OAuth URL Generation</h3>
            <button
              onClick={testOAuthUrl}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Generate OAuth URL'}
            </button>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-red-800 font-semibold">❌ Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {oauthUrl && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-green-800 font-semibold">✅ OAuth URL Generated</h4>
                <div className="mt-2 bg-gray-100 p-2 rounded text-sm font-mono break-all">
                  {oauthUrl}
                </div>
                <button
                  onClick={() => window.open(oauthUrl, '_blank')}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Test This URL
                </button>
              </div>
            )}
          </div>

          {/* Alternative OAuth URLs */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Alternative OAuth URLs to Try</h3>
            <p className="text-gray-600 mb-4">If the main OAuth URL doesn't work, try these alternatives:</p>
            
            <div className="space-y-3">
              <button
                onClick={testBasicScope}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
              >
                Basic Scope (r_liteprofile only)
              </button>
              
              <button
                onClick={testEmailScope}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mr-2"
              >
                Email Scope (r_emailaddress only)
              </button>
              
              <button
                onClick={testNoScope}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                No Scope
              </button>
            </div>
          </div>

          {/* Troubleshooting Steps */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">🛠️ Troubleshooting Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li><strong>Check LinkedIn Developer Portal:</strong> Ensure redirect URI is exactly: <code className="bg-yellow-100 px-1 rounded">http://localhost:3000/api/auth/linkedin/callback</code></li>
              <li><strong>Verify App Status:</strong> Make sure your LinkedIn app is active and approved</li>
              <li><strong>Check Permissions:</strong> Ensure your app has the required permissions (r_liteprofile, r_emailaddress)</li>
              <li><strong>Wait and Retry:</strong> LinkedIn sometimes has temporary issues - wait 5-10 minutes and try again</li>
              <li><strong>Clear Browser Cache:</strong> Clear cookies and cache, then try again</li>
              <li><strong>Try Different Browser:</strong> Test in incognito/private mode or different browser</li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex space-x-4">
            <a
              href="https://www.linkedin.com/developers/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              LinkedIn Developer Portal
            </a>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Main App
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
