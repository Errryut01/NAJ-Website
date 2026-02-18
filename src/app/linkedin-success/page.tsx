'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useUser, UserProvider } from '@/contexts/UserContext'

function LinkedInSuccessContent() {
  const { refreshProfile } = useUser()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const details = urlParams.get('details')

    if (error) {
      setStatus('error')
      setMessage('LinkedIn connection failed')
      if (details) {
        try {
          const errorDetails = JSON.parse(decodeURIComponent(details))
          setDetails(JSON.stringify(errorDetails, null, 2))
        } catch (e) {
          setDetails(details)
        }
      }
    } else {
      setStatus('success')
      setMessage('LinkedIn connected successfully!')
      
      // Refresh the user profile data
      refreshProfile().then(() => {
        // Redirect to dashboard after a short delay to allow profile refresh
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }).catch((error) => {
        console.error('Error refreshing profile:', error)
        // Still redirect even if refresh fails
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      })
    }
  }, [refreshProfile])

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            LinkedIn Connection
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className={`mt-8 rounded-lg border p-6 ${getStatusColor()}`}>
          <h3 className="text-lg font-medium mb-4">
            {status === 'success' ? '✅ Success!' : status === 'error' ? '❌ Error' : '⏳ Processing...'}
          </h3>
          
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Your LinkedIn account has been successfully connected to the Job Search Automation platform.
              </p>
              <div className="space-y-2">
                <a
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/debug"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Test Again
                </a>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                There was an error connecting your LinkedIn account. This could be due to:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>LinkedIn service temporarily unavailable</li>
                <li>Invalid or expired authorization code</li>
                <li>App configuration issues</li>
                <li>Network connectivity problems</li>
              </ul>
              
              {details && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Error Details:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {details}
                  </pre>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/debug'}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Processing your LinkedIn connection...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you continue to experience issues, please check the server logs for more details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LinkedInSuccessPage() {
  return (
    <UserProvider>
      <LinkedInSuccessContent />
    </UserProvider>
  )
}
