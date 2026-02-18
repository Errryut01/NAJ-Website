'use client'

import { useState } from 'react'

export default function TestLinkedInOAuth() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOAuthFlow = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      // Step 1: Generate OAuth URL
      console.log('Step 1: Generating OAuth URL...')
      const testUserId = `test-${Date.now()}`
      const response = await fetch(`/api/auth/linkedin?userId=${testUserId}`)
      const data = await response.json()
      
      if (!data.authUrl) {
        throw new Error('Failed to generate OAuth URL')
      }
      
      // Step 2: Parse the OAuth URL
      const url = new URL(data.authUrl)
      const params = Object.fromEntries(url.searchParams.entries())
      
      setResults({
        step1: {
          success: true,
          message: 'OAuth URL generated successfully',
          url: data.authUrl,
          userId: testUserId
        },
        step2: {
          success: true,
          message: 'OAuth URL parsed successfully',
          baseUrl: url.origin + url.pathname,
          parameters: params,
          hasNonce: !!params.nonce,
          hasState: !!params.state,
          hasScope: !!params.scope,
          scopeValue: params.scope
        },
        instructions: {
          message: 'OAuth URL is ready for testing',
          nextSteps: [
            '1. Copy the OAuth URL below',
            '2. Open it in a new tab',
            '3. Complete the LinkedIn authorization',
            '4. Check if you get redirected back to the app',
            '5. If you get an error, check the browser console and server logs'
          ]
        }
      })
      
    } catch (error) {
      console.error('Test error:', error)
      setResults({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const openOAuthURL = () => {
    if (results?.step1?.url) {
      window.open(results.step1.url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LinkedIn OAuth Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">OAuth Flow Test</h2>
          
          <div className="space-y-4">
            <button
              onClick={testOAuthFlow}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test OAuth URL Generation'}
            </button>
            
            {results?.step1?.url && (
              <button
                onClick={openOAuthURL}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-4"
              >
                Open OAuth URL in New Tab
              </button>
            )}
          </div>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Step 1 Results */}
            {results.step1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-green-600 mb-4">Step 1: OAuth URL Generation</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Status:</strong> <span className="text-green-600">Success</span>
                  </div>
                  <div>
                    <strong>User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{results.step1.userId}</code>
                  </div>
                  <div>
                    <strong>OAuth URL:</strong>
                    <div className="mt-1">
                      <a 
                        href={results.step1.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {results.step1.url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Results */}
            {results.step2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-green-600 mb-4">Step 2: OAuth URL Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{results.step2.baseUrl}</code>
                  </div>
                  <div>
                    <strong>Has Nonce:</strong> <span className={results.step2.hasNonce ? 'text-green-600' : 'text-red-600'}>{results.step2.hasNonce ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <strong>Has State:</strong> <span className={results.step2.hasState ? 'text-green-600' : 'text-red-600'}>{results.step2.hasState ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <strong>Has Scope:</strong> <span className={results.step2.hasScope ? 'text-green-600' : 'text-red-600'}>{results.step2.hasScope ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <strong>Scope Value:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{results.step2.scopeValue}</code>
                  </div>
                  <div>
                    <strong>All Parameters:</strong>
                    <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-auto">
                      {JSON.stringify(results.step2.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {results.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{results.error.message}</p>
                {results.error.details && (
                  <pre className="bg-red-100 p-3 rounded text-sm mt-2 overflow-auto">
                    {JSON.stringify(results.error.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* LinkedIn App Configuration Check */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">LinkedIn Developer Portal Configuration</h3>
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
            <div className="mt-4">
              <strong className="text-yellow-800">Important Notes:</strong>
              <ul className="list-disc list-inside text-yellow-700 text-sm mt-2 space-y-1">
                <li>Make sure your LinkedIn app is configured for OpenID Connect</li>
                <li>The redirect URI must match exactly (including protocol and port)</li>
                <li>Scopes must be enabled in your LinkedIn app settings</li>
                <li>If you're still getting errors, try creating a new LinkedIn app</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
