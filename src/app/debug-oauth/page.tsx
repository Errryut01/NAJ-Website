'use client'

import { useState } from 'react'

export default function DebugOAuth() {
  const [step, setStep] = useState(1)
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testOAuthFlow = async () => {
    setLoading(true)
    setStep(1)
    
    try {
      // Step 1: Generate OAuth URL
      console.log('Step 1: Generating OAuth URL...')
      const testUserId = `debug-user-${Date.now()}`
      const response = await fetch(`/api/auth/linkedin?userId=${testUserId}`)
      const data = await response.json()
      
      setResults(prev => ({ ...prev, step1: data }))
      console.log('Step 1 result:', data)
      
      if (data.authUrl) {
        setStep(2)
        console.log('Step 2: OAuth URL generated successfully')
        console.log('OAuth URL:', data.authUrl)
        
        // Step 2: Test the OAuth URL (we'll just show it, not redirect)
        setResults(prev => ({ 
          ...prev, 
          step2: { 
            message: 'OAuth URL generated successfully',
            url: data.authUrl,
            userId: testUserId
          }
        }))
      } else {
        throw new Error('Failed to generate OAuth URL')
      }
      
    } catch (error) {
      console.error('OAuth flow test error:', error)
      setResults(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    } finally {
      setLoading(false)
    }
  }

  const testCallback = async () => {
    setLoading(true)
    try {
      // Test callback with a mock code
      console.log('Testing callback endpoint...')
      const testUrl = '/api/auth/linkedin/callback?code=test-code&state=test-user&error='
      const response = await fetch(testUrl)
      
      console.log('Callback test response:', response.status)
      const location = response.headers.get('location')
      console.log('Redirect location:', location)
      
      setResults(prev => ({ 
        ...prev, 
        callbackTest: { 
          status: response.status,
          location: location,
          message: 'Callback endpoint test completed'
        }
      }))
      
    } catch (error) {
      console.error('Callback test error:', error)
      setResults(prev => ({ 
        ...prev, 
        callbackError: error instanceof Error ? error.message : 'Unknown error' 
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LinkedIn OAuth Debug Tool</h1>
        
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
            
            <button
              onClick={testCallback}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Callback Endpoint'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-4">
            {results.step1 && (
              <div className="border rounded p-4">
                <h3 className="font-semibold text-green-600">Step 1: OAuth URL Generation</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.step1, null, 2)}
                </pre>
              </div>
            )}
            
            {results.step2 && (
              <div className="border rounded p-4">
                <h3 className="font-semibold text-green-600">Step 2: OAuth URL Details</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.step2, null, 2)}
                </pre>
                {results.step2.url && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">OAuth URL:</p>
                    <a 
                      href={results.step2.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all"
                    >
                      {results.step2.url}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {results.callbackTest && (
              <div className="border rounded p-4">
                <h3 className="font-semibold text-green-600">Callback Test</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(results.callbackTest, null, 2)}
                </pre>
              </div>
            )}
            
            {results.error && (
              <div className="border border-red-200 bg-red-50 rounded p-4">
                <h3 className="font-semibold text-red-600">Error</h3>
                <p className="text-red-800">{results.error}</p>
              </div>
            )}
            
            {results.callbackError && (
              <div className="border border-red-200 bg-red-50 rounded p-4">
                <h3 className="font-semibold text-red-600">Callback Error</h3>
                <p className="text-red-800">{results.callbackError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
