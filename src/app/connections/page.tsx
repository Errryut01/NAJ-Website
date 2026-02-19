'use client'

import { useState, useEffect } from 'react'
import { useUser, UserProvider } from '@/contexts/UserContext'
import { ArrowLeft, Users, Building2, UserCheck, UserPlus, Search, Filter, MapPin, Briefcase, X, UserX } from 'lucide-react'
import Link from 'next/link'

interface Connection {
  id: string
  name: string
  title: string
  company: string
  location: string
  connectionType: 'existing' | 'recruiter' | 'hiring_manager' | 'potential'
  profileUrl?: string
  mutualConnections?: number
  sharedExperience?: string[]
  lastInteraction?: string
  isConnection: boolean
  searchCriteria?: string
}

interface CompanyConnections {
  company: string
  connections: Connection[]
  totalConnections: number
  existingConnections: number
  potentialConnections: number
  recruiters: number
  hiringManagers: number
}

function ConnectionsPageContent() {
  const { user, profile, isLoading } = useUser()
  const [targetCompanies, setTargetCompanies] = useState<string[]>([])
  const [companyConnections, setCompanyConnections] = useState<CompanyConnections[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [optedOutConnections, setOptedOutConnections] = useState<Set<string>>(new Set())

  // Debug user context
  useEffect(() => {
    console.log('User context updated:', { user, profile, isLoading })
  }, [user, profile, isLoading])

  // Load opted-out connections from localStorage
  useEffect(() => {
    const savedOptedOut = localStorage.getItem('optedOutConnections')
    if (savedOptedOut) {
      try {
        const parsed = JSON.parse(savedOptedOut)
        setOptedOutConnections(new Set(parsed))
      } catch (error) {
        console.error('Error loading opted-out connections:', error)
      }
    }
  }, [])

  // Save opted-out connections to localStorage
  useEffect(() => {
    localStorage.setItem('optedOutConnections', JSON.stringify([...optedOutConnections]))
  }, [optedOutConnections])

  // Handle opt-out toggle
  const handleOptOut = (connectionId: string) => {
    setOptedOutConnections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId)
      } else {
        newSet.add(connectionId)
      }
      return newSet
    })
  }

  // Load target companies from sessionStorage
  useEffect(() => {
    const companies = sessionStorage.getItem('targetCompanies')
    console.log('Loading target companies from sessionStorage:', companies)
    if (companies) {
      try {
        const parsedCompanies = JSON.parse(companies)
        console.log('Parsed companies:', parsedCompanies)
        setTargetCompanies(parsedCompanies)
        if (parsedCompanies.length > 0) {
          setSelectedCompany(parsedCompanies[0])
        }
      } catch (error) {
        console.error('Error parsing target companies:', error)
      }
    } else {
      console.log('No target companies found in sessionStorage')
    }
  }, [])

  // Fetch connections for target companies
  useEffect(() => {
    if (targetCompanies.length > 0 && !isLoading && user?.id) {
      console.log('Triggering fetchConnections - user loaded:', user.id)
      fetchConnections()
    } else {
      console.log('Not fetching connections yet:', { 
        hasTargetCompanies: targetCompanies.length > 0, 
        isLoading, 
        hasUserId: !!user?.id 
      })
    }
  }, [targetCompanies, user, isLoading])

  const fetchConnections = async () => {
    console.log('fetchConnections called with:', { userId: user?.id, targetCompanies })
    if (!user?.id || targetCompanies.length === 0) {
      console.log('Skipping fetch - missing user ID or target companies')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/linkedin/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetCompanies: targetCompanies
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Connections API response:', data)
      
      if (data.success) {
        console.log('Setting company connections:', data.companyConnections)
        setCompanyConnections(data.companyConnections || [])
      } else {
        console.error('Failed to fetch connections:', data.error)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredConnections = (company: string) => {
    const companyData = companyConnections.find(c => c.company === company)
    if (!companyData) {
      console.log(`No company data found for: ${company}`)
      return []
    }

    let filtered = companyData.connections
    console.log(`Found ${filtered.length} connections for ${company}:`, filtered.map(c => ({name: c.name, type: c.connectionType})))

    // Filter out opted-out connections
    filtered = filtered.filter(conn => !optedOutConnections.has(conn.id))
    console.log(`After opt-out filter: ${filtered.length} connections`)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(conn => 
        conn.name.toLowerCase().includes(query) ||
        conn.title.toLowerCase().includes(query) ||
        conn.company.toLowerCase().includes(query)
      )
      console.log(`After search filter (${searchQuery}): ${filtered.length} connections`)
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(conn => conn.connectionType === filterType)
      console.log(`After type filter (${filterType}): ${filtered.length} connections`)
    }

    console.log(`Final filtered connections for ${company}: ${filtered.length}`)
    return filtered
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'existing':
        return <UserCheck className="w-4 h-4 text-green-600" />
      case 'recruiter':
        return <Users className="w-4 h-4 text-blue-600" />
      case 'hiring_manager':
        return <Briefcase className="w-4 h-4 text-purple-600" />
      default:
        return <UserPlus className="w-4 h-4 text-gray-600" />
    }
  }

  const getConnectionBadgeColor = (type: string) => {
    switch (type) {
      case 'existing':
        return 'bg-green-100 text-green-800'
      case 'recruiter':
        return 'bg-blue-100 text-blue-800'
      case 'hiring_manager':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loading...</h3>
          <p className="mt-2 text-sm text-gray-500">Please wait while we load your profile.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm text-gray-500">You need to be logged in to view connections.</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Data Indicator */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Test Data Mode:</strong> The LinkedIn API quota has been exceeded. You are currently viewing sample profiles with "[TEST PROFILE]" and "[TEST]" indicators in the Connections section. These are realistic mock profiles based on your actual target companies.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-base font-bold text-gray-700 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
                <p className="mt-1 text-base font-medium text-gray-700">
                  LinkedIn connections at your target companies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Summary */}
        {companyConnections.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connection Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {companyConnections.reduce((sum, company) => sum + company.existingConnections, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">1st Degree Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {companyConnections.reduce((sum, company) => sum + company.recruiters, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Recruiters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {companyConnections.reduce((sum, company) => sum + company.hiringManagers, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Hiring Managers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {companyConnections.reduce((sum, company) => sum + company.potentialConnections, 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Potential Connections</div>
              </div>
            </div>
          </div>
        )}

        {/* Opted-Out Connections Summary */}
        {optedOutConnections.size > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-2">Opted-Out Connections</h2>
                <p className="text-sm text-red-700">
                  {optedOutConnections.size} people have been opted out of contact by the app
                </p>
              </div>
              <button
                onClick={() => {
                  const allConnections = companyConnections.flatMap(c => c.connections)
                  const optedOutList = allConnections.filter(c => optedOutConnections.has(c.id))
                  console.log('Opted-out connections:', optedOutList)
                  alert(`Opted-out connections:\n${optedOutList.map(c => `• ${c.name} (${c.title} at ${c.company})`).join('\n')}`)
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200"
              >
                View List
              </button>
            </div>
          </div>
        )}

        {/* Target Companies Summary */}
        {targetCompanies.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Target Companies</h2>
            <div className="flex flex-wrap gap-2">
              {targetCompanies.map((company, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-base font-bold ${
                    selectedCompany === company
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-base font-bold text-gray-900 mb-2">
                Search connections
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, title, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-900 font-medium"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="filter" className="block text-base font-bold text-gray-900 mb-2">
                Filter by type
              </label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-900 font-medium"
              >
                <option value="all">All Types</option>
                <option value="existing">Existing Connections</option>
                <option value="recruiter">Recruiters</option>
                <option value="hiring_manager">Hiring Managers</option>
                <option value="potential">Potential Connections</option>
              </select>
            </div>
          </div>
        </div>

        {/* Company Tabs */}
        {targetCompanies.length > 1 && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {targetCompanies.map((company) => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className={`py-2 px-1 border-b-2 font-bold text-base ${
                      selectedCompany === company
                        ? 'border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading connections...</p>
          </div>
        )}

        {/* Contact Warning - Right before connections list */}
        {!loading && selectedCompany && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Important:</strong> All of these people may be contacted over time if you do not elect to opt them out. Please review carefully and use the "Opt Out" button for anyone you do not want the app to contact.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connections Content */}
        {!loading && selectedCompany && (
          <div className="bg-white rounded-lg shadow">
            {(() => {
              const companyData = companyConnections.find(c => c.company === selectedCompany)
              const filteredConnections = getFilteredConnections(selectedCompany)
              
              if (!companyData) {
                return (
                  <div className="p-6 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No LinkedIn connections found for {selectedCompany}.
                    </p>
                  </div>
                )
              }

              return (
                <>
                  {/* Company Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedCompany}</h2>
                        <div className="mt-1 flex items-center space-x-6 text-sm text-gray-700 font-medium">
                          <span className="flex items-center">
                            <UserCheck className="w-4 h-4 mr-1 text-green-600" />
                            {companyData.existingConnections} 1st degree
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-blue-600" />
                            {companyData.recruiters} recruiters
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1 text-purple-600" />
                            {companyData.hiringManagers} hiring managers
                          </span>
                          <span className="flex items-center">
                            <UserPlus className="w-4 h-4 mr-1 text-gray-600" />
                            {companyData.potentialConnections} potential
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{companyData.totalConnections}</div>
                        <div className="text-sm text-gray-700 font-medium">total connections</div>
                      </div>
                    </div>
                  </div>

                  {/* Connections List */}
                  <div className="divide-y divide-gray-200">
                    {filteredConnections.map((connection) => (
                      <div key={connection.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-base font-bold text-gray-900 truncate">
                                  {connection.name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConnectionBadgeColor(connection.connectionType)}`}>
                                    {getConnectionIcon(connection.connectionType)}
                                    <span className="ml-1 capitalize">
                                      {connection.connectionType.replace('_', ' ')}
                                    </span>
                                  </span>
                                  {connection.title && connection.title.includes('[TEST]') && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      🧪 TEST DATA
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-900">
                                <span className="truncate font-semibold">{connection.title}</span>
                                <span className="flex items-center text-gray-800">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  <span className="font-medium">{connection.company}</span>
                                </span>
                                <span className="flex items-center text-gray-800">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {connection.location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                {connection.mutualConnections && connection.mutualConnections > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-3 h-3 text-green-600" />
                                    <p className="text-sm text-green-700 font-medium">
                                      {connection.mutualConnections} mutual connections
                                    </p>
                                  </div>
                                )}
                                {connection.isConnection && (
                                  <div className="flex items-center space-x-1">
                                    <UserCheck className="w-3 h-3 text-blue-600" />
                                    <span className="text-sm text-blue-700 font-medium">1st Degree Connection</span>
                                  </div>
                                )}
                                {connection.searchCriteria && (
                                  <span className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded font-medium">
                                    Found via: {connection.searchCriteria}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {connection.isConnection ? (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  1st Degree
                                </span>
                                {connection.lastInteraction && (
                                  <span className="text-xs text-gray-500 mt-1">
                                    Last: {connection.lastInteraction}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <button 
                                  onClick={() => handleOptOut(connection.id)}
                                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                    optedOutConnections.has(connection.id)
                                      ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {optedOutConnections.has(connection.id) ? (
                                    <>
                                      <UserX className="w-3 h-3 mr-1" />
                                      Opted Out
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 mr-1" />
                                      Opt Out
                                    </>
                                  )}
                                </button>
                                {connection.mutualConnections && connection.mutualConnections > 0 && (
                                  <span className="text-xs text-gray-500 mt-1">
                                    {connection.mutualConnections} mutual
                                  </span>
                                )}
                              </div>
                            )}
                            {connection.profileUrl && (
                              <a
                                href={connection.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                              >
                                View Profile
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredConnections.length === 0 && (
                    <div className="px-6 py-8 text-center">
                      <Filter className="mx-auto h-8 w-8 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No connections match your filters</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* No Companies State */}
        {!loading && targetCompanies.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No target companies</h3>
            <p className="mt-1 text-sm text-gray-500">
              No companies found from your job search. Try searching for jobs first.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Job Search
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <UserProvider>
      <ConnectionsPageContent />
    </UserProvider>
  )
}
