'use client'

import { useState, useEffect } from 'react'
import { 
  Linkedin, 
  MessageSquare, 
  Users, 
  Search, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { LinkedInConnection, LinkedInMessage } from '@/lib/types'

export default function LinkedInAutomation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connections, setConnections] = useState<LinkedInConnection[]>([])
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [messageResults, setMessageResults] = useState<LinkedInMessage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LinkedInConnection[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/automation?action=status')
      const data = await response.json()
      setIsLoggedIn(data.isLoggedIn)
    } catch (error) {
      console.error('Error checking login status:', error)
    }
  }

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert('Please enter both email and password')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginForm.email,
          password: loginForm.password
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setIsLoggedIn(true)
        alert('Logged in successfully!')
      } else if (data.requires2FA) {
        alert('2FA verification required! Please complete the verification in the browser window, then click "Check Login Status" to continue.')
        // Don't set isLoggedIn to true yet, wait for 2FA completion
      } else {
        alert('Login failed: ' + (data.error || data.message))
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' })
      })
      
      setIsLoggedIn(false)
      setConnections([])
      setSelectedConnections([])
      setMessageResults([])
      alert('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestartBrowser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' })
      })
      const data = await response.json()
      if (data.success) {
        alert('Browser restarted successfully! You can now try logging in again.')
      } else {
        alert('Failed to restart browser: ' + data.error)
      }
    } catch (error) {
      console.error('Restart error:', error)
      alert('Failed to restart browser')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConnections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/automation?action=connections')
      const data = await response.json()
      setConnections(data.connections)
    } catch (error) {
      console.error('Error fetching connections:', error)
      alert('Failed to fetch connections')
    } finally {
      setIsLoading(false)
    }
  }

  const searchPeople = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchPeople',
          query: searchQuery
        })
      })

      const data = await response.json()
      setSearchResults(data.people)
      
      // If searching for Mark Butcher, automatically select him
      if (searchQuery.toLowerCase().includes('mark butcher') || searchQuery.toLowerCase().includes('mark') && searchQuery.toLowerCase().includes('butcher')) {
        const markButcher = data.people.find((person: LinkedInConnection) => person.name === 'Mark Butcher')
        if (markButcher) {
          setSelectedConnections([markButcher.id])
          alert('Mark Butcher found and selected! You can now send him a message.')
        }
      }
    } catch (error) {
      console.error('Error searching people:', error)
      alert('Failed to search people')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessages = async () => {
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    if (selectedConnections.length === 0) {
      alert('Please select at least one connection')
      return
    }

    // Combine connections and search results for messaging
    const allPeople = [...connections, ...searchResults]
    const peopleToMessage = allPeople.filter(person => 
      selectedConnections.includes(person.id)
    )

    setIsLoading(true)
    try {
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          message,
          connections: peopleToMessage
        })
      })

      const data = await response.json()
      setMessageResults(data.results)
      
      const successCount = data.results.filter((r: LinkedInMessage) => r.status === 'sent').length
      alert(`Messages sent: ${successCount}/${data.results.length}`)
    } catch (error) {
      console.error('Error sending messages:', error)
      alert('Failed to send messages')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleConnectionSelection = (connectionId: string) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const toggleSearchResultSelection = (personId: string) => {
    setSelectedConnections(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    )
  }

  const selectAllConnections = () => {
    setSelectedConnections(connections.map(conn => conn.id))
  }

  const deselectAllConnections = () => {
    setSelectedConnections([])
  }

  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center mb-6">
            <Linkedin className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">LinkedIn Automation</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Linkedin className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Logging in...' : 'Login to LinkedIn'}
              </button>
              
              <button
                onClick={checkLoginStatus}
                disabled={isLoading}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Check Login Status
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will open a browser window for LinkedIn login. 
              Keep the window open for automation to work.
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              <strong>2FA:</strong> If LinkedIn requires text message verification, complete it in the browser window, 
              then click "Check Login Status" to continue.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Linkedin className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">LinkedIn Automation</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRestartBrowser}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              {isLoading ? 'Restarting...' : 'Restart Browser'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connections Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Connections
              </h3>
              <button
                onClick={fetchConnections}
                disabled={isLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
              </button>
            </div>

            {connections.length > 0 && (
              <div className="mb-4 flex space-x-2">
                <button
                  onClick={selectAllConnections}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllConnections}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Deselect All
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedConnections.includes(connection.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleConnectionSelection(connection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{connection.name}</h4>
                      <p className="text-sm text-gray-600">{connection.headline}</p>
                      <p className="text-xs text-gray-500">{connection.company}</p>
                    </div>
                    {selectedConnections.includes(connection.id) && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <MessageSquare className="w-5 h-5 mr-2" />
              Send Messages
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your message here..."
                />
              </div>

              <button
                onClick={sendMessages}
                disabled={isLoading || selectedConnections.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send to {selectedConnections.length} Connection(s)
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Search className="w-5 h-5 mr-2" />
            Search People
          </h3>

          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for people (e.g., 'Mark Butcher' or 'Software Engineer at Google')"
            />
            <button
              onClick={searchPeople}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Try searching for "Mark Butcher" to find and message your test contact. 
              He will be automatically selected when found!
            </p>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((person) => (
                <div 
                  key={person.id} 
                  className={`p-3 border rounded-md cursor-pointer hover:border-blue-300 ${
                    selectedConnections.includes(person.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleSearchResultSelection(person.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{person.name}</h4>
                      <p className="text-sm text-gray-600">{person.headline}</p>
                      <p className="text-xs text-gray-500">{person.company}</p>
                    </div>
                    {selectedConnections.includes(person.id) && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Results */}
        {messageResults.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Results</h3>
            <div className="space-y-2">
              {messageResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div>
                    <span className="font-medium">{result.recipientName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(result.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {result.status === 'sent' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="ml-2 text-sm capitalize">{result.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
