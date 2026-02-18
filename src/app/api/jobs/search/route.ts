import { NextRequest, NextResponse } from 'next/server'
import { jobAggregator } from '@/lib/job-aggregator'
import { JobPosting } from '@/lib/types'

// Simple in-memory cache for job search results
const jobSearchCache = new Map<string, { data: JobPosting[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

// Rate limiting tracking
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10 // Max 10 requests per minute per IP

interface JobSearchParams {
  searchQuery?: string
  city?: string
  country?: string
  jobDescription?: string
  salaryMin?: number
  salaryMax?: number
  jobType?: string
  remote?: boolean
  postedWithin?: string
}

function generateCacheKey(params: JobSearchParams): string {
  // Create a consistent cache key from search parameters
  const normalizedParams = {
    searchQuery: params.searchQuery?.toLowerCase().trim() || '',
    city: params.city?.toLowerCase().trim() || '',
    country: params.country?.toLowerCase().trim() || '',
    salaryMin: params.salaryMin || 0,
    jobType: params.jobType || '',
    remote: params.remote || false
  }
  return JSON.stringify(normalizedParams)
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  userLimit.count++
  return true
}

function getCachedResults(cacheKey: string): JobPosting[] | null {
  const cached = jobSearchCache.get(cacheKey)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_DURATION) {
    jobSearchCache.delete(cacheKey)
    return null
  }

  console.log('Returning cached results for key:', cacheKey.substring(0, 50) + '...')
  return cached.data
}

function setCachedResults(cacheKey: string, data: JobPosting[]): void {
  jobSearchCache.set(cacheKey, { data, timestamp: Date.now() })
  console.log('Cached results for key:', cacheKey.substring(0, 50) + '...')
}

function getJobsBySource(jobs: JobPosting[]): Record<string, number> {
  return jobs.reduce((acc, job) => {
    const source = job.source || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait before making another request.',
          retryAfter: Math.ceil(((rateLimitMap.get(ip)?.resetTime || 0) - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      searchQuery,
      city,
      country,
      jobDescription,
      salaryMin,
      salaryMax,
      jobType,
      remote,
      postedWithin
    }: JobSearchParams = body

    console.log('Job search request:', {
      searchQuery,
      city,
      country,
      jobDescription,
      salaryMin,
      salaryMax,
      jobType,
      remote,
      postedWithin
    })

    // Check cache first
    const cacheKey = generateCacheKey({ searchQuery, city, country, jobDescription, salaryMin, salaryMax, jobType, remote, postedWithin })
    const cachedResults = getCachedResults(cacheKey)
    if (cachedResults) {
      return NextResponse.json({
        jobs: cachedResults,
        jobsBySource: getJobsBySource(cachedResults),
        cached: true,
        cacheKey: cacheKey.substring(0, 50) + '...'
      })
    }

    // Search jobs using the job aggregator
    const searchParams = {
      searchQuery,
      city,
      country,
      jobDescription,
      salaryMin,
      salaryMax,
      jobType,
      remote,
      postedWithin
    }

    console.log('Starting aggregated job search...')
    const aggregatedResult = await jobAggregator.searchJobs(searchParams)
    
    console.log(`Found ${aggregatedResult.totalCount} jobs from ${aggregatedResult.sourceResults.length} sources`)
    console.log('Source breakdown:', aggregatedResult.jobsBySource)
    console.log(`Search completed in ${aggregatedResult.searchTime}ms`)

    // If no jobs found from any API, return error
    if (aggregatedResult.totalCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No jobs found',
          details: 'No job search APIs returned results. This could be due to API quotas, network issues, or no matching jobs.',
          suggestion: 'Please try again later or contact support if the issue persists.',
          sourceResults: aggregatedResult.sourceResults
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Use the aggregated results
    const jobs = aggregatedResult.jobs

    // Filter jobs based on search criteria
    let filteredJobs = jobs

    // Filter by remote work preference
    if (remote) {
      filteredJobs = filteredJobs.filter(job => job.location.toLowerCase().includes('remote'))
    }

    // Filter by minimum salary (salaryMin is already in thousands)
    if (salaryMin) {
      filteredJobs = filteredJobs.filter(job => {
        if (!job.salary) return true
        
        // Handle both string and object salary formats
        let minSalary = 0
        if (typeof job.salary === 'string') {
          // String format like "$100k - $140k" or "100k - 140k"
          const match = job.salary.match(/(\d+)k/)
          minSalary = match ? parseInt(match[1]) : 0
        } else if (typeof job.salary === 'object' && job.salary.value) {
          // Object format from real API
          minSalary = Math.floor((job.salary.value.minValue || 0) / 1000)
        }
        
        return minSalary >= salaryMin
      })
    }

    // Filter by job type
    if (jobType && jobType !== '') {
      filteredJobs = filteredJobs.filter(job => 
        job.jobType?.toLowerCase().includes(jobType.toLowerCase())
      )
    }

    // Filter by posted date
    if (postedWithin) {
      const daysAgo = parseInt(postedWithin.replace(/\D/g, ''))
      filteredJobs = filteredJobs.filter(job => {
        const postedDays = parseInt(job.postedDate.match(/\d+/)?.[0] || '0')
        return postedDays <= daysAgo
      })
    }

    // Count jobs by source
    const jobsBySource = filteredJobs.reduce((acc, job) => {
      const source = job.source || 'Unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Cache the results
    setCachedResults(cacheKey, filteredJobs)

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      totalCount: filteredJobs.length,
      jobsBySource,
      cached: false,
      searchTime: aggregatedResult.searchTime,
      duplicatesRemoved: aggregatedResult.duplicatesRemoved,
      sourceResults: aggregatedResult.sourceResults,
      searchParams: {
        searchQuery,
        city,
        country,
        jobDescription,
        salaryMin,
        salaryMax,
        jobType,
        remote,
        postedWithin
      }
    })

  } catch (error) {
    console.error('Error searching jobs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Note: Duplicate removal is now handled by the job aggregator