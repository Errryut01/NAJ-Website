'use client'

import { useState } from 'react'

export default function DebugLinkedInOAuth() {
  const [step, setStep] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runFullTest = async () => {
    setLoading(true)
    setStep(1)
    
    try {
      // Step 1: Test configuration
      console.log('Step 1: Testing LinkedIn configuration...')
      const configResponse = await fetch('/api/test-linkedin-config')
      const configData = await configResponse.json()
      setResults((prev: any) => ({ ...prev, config: configData }))
      
      if (!configData.success) {
        throw new Error('LinkedIn configuration test failed')
      }
      
      setStep(2)
      
      // Step 2: Generate OAuth URL
      console.log('Step 2: Generating OAuth URL...')
      const testUserId = `debug-${Date.now()}`
      const oauthResponse = await fetch(`/api/auth/linkedin?userId=${testUserId}`)
      const oauthData = await oauthResponse.json()
      setResults((prev: any) => ({ ...prev, oauth: oauthData }))
      
      if (!oauthData.authUrl) {
        throw new Error('Failed to generate OAuth URL')
      }
      
      setStep(3)
      
      // Step 3: Parse OAuth URL
      console.log('Step 3: Parsing OAuth URL...')
      const url = new URL(oauthData.authUrl)
      const params = Object.fromEntries(url.searchParams.entries())
      setResults((prev: any) => ({ 
        ...prev, 
        parsedUrl: {
          baseUrl: url.origin + url.pathname,
          params: params,
          fullUrl: oauthData.authUrl
        }
      }))
      
      setStep(4)
      
      // Step 4: Test callback with invalid code (to see error handling)
      console.log('Step 4: Testing callback error handling...')
      const callbackResponse = await fetch('/api/auth/linkedin/callback?code=invalid-test-code&state=test-user')
      const location = callbackResponse.headers.get('location')
      setResults((prev: any) => ({ 
        ...prev, 
        callbackTest: {
          status: callbackResponse.status,
          location: location,
          message: 'Callback error handling test completed'
        }
      }))
      
      setStep(5)
      
      // Step 5: Provide instructions
      setResults((prev: any) => ({ 
        ...prev, 
        instructions: {
          message: 'Test completed. Check the results below and follow the instructions to test the actual OAuth flow.',
          nextSteps: [
            '1. Copy the OAuth URL from the results below',
            '2. Open it in a new tab',
            '3. Complete the LinkedIn authorization',
            '4. Check if you get redirected back to the app',
            '5. If you get an error, check the browser console and server logs'
          ]
        }
      }))
      
    } catch (error) {
      console.error('Test error:', error)
      setResults((prev: any) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    } finally {
      setLoading(false)
    }
  }

  const testRealOAuth = () => {
    if (results.oauth?.authUrl) {
      window.open(results.oauth.authUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LinkedIn OAuth Debug Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">OAuth Flow Test</h2>
          
          <div className="space-y-4">
            <button
              onClick={runFullTest}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? `Running Test (Step ${step})...` : 'Run Full OAuth Test'}
            </button>
            
            {results.oauth?.authUrl && (
              <button
                onClick={testRealOAuth}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-4"
              >
                Test Real OAuth Flow
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Test */}
          {results.config && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Step 1: Configuration Test</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.config, null, 2)}
              </pre>
            </div>
          )}

          {/* OAuth URL Test */}
          {results.oauth && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Step 2: OAuth URL Generation</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.oauth, null, 2)}
              </pre>
            </div>
          )}

          {/* Parsed URL */}
          {results.parsedUrl && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Step 3: Parsed OAuth URL</h3>
              <div className="space-y-2">
                <div>
                  <strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{results.parsedUrl.baseUrl}</code>
                </div>
                <div>
                  <strong>Parameters:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
                    {JSON.stringify(results.parsedUrl.params, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Full URL:</strong>
                  <a 
                    href={results.parsedUrl.fullUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all block mt-1"
                  >
                    {results.parsedUrl.fullUrl}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Callback Test */}
          {results.callbackTest && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Step 4: Callback Error Handling</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(results.callbackTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        {results.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Next Steps</h3>
            <p className="text-blue-700 mb-4">{results.instructions.message}</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              {results.instructions.nextSteps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {results.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{results.error}</p>
          </div>
        )}

        {/* LinkedIn App Configuration Check */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">LinkedIn Developer Portal Check</h3>
          <div className="space-y-3">
            <div>
              <strong className="text-yellow-800">Redirect URI:</strong>
              <code className="bg-yellow-100 px-2 py-1 rounded ml-2 text-sm">
                http://localhost:3000/api/auth/linkedin/callback
              </code>
            </div>
            <div>
              <strong className="text-yellow-800">Scopes:</strong>
              <code className="bg-yellow-100 px-2 py-1 rounded ml-2 text-sm">
                openid profile email
              </code>
            </div>
            <div>
              <strong className="text-yellow-800">Client ID:</strong>
              <code className="bg-yellow-100 px-2 py-1 rounded ml-2 text-sm">
                86osahl2qwesp9
              </code>
            </div>
            <p className="text-yellow-700 text-sm mt-3">
              Make sure these values match exactly in your LinkedIn Developer Portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
