import axios from 'axios'
import { JobPosting } from '@/lib/types'

export class JobSearchService {
  private indeedApiKey: string
  private glassdoorApiKey: string

  constructor(indeedApiKey?: string, glassdoorApiKey?: string) {
    this.indeedApiKey = indeedApiKey || process.env.INDEED_API_KEY || ''
    this.glassdoorApiKey = glassdoorApiKey || process.env.GLASSDOOR_API_KEY || ''
  }

  async searchJobs(
    keywords: string,
    location?: string,
    limit: number = 25
  ): Promise<JobPosting[]> {
    const jobs: JobPosting[] = []

    try {
      // Search Indeed
      const indeedJobs = await this.searchIndeedJobs(keywords, location, limit)
      jobs.push(...indeedJobs)

      // Search Glassdoor
      const glassdoorJobs = await this.searchGlassdoorJobs(keywords, location, limit)
      jobs.push(...glassdoorJobs)

      // Remove duplicates based on title and company
      const uniqueJobs = this.removeDuplicateJobs(jobs)

      return uniqueJobs.slice(0, limit)
    } catch (error) {
      console.error('Error searching jobs:', error)
      throw new Error('Failed to search jobs')
    }
  }

  private async searchIndeedJobs(
    keywords: string,
    location?: string,
    limit: number = 25
  ): Promise<JobPosting[]> {
    try {
      const params = new URLSearchParams({
        publisher: this.indeedApiKey,
        q: keywords,
        l: location || '',
        limit: limit.toString(),
        format: 'json',
        v: '2'
      })

      const response = await axios.get(
        `https://api.indeed.com/ads/apisearch?${params.toString()}`
      )

      return response.data.results?.map((job: any) => ({
        id: `indeed_${job.jobkey}`,
        title: job.jobtitle,
        company: job.company,
        location: job.formattedLocation,
        description: job.snippet,
        url: job.url,
        salary: job.salary,
        postedDate: job.formattedRelativeTime,
        source: 'Indeed',
        linkedinJobId: undefined
      })) || []
    } catch (error) {
      console.error('Error searching Indeed jobs:', error)
      return []
    }
  }

  private async searchGlassdoorJobs(
    keywords: string,
    location?: string,
    limit: number = 25
  ): Promise<JobPosting[]> {
    try {
      const params = new URLSearchParams({
        't.p': this.glassdoorApiKey,
        't.k': 'your_partner_id', // You need to register for this
        userip: '0.0.0.0',
        useragent: 'Mozilla/5.0',
        q: keywords,
        l: location || '',
        limit: limit.toString()
      })

      const response = await axios.get(
        `https://api.glassdoor.com/api/api.htm?${params.toString()}`
      )

      return response.data.response.jobs?.map((job: any) => ({
        id: `glassdoor_${job.jobId}`,
        title: job.jobTitle,
        company: job.employerName,
        location: job.location,
        description: job.jobDescription,
        url: job.jobUrl,
        salary: job.salary,
        postedDate: job.postedDate,
        source: 'Glassdoor',
        linkedinJobId: undefined
      })) || []
    } catch (error) {
      console.error('Error searching Glassdoor jobs:', error)
      return []
    }
  }

  private removeDuplicateJobs(jobs: JobPosting[]): JobPosting[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  async getJobDetails(jobId: string, source: string): Promise<JobPosting | null> {
    try {
      if (source === 'Indeed') {
        return await this.getIndeedJobDetails(jobId)
      } else if (source === 'Glassdoor') {
        return await this.getGlassdoorJobDetails(jobId)
      }
      return null
    } catch (error) {
      console.error('Error fetching job details:', error)
      return null
    }
  }

  private async getIndeedJobDetails(jobId: string): Promise<JobPosting | null> {
    try {
      const params = new URLSearchParams({
        publisher: this.indeedApiKey,
        jobkeys: jobId.replace('indeed_', ''),
        format: 'json',
        v: '2'
      })

      const response = await axios.get(
        `https://api.indeed.com/ads/apigetjob?${params.toString()}`
      )

      const job = response.data.results?.[0]
      if (!job) return null

      return {
        id: `indeed_${job.jobkey}`,
        title: job.jobtitle,
        company: job.company,
        location: job.formattedLocation,
        description: job.snippet,
        url: job.url,
        salary: job.salary,
        postedDate: job.formattedRelativeTime,
        source: 'Indeed',
        linkedinJobId: undefined
      }
    } catch (error) {
      console.error('Error fetching Indeed job details:', error)
      return null
    }
  }

  private async getGlassdoorJobDetails(jobId: string): Promise<JobPosting | null> {
    try {
      const params = new URLSearchParams({
        't.p': this.glassdoorApiKey,
        't.k': 'your_partner_id',
        userip: '0.0.0.0',
        useragent: 'Mozilla/5.0',
        jobId: jobId.replace('glassdoor_', '')
      })

      const response = await axios.get(
        `https://api.glassdoor.com/api/api.htm?${params.toString()}`
      )

      const job = response.data.response.jobs?.[0]
      if (!job) return null

      return {
        id: `glassdoor_${job.jobId}`,
        title: job.jobTitle,
        company: job.employerName,
        location: job.location,
        description: job.jobDescription,
        url: job.jobUrl,
        salary: job.salary,
        postedDate: job.postedDate,
        source: 'Glassdoor',
        linkedinJobId: undefined
      }
    } catch (error) {
      console.error('Error fetching Glassdoor job details:', error)
      return null
    }
  }

  async searchLinkedInJobs(
    linkedinService: any,
    keywords: string,
    location?: string,
    limit: number = 25
  ): Promise<JobPosting[]> {
    try {
      const jobs = await linkedinService.searchJobs(keywords, location, limit)
      
      return jobs.map((job: any) => ({
        id: `linkedin_${job.id}`,
        title: job.title,
        company: job.companyName,
        location: job.location,
        description: job.description,
        url: job.jobUrl,
        salary: job.salary,
        postedDate: job.postedDate,
        source: 'LinkedIn',
        linkedinJobId: job.id
      }))
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error)
      return []
    }
  }
}
