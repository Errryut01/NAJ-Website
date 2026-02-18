'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Filter, MapPin, Clock, ExternalLink, Plus, Briefcase, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { JobPosting } from '@/lib/types'
import { useUser } from '@/contexts/UserContext'

export default function JobSearch() {
  const { user, profile, preferences, refreshApplications } = useUser()
  
  // Initialize state with localStorage values or defaults
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.searchQuery || ''
        } catch (error) {
          console.error('Error parsing saved search query:', error)
        }
      }
    }
    return ''
  })
  const [city, setCity] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.city || ''
        } catch (error) {
          console.error('Error parsing saved city:', error)
        }
      }
    }
    return ''
  })
  const [country, setCountry] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.country || ''
        } catch (error) {
          console.error('Error parsing saved country:', error)
        }
      }
    }
    return ''
  })
  const [jobDescription, setJobDescription] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.jobDescription || ''
        } catch (error) {
          console.error('Error parsing saved job description:', error)
        }
      }
    }
    return ''
  })
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.jobs || []
        } catch (error) {
          console.error('Error parsing saved jobs:', error)
        }
      }
    }
    return []
  })
  const [loading, setLoading] = useState(false)
  const [jobsBySource, setJobsBySource] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.jobsBySource || {}
        } catch (error) {
          console.error('Error parsing saved jobsBySource:', error)
        }
      }
    }
    return {}
  })
  const [searchStats, setSearchStats] = useState<{
    searchTime?: number
    duplicatesRemoved?: number
    sourceResults?: Array<{
      source: string
      success: boolean
      responseTime: number
      error?: string
    }>
  }>({})
  const [filters, setFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.filters || {
            salaryMin: '',
            jobType: '',
            remote: false,
            postedWithin: ''
          }
        } catch (error) {
          console.error('Error parsing saved filters:', error)
        }
      }
    }
    return {
      salaryMin: '',
      jobType: '',
      remote: false,
      postedWithin: ''
    }
  })

  const [selectedJobs, setSelectedJobs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.selectedJobs || []
        } catch (error) {
          console.error('Error parsing saved selectedJobs:', error)
        }
      }
    }
    return []
  })
  const [appliedJobs, setAppliedJobs] = useState<JobPosting[]>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('jobSearchFormData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          return parsed.appliedJobs || []
        } catch (error) {
          console.error('Error parsing saved appliedJobs:', error)
        }
      }
    }
    return []
  })
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackJob, setFeedbackJob] = useState<JobPosting | null>(null)
  const [lastSearchTime, setLastSearchTime] = useState(0)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const MIN_SEARCH_INTERVAL = 5000 // 5 seconds minimum between searches

  // Component mount/unmount logging and immediate save on unmount
  useEffect(() => {
    console.log('JobSearch: Component mounted')
    return () => {
      console.log('JobSearch: Component unmounted - saving data immediately')
      // Save data immediately when component unmounts
      const formData = {
        searchQuery,
        city,
        country,
        jobDescription,
        filters,
        jobs,
        jobsBySource,
        selectedJobs,
        appliedJobs
      }
      localStorage.setItem('jobSearchFormData', JSON.stringify(formData))
    }
  }, [searchQuery, city, country, jobDescription, filters, jobs, jobsBySource, selectedJobs, appliedJobs])

  // Mark as initialized since we loaded data in useState initializers
  useEffect(() => {
    console.log('JobSearch: Component initialized with saved data')
    console.log('JobSearch: Initial appliedJobs count:', appliedJobs.length)
    isInitializedRef.current = true
  }, [])

  // Debug appliedJobs changes
  useEffect(() => {
    console.log('JobSearch: appliedJobs changed, count:', appliedJobs.length)
  }, [appliedJobs])

  // Save form data to localStorage whenever it changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const formData = {
        searchQuery,
        city,
        country,
        jobDescription,
        filters,
        jobs,
        jobsBySource,
        selectedJobs,
        appliedJobs
      }
      console.log('JobSearch: Saving form data to localStorage:', formData)
      localStorage.setItem('jobSearchFormData', JSON.stringify(formData))
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, city, country, jobDescription, filters, jobs, jobsBySource, selectedJobs, appliedJobs])

  // Check profile completion
  const getMissingFields = () => {
    const missing = []
    if (!profile?.firstName) missing.push('First Name')
    if (!profile?.lastName) missing.push('Last Name')
    if (!user?.email) missing.push('Email')
    if (!profile?.phone) missing.push('Phone')
    if (!profile?.country) missing.push('Country')
    if (!profile?.city) missing.push('City')
    if (!profile?.summary) missing.push('Professional Summary')
    if (!profile?.currentTitle) missing.push('Current Job Title')
    if (!profile?.currentCompany) missing.push('Current Company')
    if (!profile?.yearsExperience) missing.push('Years of Experience')
    if (!profile?.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) missing.push('Skills')
    if (!preferences?.jobTitles || (Array.isArray(preferences.jobTitles) && preferences.jobTitles.length === 0)) missing.push('Target Job Titles')
    if (!preferences?.companies || (Array.isArray(preferences.companies) && preferences.companies.length === 0)) missing.push('Target Companies')
    if (!preferences?.locations || (Array.isArray(preferences.locations) && preferences.locations.length === 0)) missing.push('Preferred Locations')
    return missing
  }

  const missingFields = getMissingFields()
  const isProfileComplete = missingFields.length === 0

  // Function to clear saved form data
  const clearSavedData = () => {
    localStorage.removeItem('jobSearchFormData')
    setSearchQuery('')
    setCity('')
    setCountry('')
    setJobDescription('')
    setJobs([])
    setJobsBySource({})
    setSelectedJobs([])
    setAppliedJobs([])
    setFilters({
    salaryMin: '',
    jobType: '',
    remote: false,
    postedWithin: ''
  })
  }

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !jobDescription.trim()) return

    // Rate limiting check
    const now = Date.now()
    const timeSinceLastSearch = now - lastSearchTime
    
    if (timeSinceLastSearch < MIN_SEARCH_INTERVAL) {
      const remainingTime = Math.ceil((MIN_SEARCH_INTERVAL - timeSinceLastSearch) / 1000)
      alert(`Please wait ${remainingTime} seconds before searching again to preserve API usage.`)
      return
    }

    setLoading(true)
    setLastSearchTime(now)
    try {
      // Log the search parameters including job description
      console.log('Search parameters:', { searchQuery, city, country, jobDescription, filters })
      
      // Call the LinkedIn job search API
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery: searchQuery.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
          salaryMin: filters.salaryMin ? parseInt(filters.salaryMin) : undefined,
          jobType: filters.jobType || undefined,
          remote: filters.remote,
          postedWithin: filters.postedWithin || undefined
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Deduplicate jobs by ID to prevent React key warnings
        const uniqueJobs = data.jobs.reduce((acc: JobPosting[], current: JobPosting) => {
          const existingIndex = acc.findIndex(job => job.id === current.id)
          if (existingIndex === -1) {
            acc.push(current)
          } else {
            console.log('Duplicate job found and removed:', current.id, current.title)
          }
          return acc
        }, [])
        
        setJobs(uniqueJobs)
        setJobsBySource(data.jobsBySource || {})
        setSearchStats({
          searchTime: data.searchTime,
          duplicatesRemoved: data.duplicatesRemoved,
          sourceResults: data.sourceResults
        })
        console.log(`Found ${data.jobs.length} jobs, ${uniqueJobs.length} unique jobs`)
        console.log(`Search completed in ${data.searchTime}ms`)
        console.log(`Duplicates removed: ${data.duplicatesRemoved}`)
        
        // Log source information if available
        if (data.jobsBySource) {
          console.log('Jobs by source:', data.jobsBySource)
        }
        if (data.sourceResults) {
          console.log('Source results:', data.sourceResults)
        }
      } else {
        // Show detailed error message to user
        const errorMessage = data.details || data.error || 'Failed to search jobs'
        const suggestion = data.suggestion || 'Please try again later.'
        alert(`Job search failed: ${errorMessage}\n\n${suggestion}`)
        setJobs([]) // Clear any existing jobs
      }
    } catch (error) {
      console.error('Error searching jobs:', error)
      // Show error message to user
      alert('Failed to search jobs. Please check your connection and try again.')
      setJobs([]) // Clear any existing jobs
    } finally {
      setLoading(false)
    }
  }, [searchQuery, city, country, jobDescription, filters, lastSearchTime, MIN_SEARCH_INTERVAL])

  const handleJobSelect = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const handleApplyToJob = async (job: JobPosting, showAlert: boolean = true) => {
    if (!user?.id) {
      alert('Please log in to apply for jobs')
      return
    }

    console.log('Starting job application for:', job.title, 'at', job.company)
    console.log('User ID:', user.id)
    console.log('Job data:', job)

    setApplyingJobId(job.id)
    
    try {
      console.log('Sending POST request to /api/applications')
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          jobTitle: job.title,
          company: job.company,
          jobUrl: job.url,
          jobDescription: job.description,
          location: job.location,
          salary: job.salary,
          source: job.source
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const { application } = await response.json()
        
        console.log('Application created successfully:', application)
        console.log('Moving job to applied jobs:', job.title)
        
        // Move job from search results to applied jobs
        setJobs(prev => {
          console.log('Current jobs before filtering:', prev.length)
          console.log('Job to remove ID:', job.id)
          console.log('Job to remove title:', job.title)
          const filtered = prev.filter(j => j.id !== job.id)
          console.log('Jobs after filtering:', filtered.length)
          return filtered
        })
        
        setAppliedJobs(prev => {
          // Check if job already exists in applied jobs to prevent duplicates
          const jobExists = prev.some(appliedJob => appliedJob.id === job.id)
          if (jobExists) {
            console.log('Job already exists in applied jobs, skipping:', job.id)
            return prev
          }
          
          const newAppliedJobs = [...prev, { ...job, appliedAt: new Date().toISOString() }]
          console.log('Applied jobs before adding:', prev.length)
          console.log('Applied jobs after adding:', newAppliedJobs.length)
          console.log('New applied job:', { ...job, appliedAt: new Date().toISOString() })
          return newAppliedJobs
        })
        
        // Remove from selected jobs if it was selected
        setSelectedJobs(prev => prev.filter(id => id !== job.id))
        
        // Trigger applications refresh
        refreshApplications()
        
        // Only show alert if this is an individual application
        if (showAlert) {
          alert('Application submitted successfully!')
        }
      } else {
        let errorMessage = 'Unknown error occurred'
        try {
          const error = await response.json()
          console.error('Application failed:', error)
          errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        alert(`Failed to apply: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Failed to apply to job. Please try again.')
    } finally {
      setApplyingJobId(null)
    }
  }

  const handleApplyToSelected = async () => {
    if (selectedJobs.length === 0) return

    try {
      console.log('Applying to selected jobs:', selectedJobs)
      
      // Get the jobs to apply to
      const jobsToApply = jobs.filter(job => selectedJobs.includes(job.id))
      
      // Apply to each job individually (no individual alerts)
      const applicationPromises = jobsToApply.map(job => handleApplyToJob(job, false))
      
      // Wait for all applications to complete
      await Promise.all(applicationPromises)
      
      // Clear selection after applying
      setSelectedJobs([])
      
      // Show success message
      alert(`Successfully applied to ${selectedJobs.length} job(s)!`)
    } catch (error) {
      console.error('Error applying to selected jobs:', error)
      alert('Some applications failed. Please try again.')
    }
  }

  const handleAutoApply = async () => {
    if (jobs.length === 0) return

    try {
      console.log('Auto-applying to all jobs:', jobs.map(job => job.id))
      
      // Apply to each job individually (no individual alerts)
      const applicationPromises = jobs.map(job => handleApplyToJob(job, false))
      
      // Wait for all applications to complete
      await Promise.all(applicationPromises)
      
      // Show success message
      alert(`Successfully auto-applied to ${jobs.length} job(s)!`)
    } catch (error) {
      console.error('Error auto-applying to jobs:', error)
      alert('Some applications failed. Please try again.')
    }
  }

  const handleFeedback = (job: JobPosting) => {
    setFeedbackJob(job)
    setShowFeedback(true)
  }

  const handleDiscoverConnections = () => {
    // Extract unique companies from job search results
    const companies = [...new Set(jobs.map(job => job.company))].filter(Boolean)
    
    if (companies.length === 0) {
      alert('No companies found in the search results to discover connections for.')
      return
    }

    // Store companies in sessionStorage for the connections section
    sessionStorage.setItem('targetCompanies', JSON.stringify(companies))
    
    // Navigate to connections section
    window.location.href = '/connections'
  }

  const handleFeedbackSubmit = async (feedback: {
    industry: 'thumbs-up' | 'thumbs-down' | null,
    salary: 'thumbs-up' | 'thumbs-down' | null,
    location: 'thumbs-up' | 'thumbs-down' | null,
    title: 'thumbs-up' | 'thumbs-down' | null
  }) => {
    try {
      // Here you would save feedback to database
      console.log('Feedback for job:', feedbackJob?.id, feedback)
      // await feedbackService.saveFeedback(feedbackJob.id, feedback)
      
      setShowFeedback(false)
      setFeedbackJob(null)
      
      // Show success message
      alert('Thank you for your feedback! This will help improve future job recommendations.')
    } catch (error) {
      console.error('Error saving feedback:', error)
    }
  }

  const getStatusBadge = (source: string) => {
    const colors = {
      'LinkedIn': 'bg-blue-100 text-blue-800',
      'Google Jobs': 'bg-red-100 text-red-800',
      'Indeed': 'bg-green-100 text-green-800',
      'Glassdoor': 'bg-purple-100 text-purple-800',
      'ZipRecruiter': 'bg-orange-100 text-orange-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {source}
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Job Search</h2>
        <p className="mt-2 text-sm text-gray-600">
          Search and apply to jobs automatically
        </p>
      </div>

      {/* Profile Completion Warning */}
      {!isProfileComplete && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Complete your profile for better job matching
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                The following fields are missing from your profile:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {missingFields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    {field}
                  </span>
                ))}
              </div>
              <p className="text-sm text-yellow-700">
                Complete these fields in your profile to get more accurate job recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Complete Success Message */}
      {isProfileComplete && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Profile Complete
              </h3>
              <p className="text-sm text-green-700">
                Your profile is complete! You'll get the best job matching results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        {/* Job Description Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the job you want
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
            placeholder="Describe your ideal job, including responsibilities, skills, company culture, or any specific requirements..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title or Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
                placeholder="e.g. San Francisco"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
                placeholder="e.g. United States"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary (in thousands)
            </label>
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-500"
              placeholder="e.g., 80 (for $80,000)"
            />
          </div>

          <div className="flex items-end space-x-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Jobs'}
            </button>
            <button
              onClick={clearSavedData}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Posted Within</label>
              <select
                value={filters.postedWithin}
                onChange={(e) => setFilters(prev => ({ ...prev, postedWithin: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
              >
                <option value="">Any time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last week</option>
                <option value="30">Last month</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Remote only</label>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Search Results ({jobs.length})
            </h3>
              {Object.keys(jobsBySource).length > 0 && (
                <div className="mt-2">
                  {Object.entries(jobsBySource).map(([source, count]) => (
                    <span key={source} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      {source}: {count}
                    </span>
                  ))}
                </div>
              )}
              {searchStats.searchTime && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="mr-4">Search time: {searchStats.searchTime}ms</span>
                  {searchStats.duplicatesRemoved && searchStats.duplicatesRemoved > 0 && (
                    <span className="mr-4">Duplicates removed: {searchStats.duplicatesRemoved}</span>
                  )}
                </div>
              )}
              {searchStats.sourceResults && searchStats.sourceResults.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Source Status:</div>
                  <div className="flex flex-wrap gap-1">
                    {searchStats.sourceResults.map((result, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        title={result.error || `${result.responseTime}ms`}
                      >
                        {result.source} {result.success ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              {jobs.length > 0 && (
                <button
                  onClick={handleDiscoverConnections}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Go to Connections
                </button>
              )}
            {selectedJobs.length > 0 && (
              <button
                onClick={handleApplyToSelected}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Apply to Selected ({selectedJobs.length})
              </button>
            )}
              {jobs.length > 0 && (
                <button
                  onClick={handleAutoApply}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Auto-Apply to All ({jobs.length})
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Searching for jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or search terms.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div
                  key={`${job.id}-${index}-${job.source || 'unknown'}`}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedJobs.includes(job.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleJobSelect(job.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {job.title}
                        </h4>
                        {getStatusBadge(job.source)}
                      </div>
                      
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {job.company} • {job.location}
                      </p>
                      
                      {job.salary && (
                        <p className="text-sm text-green-600 font-medium mb-2">
                          {job.salary}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {/* Job Requirements */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Requirements:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {job.requirements.slice(0, 3).map((req, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-gray-400 mr-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                            {job.requirements.length > 3 && (
                              <li className="text-gray-500">+{job.requirements.length - 3} more...</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {/* Job Benefits */}
                      {job.benefits && job.benefits.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Benefits:</h5>
                          <div className="flex flex-wrap gap-1">
                            {job.benefits.slice(0, 4).map((benefit, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {benefit}
                              </span>
                            ))}
                            {job.benefits.length > 4 && (
                              <span className="text-xs text-gray-500">+{job.benefits.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Job Type and Experience Level */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        {job.jobType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {job.jobType}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.postedDate}
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Job
                          </a>
                        )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Apply button clicked for job:', job.title, job.company)
                            console.log('Full job object:', job)
                            handleApplyToJob(job)
                          }}
                          disabled={applyingJobId === job.id}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyingJobId === job.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Applying...
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 mr-1" />
                              Apply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleJobSelect(job.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Applied Jobs Count */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <h3 className="text-sm font-medium text-yellow-800">Debug: Applied Jobs Count</h3>
        <p className="text-sm text-yellow-600">Applied Jobs: {appliedJobs.length}</p>
        <p className="text-sm text-yellow-600">Jobs in Search Results: {jobs.length}</p>
      </div>

      {/* Applied Jobs Section */}
      {appliedJobs.length > 0 && (
        <div className="bg-white shadow rounded-lg mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Applied Jobs ({appliedJobs.length})
            </h3>
            {console.log('Rendering Applied Jobs section with', appliedJobs.length, 'jobs')}
            <div className="space-y-4">
              {appliedJobs.map((job, index) => (
                <div
                  key={`${job.id}-${index}-${job.appliedAt || Date.now()}`}
                  className="border rounded-lg p-4 bg-green-50 border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {job.title}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Applied
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {job.company} • {job.location}
                      </p>
                      
                      {job.salary && (
                        <p className="text-sm text-green-600 font-medium mb-2">
                          {job.salary}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.postedDate}
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-500"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Job
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleFeedback(job)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Give Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && feedbackJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Feedback for {feedbackJob.title} at {feedbackJob.company}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Please rate the following aspects of this job:
              </p>
              
              <FeedbackForm 
                job={feedbackJob}
                onSubmit={handleFeedbackSubmit}
                onCancel={() => {
                  setShowFeedback(false)
                  setFeedbackJob(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Feedback Form Component
function FeedbackForm({ 
  job, 
  onSubmit, 
  onCancel 
}: { 
  job: JobPosting
  onSubmit: (feedback: {
    industry: 'thumbs-up' | 'thumbs-down' | null,
    salary: 'thumbs-up' | 'thumbs-down' | null,
    location: 'thumbs-up' | 'thumbs-down' | null,
    title: 'thumbs-up' | 'thumbs-down' | null
  }) => void
  onCancel: () => void
}) {
  const [feedback, setFeedback] = useState<{
    industry: 'thumbs-up' | 'thumbs-down' | null,
    salary: 'thumbs-up' | 'thumbs-down' | null,
    location: 'thumbs-up' | 'thumbs-down' | null,
    title: 'thumbs-up' | 'thumbs-down' | null
  }>({
    industry: null,
    salary: null,
    location: null,
    title: null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(feedback)
  }

  const ThumbsButton = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: 'thumbs-up' | 'thumbs-down' | null
    onChange: (value: 'thumbs-up' | 'thumbs-down' | null) => void
    label: string
  }) => (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700 w-20">{label}:</span>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onChange(value === 'thumbs-up' ? null : 'thumbs-up')}
          className={`p-2 rounded-full ${
            value === 'thumbs-up' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => onChange(value === 'thumbs-down' ? null : 'thumbs-down')}
          className={`p-2 rounded-full ${
            value === 'thumbs-down' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          👎
        </button>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ThumbsButton
        value={feedback.industry}
        onChange={(value) => setFeedback(prev => ({ ...prev, industry: value }))}
        label="Industry"
      />
      <ThumbsButton
        value={feedback.salary}
        onChange={(value) => setFeedback(prev => ({ ...prev, salary: value }))}
        label="Salary"
      />
      <ThumbsButton
        value={feedback.location}
        onChange={(value) => setFeedback(prev => ({ ...prev, location: value }))}
        label="Location"
      />
      <ThumbsButton
        value={feedback.title}
        onChange={(value) => setFeedback(prev => ({ ...prev, title: value }))}
        label="Title"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  )
}
