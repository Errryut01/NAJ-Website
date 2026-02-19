'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Filter, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react'
import { ApplicationStatus } from '@/lib/types'
import { useUser } from '@/contexts/UserContext'

interface JobApplication {
  id: string
  jobTitle: string
  company: string
  location?: string
  status: ApplicationStatus
  appliedAt?: string
  resumeUrl?: string
  coverLetterUrl?: string
  jobUrl?: string
  salary?: string
  linkedinJobId?: string
  hiringManagerId?: string
  currentStage?: string
  nextActions?: string[]
  lastContactDate?: string
  notes?: string
  source?: string
}

export default function Applications() {
  const { user, applicationsRefreshTrigger } = useUser()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [editingApplication, setEditingApplication] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      console.log('Fetching applications for user:', user.id)
      const response = await fetch(`/api/applications?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Applications fetched:', data.applications?.length || 0)
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications:', response.status)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Refresh applications when trigger changes (from job application)
  useEffect(() => {
    if (applicationsRefreshTrigger > 0) {
      console.log('Applications refresh triggered:', applicationsRefreshTrigger)
      fetchApplications()
    }
  }, [applicationsRefreshTrigger, fetchApplications])

  // Note: Removed automatic refresh interval since we have refresh trigger mechanism
  // Applications will refresh when jobs are applied via the refresh trigger

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return <Clock className="w-4 h-4 text-yellow-500" />
      case ApplicationStatus.INTERVIEW:
        return <Calendar className="w-4 h-4 text-blue-500" />
      case ApplicationStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />
      case ApplicationStatus.OFFER:
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const colors = {
      [ApplicationStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [ApplicationStatus.APPLIED]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.INTERVIEW]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApplicationStatus.OFFER]: 'bg-green-100 text-green-800',
      [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getStatusCounts = () => {
    const counts = {
      total: applications.length,
      applied: applications.filter(app => app.status === ApplicationStatus.APPLIED).length,
      interview: applications.filter(app => app.status === ApplicationStatus.INTERVIEW).length,
      rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
      offer: applications.filter(app => app.status === ApplicationStatus.OFFER).length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
            <p className="mt-2 text-sm text-gray-600">
              Track and manage your job applications
            </p>
          </div>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-gray-400" />
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
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Applied</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.applied}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.interview}</dd>
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Offers</dt>
                  <dd className="text-lg font-medium text-gray-900">{statusCounts.offer}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Applications
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
                placeholder="Search by job title or company..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value={ApplicationStatus.APPLIED}>Applied</option>
              <option value={ApplicationStatus.INTERVIEW}>Interview</option>
              <option value={ApplicationStatus.REJECTED}>Rejected</option>
              <option value={ApplicationStatus.OFFER}>Offer</option>
              <option value={ApplicationStatus.WITHDRAWN}>Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white">
              <option value="appliedAt">Applied Date</option>
              <option value="company">Company</option>
              <option value="jobTitle">Job Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Applications ({filteredApplications.length})
          </h3>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start applying to jobs to see them here.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {application.jobTitle}
                        </h4>
                        {getStatusBadge(application.status)}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {application.company} • {application.location}
                      </p>
                      
                      {application.salary && (
                        <p className="text-sm text-green-600 font-medium mb-2">
                          {application.salary}
                        </p>
                      )}

                      {/* Application Stage and Next Actions */}
                      {application.currentStage && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-blue-900">Current Stage</h5>
                            <span className="text-xs text-blue-600">{application.currentStage}</span>
                          </div>
                          
                          {application.nextActions && application.nextActions.length > 0 && (
                            <div>
                              <h6 className="text-xs font-medium text-blue-800 mb-1">Next Actions:</h6>
                              <ul className="text-xs text-blue-700 space-y-1">
                                {application.nextActions.map((action, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-400 mr-1">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes Section */}
                      {application.notes && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h6 className="text-xs font-medium text-gray-700">Notes</h6>
                            <button
                              onClick={() => {
                                setEditingApplication(application.id)
                                setEditingNotes(application.notes || '')
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-500"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600">{application.notes}</p>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </button>
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </button>
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Applied on {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {application.jobUrl && (
                          <a
                            href={application.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-500"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Job Posting
                          </a>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Resume
                          </a>
                        )}
                        {application.coverLetterUrl && (
                          <a
                            href={application.coverLetterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Cover Letter
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Application Modal */}
      {editingApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Application</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={applications.find(app => app.id === editingApplication)?.status || 'APPLIED'}
                  onChange={(e) => {
                    const updatedApplications = applications.map(app => 
                      app.id === editingApplication 
                        ? { ...app, status: e.target.value as ApplicationStatus }
                        : app
                    )
                    setApplications(updatedApplications)
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="OFFER">Offer</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage</label>
                <input
                  type="text"
                  value={applications.find(app => app.id === editingApplication)?.currentStage || ''}
                  onChange={(e) => {
                    const updatedApplications = applications.map(app => 
                      app.id === editingApplication 
                        ? { ...app, currentStage: e.target.value }
                        : app
                    )
                    setApplications(updatedApplications)
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g., Application Submitted, Phone Interview Scheduled"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Add notes about this application..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingApplication(null)
                    setEditingNotes('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/applications/${editingApplication}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          status: applications.find(app => app.id === editingApplication)?.status,
                          currentStage: applications.find(app => app.id === editingApplication)?.currentStage,
                          notes: editingNotes
                        })
                      })

                      if (response.ok) {
                        const updatedApplications = applications.map(app => 
                          app.id === editingApplication 
                            ? { ...app, notes: editingNotes }
                            : app
                        )
                        setApplications(updatedApplications)
                        setEditingApplication(null)
                        setEditingNotes('')
                      }
                    } catch (error) {
                      console.error('Error updating application:', error)
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
