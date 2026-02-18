import { JobPosting } from '../types'

interface GlassdoorSearchParams {
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

export class GlassdoorJobAPI {
  private rapidApiKey = process.env.RAPIDAPI_LINKEDIN_KEY || ''
  private rapidApiHost = 'glassdoor-api.p.rapidapi.com'

  async searchJobs(params: GlassdoorSearchParams): Promise<JobPosting[]> {
    try {
      console.log('Searching Glassdoor jobs...')
      
      const searchQuery = params.searchQuery || 'software engineer'
      const location = params.city && params.country 
        ? `${params.city}, ${params.country}` 
        : params.city || params.country || 'United States'

      const url = `https://${this.rapidApiHost}/jobs`
      const queryParams = new URLSearchParams({
        q: searchQuery,
        l: location,
        limit: '20'
      })

      const response = await fetch(`${url}?${queryParams}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        }
      })

      if (!response.ok) {
        console.log(`Glassdoor API error: ${response.status}`)
        return []
      }

      const data = await response.json()
      const jobs = data.jobs || data.data || data.results || []

      return jobs.map((job: any, index: number) => this.transformJob(job, index))
    } catch (error) {
      console.error('Glassdoor API error:', error)
      return []
    }
  }

  private transformJob(job: any, index: number): JobPosting {
    return {
      id: `glassdoor_${job.jobId || job.id || index}`,
      title: job.title || job.jobTitle || 'Job Title Not Available',
      company: job.company || job.companyName || 'Company Not Available',
      location: job.location || job.jobLocation || 'Location Not Available',
      description: job.description || job.jobDescription || job.summary || 'No description available',
      salary: job.salary || job.salaryRange || job.compensation || null,
      jobType: job.jobType || job.employmentType || 'Full-time',
      postedDate: job.postedDate || job.datePosted || job.createdAt || 'Recently',
      applyUrl: job.applyUrl || job.jobUrl || job.url || '#',
      source: 'Glassdoor',
      requirements: job.requirements || job.qualifications || [],
      benefits: job.benefits || [],
      remote: job.remote || job.workFromHome || false,
      experience: job.experience || job.experienceLevel || 'Not specified',
      education: job.education || job.educationLevel || 'Not specified'
    }
  }
}

export const glassdoorJobAPI = new GlassdoorJobAPI()
