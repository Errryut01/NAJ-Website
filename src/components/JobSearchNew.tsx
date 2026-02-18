'use client'

import { useState, useCallback } from 'react'
import { Search, ExternalLink, Briefcase, MapPin, Clock, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { JobPosting } from '@/lib/types'
import { useUser } from '@/contexts/UserContext'

interface JobAnalysis {
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship'
  remoteWork: boolean
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  industry: string
  department: string
}

interface SimilarJobSearch {
  searchQuery: string
  location: string
  filters: {
    experienceLevel?: string
    jobType?: string
    remoteWork?: boolean
    salaryMin?: number
    industry?: string
  }
}

export default function JobSearchNew() {
  const { user, refreshApplications } = useUser()
  
  const [jobUrl, setJobUrl] = useState('')
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  const [similarJobSearch, setSimilarJobSearch] = useState<SimilarJobSearch | null>(null)
  const [similarJobs, setSimilarJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [searchStats, setSearchStats] = useState<{
    searchTime?: number
    totalFound?: number
    sourceResults?: Array<{
      source: string
      success: boolean
      responseTime: number
      error?: string
    }>
  }>({})

  const handleAnalyzeJob = useCallback(async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a job URL')
      return
    }

    setLoading(true)
    setError(null)
    setJobAnalysis(null)
    setSimilarJobSearch(null)
    setSimilarJobs([])
    setSearchStats({})

    try {
      console.log('Analyzing job posting:', jobUrl)
      
      // Step 1: Analyze the job posting
      const analyzeResponse = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobUrl: jobUrl.trim() })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        throw new Error(errorData.error || 'Failed to analyze job posting')
      }

      const { jobAnalysis: analysis, similarJobSearch: searchParams } = await analyzeResponse.json()
      
      setJobAnalysis(analysis)
      setSimilarJobSearch(searchParams)

      console.log('Job analysis complete:', analysis)
      console.log('Search parameters:', searchParams)

      // Step 2: Find similar jobs using the generated search parameters
      await findSimilarJobs(searchParams)

    } catch (error: any) {
      console.error('Error analyzing job:', error)
      setError(error.message || 'Failed to analyze job posting')
    } finally {
      setLoading(false)
    }
  }, [jobUrl])

  const findSimilarJobs = useCallback(async (searchParams: SimilarJobSearch) => {
    try {
      const startTime = Date.now()
      console.log('Searching for similar jobs with params:', searchParams)

      const searchResponse = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery: searchParams.searchQuery,
          city: searchParams.location,
          salaryMin: searchParams.filters.salaryMin,
          jobType: searchParams.filters.jobType,
          remote: searchParams.filters.remoteWork,
          // Add additional filters based on analysis
          experienceLevel: searchParams.filters.experienceLevel,
          industry: searchParams.filters.industry
        })
      })

      if (!searchResponse.ok) {
        throw new Error('Failed to search for similar jobs')
      }

      const searchData = await searchResponse.json()
      
      const searchTime = Date.now() - startTime
      
      setSimilarJobs(searchData.jobs || [])
      setSearchStats({
        searchTime,
        totalFound: searchData.jobs?.length || 0,
        sourceResults: searchData.sourceResults || []
      })

      console.log(`Found ${searchData.jobs?.length || 0} similar jobs in ${searchTime}ms`)

    } catch (error: any) {
      console.error('Error finding similar jobs:', error)
      setError(`Failed to find similar jobs: ${error.message}`)
    }
  }, [])

  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }, [])

  const applyToSelectedJobs = useCallback(async () => {
    if (selectedJobs.length === 0) return

    setApplyingJobId('bulk')
    
    try {
      const jobsToApply = similarJobs.filter(job => selectedJobs.includes(job.id))
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          applications: jobsToApply.map(job => ({
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            jobUrl: job.url,
            appliedAt: new Date().toISOString(),
            source: job.source,
            salary: job.salary,
            status: 'applied'
          }))
        })
      })

      if (response.ok) {
        // Remove applied jobs from the list
        setSimilarJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)))
        setSelectedJobs([])
        
        // Refresh applications list
        refreshApplications()
        
        alert(`Successfully applied to ${selectedJobs.length} job${selectedJobs.length > 1 ? 's' : ''}!`)
      } else {
        throw new Error('Failed to apply to jobs')
      }
    } catch (error: any) {
      console.error('Error applying to jobs:', error)
      alert(`Failed to apply to jobs: ${error.message}`)
    } finally {
      setApplyingJobId(null)
    }
  }, [selectedJobs, similarJobs, user?.id, refreshApplications])

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800'
      case 'mid': return 'bg-blue-100 text-blue-800'
      case 'senior': return 'bg-purple-100 text-purple-800'
      case 'executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Connections over Applications
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Let us help you connect.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center text-indigo-600">
            <Users className="h-6 w-6 mr-2" />
            <span className="font-semibold">Build Connections</span>
          </div>
          <div className="flex items-center text-green-600">
            <Briefcase className="h-6 w-6 mr-2" />
            <span className="font-semibold">Find Opportunities</span>
          </div>
          <div className="flex items-center text-purple-600">
            <Search className="h-6 w-6 mr-2" />
            <span className="font-semibold">Smart Matching</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Job Search</h2>
          <p className="text-gray-600">Paste a job link and we'll find 10 similar opportunities for you</p>
        </div>
      </div>

      {/* Job URL Input */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Posting URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                disabled={loading}
              />
              <button
                onClick={handleAnalyzeJob}
                disabled={loading || !jobUrl.trim()}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Similar Jobs
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Job Analysis Results */}
      {jobAnalysis && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Analyzed Job
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{jobAnalysis.title}</h4>
                <p className="text-gray-600">{jobAnalysis.company} • {jobAnalysis.location}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-700">{jobAnalysis.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExperienceLevelColor(jobAnalysis.experienceLevel)}`}>
                  {jobAnalysis.experienceLevel} level
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {jobAnalysis.jobType}
                </span>
                {jobAnalysis.remoteWork && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Remote
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Key Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {jobAnalysis.skills.slice(0, 8).map((skill, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                      {skill}
                    </span>
                  ))}
                  {jobAnalysis.skills.length > 8 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{jobAnalysis.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Industry & Department</h5>
                <p className="text-sm text-gray-600">{jobAnalysis.industry} • {jobAnalysis.department}</p>
              </div>

              {jobAnalysis.salaryRange && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Salary Range</h5>
                  <p className="text-sm text-gray-600">
                    {jobAnalysis.salaryRange.currency} {jobAnalysis.salaryRange.min.toLocaleString()} - {jobAnalysis.salaryRange.max.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Similar Jobs Results */}
      {similarJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Similar Jobs Found ({similarJobs.length})
            </h3>
            
            {selectedJobs.length > 0 && (
              <button
                onClick={applyToSelectedJobs}
                disabled={applyingJobId === 'bulk'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {applyingJobId === 'bulk' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply to Selected ({selectedJobs.length})
                  </>
                )}
              </button>
            )}
          </div>

          {searchStats.searchTime && (
            <div className="text-sm text-gray-500 mb-4">
              Found {searchStats.totalFound} jobs in {searchStats.searchTime}ms
            </div>
          )}

          <div className="space-y-4">
            {similarJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                        {job.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {job.source && (
                            <span className="flex items-center">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {job.source}
                            </span>
                          )}
                          {job.salary && (
                            <span className="flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Statistics */}
      {searchStats.sourceResults && searchStats.sourceResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Search Sources</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {searchStats.sourceResults.map((source, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                {source.success ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                <span className="text-gray-600">{source.source}</span>
                <span className="text-gray-400">({source.responseTime}ms)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
