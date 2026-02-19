'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  MessageSquare, 
  Search, 
  Filter, 
  Send,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { ConnectionStatus, MessageStatus } from '@/lib/types'
import { useUser } from '@/contexts/UserContext'

interface LinkedInConnection {
  id: string
  linkedinId: string
  name: string
  title?: string
  company?: string
  profileUrl: string
  connectionUrl?: string
  status: ConnectionStatus
  connectedAt?: string
  messages: LinkedInMessage[]
}

interface LinkedInMessage {
  id: string
  content: string
  messageType: string
  sentAt?: string
  status: MessageStatus
}

export default function Connections() {
  const { user, isLoading } = useUser()
  const [connections, setConnections] = useState<LinkedInConnection[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [isAutoSearching, setIsAutoSearching] = useState(false)
  const [autoSearchComplete, setAutoSearchComplete] = useState(false)
  const [searchStats, setSearchStats] = useState<{
    totalFound: number
    companies: string[]
    lastSearch: Date | null
  }>({
    totalFound: 0,
    companies: [],
    lastSearch: null
  })

  // Load connections from API
  const loadConnections = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingConnections(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/linkedin/connections?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      } else {
        setError('Failed to load connections')
      }
    } catch (error) {
      console.error('Error loading connections:', error)
      setError('Failed to load connections')
    } finally {
      setIsLoadingConnections(false)
    }
  }, [user?.id])

  // Auto-search function for high-value connections
  const performAutoSearch = useCallback(async () => {
    if (!user?.id || isAutoSearching) return
    
    setIsAutoSearching(true)
    setError(null)
    
    try {
      console.log('Starting automatic LinkedIn search for high-value connections...')
      
      const response = await fetch('/api/linkedin/auto-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchStats({
          totalFound: data.profiles?.length || 0,
          companies: data.companies || [],
          lastSearch: new Date()
        })
        setAutoSearchComplete(true)
        
        // Reload connections to show the new results
        await loadConnections()
        
        console.log(`Auto-search completed: Found ${data.profiles?.length || 0} connections from ${data.companies?.length || 0} companies`)
      } else {
        setError('Auto-search failed')
      }
    } catch (error) {
      console.error('Error performing auto-search:', error)
      setError('Auto-search failed')
    } finally {
      setIsAutoSearching(false)
    }
  }, [user?.id, isAutoSearching, loadConnections])

  // Load connections and trigger auto-search
  useEffect(() => {
    if (user?.id) {
      loadConnections()
      
      // Trigger auto-search after a short delay to allow connections to load
      const timer = setTimeout(() => {
        if (!autoSearchComplete) {
          performAutoSearch()
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user?.id, loadConnections, performAutoSearch, autoSearchComplete])

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conn.company && conn.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (conn.title && conn.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case ConnectionStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-500" />
      case ConnectionStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />
      case ConnectionStatus.BLOCKED:
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ConnectionStatus) => {
    const colors = {
      [ConnectionStatus.CONNECTED]: 'bg-green-100 text-green-800',
      [ConnectionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ConnectionStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ConnectionStatus.BLOCKED]: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENT:
        return <Send className="w-3 h-3 text-blue-500" />
      case MessageStatus.DELIVERED:
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case MessageStatus.READ:
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case MessageStatus.FAILED:
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusCounts = () => {
    const counts = {
      total: connections.length,
      connected: connections.filter(conn => conn.status === ConnectionStatus.CONNECTED).length,
      pending: connections.filter(conn => conn.status === ConnectionStatus.PENDING).length,
      rejected: connections.filter(conn => conn.status === ConnectionStatus.REJECTED).length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  const handleConnectionSelect = (connectionId: string) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const handleSendMessage = async (_connectionId: string, _message: string) => {
    // LinkedIn automation has been removed
    console.warn('LinkedIn messaging is no longer available')
  }

  const handleSendConnectionRequest = async (_connection: LinkedInConnection) => {
    // LinkedIn automation has been removed
    console.warn('LinkedIn connection requests are no longer available')
  }

  const handleRefreshConnections = () => {
    loadConnections()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">LinkedIn Connections</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your LinkedIn connections and messaging
            </p>
          </div>
          <button
            onClick={handleRefreshConnections}
            disabled={isLoadingConnections}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingConnections ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Connected</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.connected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Search Status Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              High-Value Connections
            </h3>
            {isAutoSearching && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Searching LinkedIn...
              </div>
            )}
          </div>
          
          {autoSearchComplete && searchStats.lastSearch && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">
                    Auto-search completed successfully!
                  </h4>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Found {searchStats.totalFound} high-value connections from {searchStats.companies.length} companies</p>
                    <p className="mt-1">Companies searched: {searchStats.companies.join(', ')}</p>
                    <p className="mt-1">Last search: {searchStats.lastSearch.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Connections
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Search by name, company, or title..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
              >
                <option value="all">All Types</option>
                <option value="1st_degree">1st Degree Connections</option>
                <option value="recruiter">Recruiters</option>
                <option value="sales_manager">Sales Managers</option>
                <option value={ConnectionStatus.CONNECTED}>Connected</option>
                <option value={ConnectionStatus.PENDING}>Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white">
                <option value="priority">Priority (1st degree first)</option>
                <option value="mutual">Mutual Connections</option>
                <option value="name">Name</option>
                <option value="company">Company</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={performAutoSearch}
                disabled={isAutoSearching}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Refresh Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Connections List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Connections ({filteredConnections.length})
            </h3>
            {selectedConnections.length > 0 && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Selected ({selectedConnections.length})
              </button>
            )}
          </div>

          {isLoadingConnections ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading connections...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start connecting with people to see them here.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConnections.map((connection) => (
                <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {connection.name}
                        </h4>
                        {getStatusBadge(connection.status)}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {connection.title} at {connection.company}
                      </p>
                      
                      {connection.connectedAt && (
                        <p className="text-xs text-gray-500 mb-3">
                          Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                        </p>
                      )}
                      
                      {/* Messages */}
                      {connection.messages.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Recent Messages:</h5>
                          {connection.messages.map((message) => (
                            <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-700">{message.content}</p>
                                <div className="flex items-center space-x-1 ml-2">
                                  {getMessageStatusIcon(message.status)}
                                  <span className="text-xs text-gray-500">
                                    {message.sentAt && new Date(message.sentAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="mt-4 flex items-center space-x-2">
                        {connection.status === ConnectionStatus.PENDING && (
                          <button
                            onClick={() => handleSendConnectionRequest(connection)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Send Request
                          </button>
                        )}
                        
                        {connection.status === ConnectionStatus.CONNECTED && (
                          <button
                            onClick={() => handleSendMessage(connection.id, 'Hello!')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Send Message
                          </button>
                        )}
                        
                        <a
                          href={connection.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedConnections.includes(connection.id)}
                        onChange={() => handleConnectionSelect(connection.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      {getStatusIcon(connection.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
