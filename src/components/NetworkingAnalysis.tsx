'use client'

import React, { useState, useEffect } from 'react'
import { LinkedInPerson, NetworkingAnalysis } from '@/lib/linkedin-networking'

interface NetworkingAnalysisProps {
  jobs: any[]
  onClose: () => void
}

export default function NetworkingAnalysis({ jobs, onClose }: NetworkingAnalysisProps) {
  const [analyses, setAnalyses] = useState<NetworkingAnalysis[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  useEffect(() => {
    if (jobs.length > 0) {
      analyzeNetworking()
    }
  }, [jobs])

  const analyzeNetworking = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/networking/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobs }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses)
        setSummary(data.summary)
      } else {
        console.error('Failed to analyze networking opportunities')
      }
    } catch (error) {
      console.error('Error analyzing networking:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'connection':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'recruiter':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hiring_manager':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'potential_contact':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'connection':
        return '👥'
      case 'recruiter':
        return '🎯'
      case 'hiring_manager':
        return '👔'
      case 'potential_contact':
        return '🤝'
      default:
        return '👤'
    }
  }

  const renderPersonCard = (person: LinkedInPerson) => (
    <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{person.name}</h3>
            {person.isConnection && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Connection
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{person.title}</p>
          <p className="text-sm text-gray-500 mb-2">{person.company}</p>
          {person.location && (
            <p className="text-xs text-gray-400 mb-2">{person.location}</p>
          )}
          {person.summary && (
            <p className="text-xs text-gray-600 mb-2">{person.summary}</p>
          )}
          {person.mutualConnections && (
            <p className="text-xs text-blue-600">
              {person.mutualConnections} mutual connections
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(person.category)}`}>
            <span className="mr-1">{getCategoryIcon(person.category)}</span>
            {person.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            View Profile →
          </a>
        </div>
      </div>
    </div>
  )

  const selectedAnalysis = selectedCompany 
    ? analyses.find(a => a.targetCompany === selectedCompany)
    : null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Networking Opportunities</h2>
            <p className="text-gray-600">Finding your connections and potential contacts at target companies...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Networking Analysis</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {summary && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Companies Analyzed:</span>
                    <span className="font-medium">{summary.totalCompanies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Existing Connections:</span>
                    <span className="font-medium text-green-600">{summary.totalConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recruiters Found:</span>
                    <span className="font-medium text-blue-600">{summary.totalRecruiters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hiring Managers:</span>
                    <span className="font-medium text-purple-600">{summary.totalHiringManagers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Contacts:</span>
                    <span className="font-medium text-gray-600">{summary.totalPotentialContacts}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Companies</h3>
              <div className="space-y-2">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.targetCompany}
                    onClick={() => setSelectedCompany(analysis.targetCompany)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCompany === analysis.targetCompany
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{analysis.targetCompany}</div>
                    <div className="text-sm text-gray-600">
                      {analysis.totalFound} contacts found
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedAnalysis ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedAnalysis.targetCompany}
                </h2>

                <div className="space-y-6">
                  {/* Existing Connections */}
                  {selectedAnalysis.connections.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>👥</span>
                        Existing Connections ({selectedAnalysis.connections.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedAnalysis.connections.map(renderPersonCard)}
                      </div>
                    </div>
                  )}

                  {/* Recruiters */}
                  {selectedAnalysis.recruiters.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🎯</span>
                        Recruiters ({selectedAnalysis.recruiters.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedAnalysis.recruiters.map(renderPersonCard)}
                      </div>
                    </div>
                  )}

                  {/* Hiring Managers */}
                  {selectedAnalysis.hiringManagers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>👔</span>
                        Hiring Managers ({selectedAnalysis.hiringManagers.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedAnalysis.hiringManagers.map(renderPersonCard)}
                      </div>
                    </div>
                  )}

                  {/* Potential Contacts */}
                  {selectedAnalysis.potentialContacts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🤝</span>
                        Potential Contacts ({selectedAnalysis.potentialContacts.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedAnalysis.potentialContacts.map(renderPersonCard)}
                      </div>
                    </div>
                  )}

                  {selectedAnalysis.totalFound === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No networking opportunities found for this company.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a company to view networking opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
