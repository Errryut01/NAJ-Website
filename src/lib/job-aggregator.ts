import { JobPosting } from './types'
import { linkedinJobAPI } from './linkedin-job-api'
import { googleJobsScraper } from './google-jobs-scraper'
import { indeedJobAPI } from './job-sources/indeed-api'
import { glassdoorJobAPI } from './job-sources/glassdoor-api'
import { zipRecruiterJobAPI } from './job-sources/ziprecruiter-api'

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

interface JobSourceResult {
  source: string
  jobs: JobPosting[]
  success: boolean
  error?: string
  responseTime: number
}

interface AggregatedJobResult {
  jobs: JobPosting[]
  sourceResults: JobSourceResult[]
  totalCount: number
  jobsBySource: Record<string, number>
  searchTime: number
  duplicatesRemoved: number
}

export class JobAggregator {
  private sources = [
    { name: 'Google Jobs', api: googleJobsScraper, priority: 1 },
    { name: 'LinkedIn', api: linkedinJobAPI, priority: 2 },
    { name: 'Indeed', api: indeedJobAPI, priority: 3 },
    { name: 'Glassdoor', api: glassdoorJobAPI, priority: 4 },
    { name: 'ZipRecruiter', api: zipRecruiterJobAPI, priority: 5 }
  ]

  async searchJobs(params: JobSearchParams): Promise<AggregatedJobResult> {
    const startTime = Date.now()
    console.log('Starting job aggregation search with params:', params)

    // Search all sources in parallel
    const sourcePromises = this.sources.map(source => 
      this.searchSource(source, params)
    )

    const sourceResults = await Promise.allSettled(sourcePromises)
    
    // Process results
    const processedResults: JobSourceResult[] = sourceResults.map((result, index) => {
      const source = this.sources[index]
      if (result.status === 'fulfilled') {
        return {
          source: source.name,
          jobs: result.value,
          success: true,
          responseTime: result.value.responseTime || 0
        }
      } else {
        return {
          source: source.name,
          jobs: [],
          success: false,
          error: result.reason?.message || 'Unknown error',
          responseTime: 0
        }
      }
    })

    // Aggregate all jobs
    const allJobs = processedResults.flatMap(result => result.jobs)
    console.log(`Total jobs collected: ${allJobs.length}`)

    // Remove duplicates
    const uniqueJobs = this.removeDuplicates(allJobs)
    const duplicatesRemoved = allJobs.length - uniqueJobs.length
    console.log(`Duplicates removed: ${duplicatesRemoved}`)

    // Rank jobs by relevance
    const rankedJobs = this.rankJobs(uniqueJobs, params)

    // Count jobs by source
    const jobsBySource = this.countJobsBySource(rankedJobs)

    const searchTime = Date.now() - startTime

    return {
      jobs: rankedJobs,
      sourceResults: processedResults,
      totalCount: rankedJobs.length,
      jobsBySource,
      searchTime,
      duplicatesRemoved
    }
  }

  private async searchSource(source: any, params: JobSearchParams): Promise<JobPosting[]> {
    const startTime = Date.now()
    try {
      console.log(`Searching ${source.name}...`)
      const jobs = await source.api.searchJobs(params)
      const responseTime = Date.now() - startTime
      
      // Add response time to each job for tracking
      return jobs.map((job: JobPosting) => ({
        ...job,
        responseTime
      }))
    } catch (error) {
      console.error(`Error searching ${source.name}:`, error)
      throw error
    }
  }

  private removeDuplicates(jobs: JobPosting[]): JobPosting[] {
    const seen = new Set<string>()
    const uniqueJobs: JobPosting[] = []

    for (const job of jobs) {
      // Create a more sophisticated key for deduplication
      const key = this.createDeduplicationKey(job)
      
      if (!seen.has(key)) {
        seen.add(key)
        uniqueJobs.push(job)
      } else {
        // If duplicate found, keep the one from higher priority source
        const existingIndex = uniqueJobs.findIndex(existing => 
          this.createDeduplicationKey(existing) === key
        )
        
        if (existingIndex !== -1) {
          const existingJob = uniqueJobs[existingIndex]
          const currentPriority = this.getSourcePriority(job.source)
          const existingPriority = this.getSourcePriority(existingJob.source)
          
          if (currentPriority < existingPriority) {
            // Replace with higher priority source
            uniqueJobs[existingIndex] = job
          }
        }
      }
    }

    return uniqueJobs
  }

  private createDeduplicationKey(job: JobPosting): string {
    // Normalize title and company for better deduplication
    const normalizedTitle = job.title.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const normalizedCompany = job.company.toLowerCase().replace(/[^\w\s]/g, '').trim()
    
    return `${normalizedTitle}-${normalizedCompany}`
  }

  private getSourcePriority(source: string): number {
    const sourceConfig = this.sources.find(s => s.name === source)
    return sourceConfig?.priority || 999
  }

  private rankJobs(jobs: JobPosting[], params: JobSearchParams): JobPosting[] {
    return jobs.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Score based on search query match in title
      if (params.searchQuery) {
        const query = params.searchQuery.toLowerCase()
        const titleMatchA = a.title.toLowerCase().includes(query) ? 10 : 0
        const titleMatchB = b.title.toLowerCase().includes(query) ? 10 : 0
        scoreA += titleMatchA
        scoreB += titleMatchB
      }

      // Score based on location match
      if (params.city || params.country) {
        const locationA = a.location.toLowerCase()
        const locationB = b.location.toLowerCase()
        const cityMatchA = params.city ? locationA.includes(params.city.toLowerCase()) ? 5 : 0 : 0
        const cityMatchB = params.city ? locationB.includes(params.city.toLowerCase()) ? 5 : 0 : 0
        const countryMatchA = params.country ? locationA.includes(params.country.toLowerCase()) ? 3 : 0 : 0
        const countryMatchB = params.country ? locationB.includes(params.country.toLowerCase()) ? 3 : 0 : 0
        scoreA += cityMatchA + countryMatchA
        scoreB += cityMatchB + countryMatchB
      }

      // Score based on remote work preference
      if (params.remote) {
        const remoteA = a.remote ? 5 : 0
        const remoteB = b.remote ? 5 : 0
        scoreA += remoteA
        scoreB += remoteB
      }

      // Score based on salary (if available)
      if (params.salaryMin) {
        const salaryA = this.extractSalaryValue(a.salary)
        const salaryB = this.extractSalaryValue(b.salary)
        if (salaryA >= params.salaryMin) scoreA += 3
        if (salaryB >= params.salaryMin) scoreB += 3
      }

      // Score based on source priority (lower number = higher priority)
      const sourcePriorityA = this.getSourcePriority(a.source)
      const sourcePriorityB = this.getSourcePriority(b.source)
      scoreA += (10 - sourcePriorityA)
      scoreB += (10 - sourcePriorityB)

      return scoreB - scoreA // Higher score first
    })
  }

  private extractSalaryValue(salary: any): number {
    if (!salary) return 0
    
    if (typeof salary === 'string') {
      const match = salary.match(/(\d+)k/i)
      return match ? parseInt(match[1]) * 1000 : 0
    }
    
    if (typeof salary === 'object' && salary.value) {
      return salary.value.minValue || salary.value.maxValue || 0
    }
    
    return 0
  }

  private countJobsBySource(jobs: JobPosting[]): Record<string, number> {
    return jobs.reduce((acc, job) => {
      const source = job.source || 'Unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const jobAggregator = new JobAggregator()
