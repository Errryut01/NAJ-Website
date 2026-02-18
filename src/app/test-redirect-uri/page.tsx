'use client'

import { useState } from 'react'

export default function TestRedirectURI() {
  const [result, setResult] = useState<any>(null)

  const testRedirectURI = () => {
    const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback'
    const encodedUri = encodeURIComponent(redirectUri)
    
    setResult({
      original: redirectUri,
      encoded: encodedUri,
      decoded: decodeURIComponent(encodedUri),
      matches: redirectUri === decodeURIComponent(encodedUri)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Redirect URI Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testRedirectURI}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Test Redirect URI Encoding
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-2">
              <div>
                <strong>Original URI:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.original}</code>
              </div>
              <div>
                <strong>Encoded URI:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.encoded}</code>
              </div>
              <div>
                <strong>Decoded URI:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.decoded}</code>
              </div>
              <div>
                <strong>Matches:</strong> <span className={result.matches ? 'text-green-600' : 'text-red-600'}>{result.matches ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">LinkedIn Developer Portal Check</h2>
          <p className="text-yellow-700 mb-4">
            Make sure your LinkedIn Developer Portal has this exact redirect URI configured:
          </p>
          <code className="bg-yellow-100 px-3 py-2 rounded block text-sm">
            http://localhost:3000/api/auth/linkedin/callback
          </code>
          <p className="text-yellow-700 mt-4 text-sm">
            The URI must match exactly, including the protocol (http), port (3000), and path.
          </p>
        </div>
      </div>
    </div>
  )
}
