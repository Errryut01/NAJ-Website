import { JobPosting } from './types'

export interface SerpApiJobResult {
  title: string
  company_name: string
  location: string
  via: string
  description: string
  thumbnail?: string
  extensions?: string[]
  detected_extensions?: {
    health_insurance?: boolean
    paid_time_off?: boolean
    schedule_type?: string
    work_from_home?: boolean
    dental_coverage?: boolean
  }
  job_highlights?: Array<{
    title: string
    items: string[]
  }>
  apply_options?: Array<{
    title: string
    link: string
  }>
  job_id: string
  share_link: string
}

export interface SerpApiResponse {
  jobs_results?: SerpApiJobResult[]
  error?: string
}

export class SerpApiJobsService {
  private apiKey: string
  private baseUrl = 'https://serpapi.com/search'

  constructor() {
    // You'll need to get an API key from https://serpapi.com/
    // For now, we'll use a placeholder that can be set via environment variable
    this.apiKey = process.env.SERPAPI_KEY || 'demo-key'
  }

  async searchJobs(params: {
    searchQuery: string
    city?: string
    country?: string
    jobDescription?: string
    salaryMin?: number
    salaryMax?: number
    jobType?: string
    remote?: boolean
    postedWithin?: string
  }): Promise<JobPosting[]> {
    try {
      console.log('Searching jobs with SerpApi Google Jobs API...')

      if (this.apiKey === 'demo-key') {
        console.log('SerpApi key not configured, using mock data')
        return this.generateMockJobs(params)
      }

      // Build search query
      let query = params.searchQuery
      if (params.city && params.country) {
        query += ` jobs in ${params.city}, ${params.country}`
      } else if (params.country) {
        query += ` jobs in ${params.country}`
      }

      // Build URL parameters
      const urlParams = new URLSearchParams({
        engine: 'google_jobs',
        q: query,
        api_key: this.apiKey,
        num: '10', // Reduced from 20 to 10 to save API usage
        hl: 'en', // Language
        gl: 'us' // Country
      })

      // Add optional filters
      if (params.jobType) {
        urlParams.append('employment_type', params.jobType)
      }

      if (params.postedWithin) {
        // Map postedWithin to SerpApi's date_posted parameter
        const dateMapping: Record<string, string> = {
          '1': 'today',
          '3': '3days',
          '7': 'week',
          '30': 'month'
        }
        const datePosted = dateMapping[params.postedWithin]
        if (datePosted) {
          urlParams.append('date_posted', datePosted)
        }
      }

      const url = `${this.baseUrl}?${urlParams.toString()}`
      console.log('SerpApi URL:', url.replace(this.apiKey, 'API_KEY_HIDDEN'))

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`)
      }

      const data: SerpApiResponse = await response.json()

      if (data.error) {
        throw new Error(`SerpApi error: ${data.error}`)
      }

      if (!data.jobs_results || data.jobs_results.length === 0) {
        console.log('No jobs found via SerpApi')
        return this.generateMockJobs(params)
      }

      console.log(`Found ${data.jobs_results.length} jobs via SerpApi`)

      // Convert SerpApi results to our JobPosting format
      const jobs = data.jobs_results.map(job => this.convertSerpApiJobToJobPosting(job))

      // Apply salary filtering if specified
      if (params.salaryMin) {
        return jobs.filter(job => this.matchesSalaryFilter(job, params.salaryMin, params.salaryMax))
      }

      return jobs

    } catch (error) {
      console.error('Error with SerpApi Google Jobs API:', error)
      console.log('Falling back to mock data')
      return this.generateMockJobs(params)
    }
  }

  private convertSerpApiJobToJobPosting(serpJob: SerpApiJobResult): JobPosting {
    // Extract salary from extensions or description
    let salary = 'Salary not specified'
    if (serpJob.extensions) {
      const salaryExt = serpJob.extensions.find(ext => 
        ext.includes('$') || ext.includes('k') || ext.includes('hour')
      )
      if (salaryExt) {
        salary = salaryExt
      }
    }

    // Extract job type from extensions
    let jobType = 'Full-time'
    if (serpJob.detected_extensions?.schedule_type) {
      jobType = serpJob.detected_extensions.schedule_type
    }

    // Build requirements from job highlights
    const requirements = serpJob.job_highlights
      ?.find(highlight => 
        highlight.title.toLowerCase().includes('qualification') || 
        highlight.title.toLowerCase().includes('requirement')
      )?.items || []

    // Build benefits from job highlights
    const benefits = serpJob.job_highlights
      ?.find(highlight => highlight.title.toLowerCase().includes('benefit'))
      ?.items || []

    // Use the first apply option as the main URL, or fall back to share_link
    const applyUrl = serpJob.apply_options?.[0]?.link || serpJob.share_link

    return {
      id: serpJob.job_id,
      title: serpJob.title,
      company: serpJob.company_name,
      location: serpJob.location,
      salary,
      description: serpJob.description,
      url: applyUrl,
      postedDate: 'Recently posted', // SerpApi doesn't always provide this
      source: 'Google Jobs (SerpApi)',
      requirements,
      benefits,
      jobType,
      experienceLevel: this.determineExperienceLevel(serpJob.title)
    }
  }

  private determineExperienceLevel(title: string): string {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      return 'Senior-level'
    } else if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('associate')) {
      return 'Entry-level'
    } else if (titleLower.includes('director') || titleLower.includes('manager') || titleLower.includes('head')) {
      return 'Executive-level'
    }
    return 'Mid-level'
  }

  private matchesSalaryFilter(job: JobPosting, minSalary?: number, maxSalary?: number): boolean {
    if (!minSalary && !maxSalary) return true

    const salaryStr = job.salary?.toLowerCase() || ''
    
    // Extract numeric values from salary string
    const numbers = salaryStr.match(/\d+/g)
    if (!numbers || numbers.length === 0) return true // Include jobs without salary info

    const salaries = numbers.map(Number)
    
    // Check if any salary in the range matches our filter
    for (const salary of salaries) {
      // Handle different salary formats (annual vs hourly)
      let annualSalary = salary
      if (salaryStr.includes('hour') || salaryStr.includes('/hr')) {
        annualSalary = salary * 2080 // Convert hourly to annual (40 hours/week * 52 weeks)
      } else if (salary < 100) {
        // Assume it's in thousands if it's a small number
        annualSalary = salary * 1000
      }

      if (minSalary && annualSalary < minSalary * 1000) continue
      if (maxSalary && annualSalary > maxSalary * 1000) continue
      
      return true
    }

    return false
  }

  private generateMockJobs(params: {
    searchQuery: string
    city?: string
    country?: string
    jobDescription?: string
    salaryMin?: number
    salaryMax?: number
    jobType?: string
    remote?: boolean
    postedWithin?: string
  }): JobPosting[] {
    const companies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
      'Stripe', 'Square', 'Slack', 'Zoom', 'Salesforce', 'Adobe', 'Oracle', 'IBM'
    ]

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Chicago, IL',
      'Boston, MA', 'Los Angeles, CA', 'Denver, CO', 'Remote', 'Hybrid'
    ]

    const jobs: JobPosting[] = []

    for (let i = 0; i < 8; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const baseSalary = 80 + Math.floor(Math.random() * 80) // 80k-160k

      jobs.push({
        id: `mock-${Date.now()}-${i}`,
        title: params.searchQuery,
        company,
        location,
        salary: `${baseSalary}k - ${baseSalary + 40}k`,
        description: `[SAMPLE DATA - SerpApi not configured] Join ${company} as a ${params.searchQuery}. We are looking for talented individuals to join our team.`,
        url: `https://careers.${company.toLowerCase().replace(' ', '')}.com/jobs/${params.searchQuery.toLowerCase().replace(' ', '-')}-${i}`,
        postedDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
        source: 'Sample Data (SerpApi not configured)',
        requirements: ['Bachelor\'s degree or equivalent experience', 'Strong communication skills'],
        benefits: ['Health insurance', 'Dental coverage', 'Paid time off'],
        jobType: params.jobType || 'Full-time',
        experienceLevel: 'Mid-level'
      })
    }

    return jobs
  }
}
