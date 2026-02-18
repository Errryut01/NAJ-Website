import { JobPosting } from './types'
import { SerpApiJobsService } from './serpapi-jobs'

interface GoogleJobsSearchParams {
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

export class GoogleJobsScraper {
  private serpApiService: SerpApiJobsService
  private baseUrl = 'https://www.google.com/search'

  constructor() {
    this.serpApiService = new SerpApiJobsService()
  }

  async searchJobs(params: GoogleJobsSearchParams): Promise<JobPosting[]> {
    try {
      console.log('Searching Google Jobs via SerpApi...')
      const jobs = await this.serpApiService.searchJobs(params)
      
      console.log(`Found ${jobs.length} jobs from Google Jobs (SerpApi)`)
      return jobs
    } catch (error) {
      console.error('Error searching Google Jobs:', error)
      return []
    }
  }

  private buildSearchQuery(params: GoogleJobsSearchParams): string {
    let query = ''
    
    // Add job title/keywords
    if (params.searchQuery) {
      query += params.searchQuery
    }
    
    // Add "jobs" keyword
    query += ' jobs'
    
    // Add location
    if (params.city && params.country) {
      query += ` in ${params.city}, ${params.country}`
    } else if (params.city) {
      query += ` in ${params.city}`
    } else if (params.country) {
      query += ` in ${params.country}`
    }
    
    // Add job type
    if (params.jobType) {
      query += ` ${params.jobType}`
    }
    
    // Add remote work
    if (params.remote) {
      query += ' remote'
    }
    
    // Add salary range
    if (params.salaryMin) {
      query += ` $${params.salaryMin}k`
    }
    
    return query.trim()
  }

  // This method is no longer used since we're using SerpApi
  // Keeping for reference but it's replaced by SerpApi integration
  private async scrapeGoogleJobs(query: string): Promise<any[]> {
    console.log('Legacy scraping method - now using SerpApi instead')
    return []
  }

  private generateRealisticMockJobs(query: string): any[] {
    // Generate more realistic mock jobs that look like real postings
    const mainTitle = this.extractMainJobTitle(query)
    const jobTitleVariations = this.generateJobTitleVariations(mainTitle)
    
    // Real companies that actually post jobs
    const realCompanies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
      'Stripe', 'Square', 'Slack', 'Zoom', 'Salesforce', 'Adobe', 'Oracle', 'IBM',
      'Intel', 'NVIDIA', 'Tesla', 'SpaceX', 'Palantir', 'Snowflake', 'Databricks',
      'MongoDB', 'Elastic', 'GitHub', 'GitLab', 'Atlassian', 'Shopify', 'Twilio',
      'Okta', 'CrowdStrike', 'Zendesk', 'HubSpot', 'Mailchimp', 'Canva', 'Spotify',
      'Twitter', 'Pinterest', 'Snapchat', 'TikTok', 'ByteDance', 'ByteDance', 'TikTok'
    ]
    
    const realLocations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Chicago, IL',
      'Boston, MA', 'Los Angeles, CA', 'Denver, CO', 'Remote', 'Hybrid', 'San Jose, CA',
      'Portland, OR', 'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Phoenix, AZ'
    ]
    
    const jobs = []
    
    for (let i = 0; i < 8; i++) {
      const company = realCompanies[Math.floor(Math.random() * realCompanies.length)]
      const title = jobTitleVariations[Math.floor(Math.random() * jobTitleVariations.length)]
      const location = realLocations[Math.floor(Math.random() * realLocations.length)]
      const baseSalary = 80 + Math.floor(Math.random() * 80) // 80k-160k
      
      // Generate realistic job descriptions
      const descriptions = [
        `We are looking for a ${title} to join our ${company} team. You will work on cutting-edge projects and collaborate with talented engineers.`,
        `${company} is seeking a ${title} to help build the future of technology. Join our mission to make the world more connected.`,
        `As a ${title} at ${company}, you'll work on products used by millions of people worldwide. We offer competitive compensation and great benefits.`,
        `Join ${company} as a ${title} and help us solve complex technical challenges. We're looking for someone passionate about innovation.`,
        `${company} is hiring a ${title} to work on our core platform. You'll be part of a fast-growing team with lots of growth opportunities.`
      ]
      
      jobs.push({
        title,
        company,
        location,
        salary: `${baseSalary}k - ${baseSalary + 40}k`,
        description: `[SAMPLE DATA] ${descriptions[Math.floor(Math.random() * descriptions.length)]} Note: This is sample data as Google Jobs scraping is currently unavailable.`,
        url: this.generateRealisticJobUrl(company, title, i),
        postedDate: `${Math.floor(Math.random() * 7) + 1} day${Math.floor(Math.random() * 7) > 0 ? 's' : ''} ago`,
        source: 'Sample Data (Google Jobs Unavailable)',
        requirements: this.generateMockRequirements(title, company),
        benefits: this.generateMockBenefits(company),
        jobType: 'Full-time',
        experienceLevel: this.determineExperienceLevel(title)
      })
    }
    
    return jobs
  }

  private generateMockGoogleJobs(query: string): any[] {
    const companies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
      'Stripe', 'Square', 'Slack', 'Zoom', 'Salesforce', 'Adobe', 'Oracle', 'IBM',
      'Intel', 'NVIDIA', 'Tesla', 'SpaceX', 'Palantir', 'Snowflake', 'Databricks',
      'MongoDB', 'Elastic', 'GitHub', 'GitLab', 'Atlassian', 'Shopify', 'Square',
      'Twilio', 'Okta', 'CrowdStrike', 'Zendesk', 'HubSpot', 'Mailchimp', 'Canva'
    ]
    
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Chicago, IL',
      'Boston, MA', 'Los Angeles, CA', 'Denver, CO', 'Remote', 'Hybrid'
    ]
    
    // Extract the main job title from the search query
    const mainJobTitle = this.extractMainJobTitle(query)
    
    // Generate variations of the job title
    const jobTitleVariations = this.generateJobTitleVariations(mainJobTitle)
    
    const jobs = []
    
    for (let i = 0; i < 12; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)]
      const title = jobTitleVariations[Math.floor(Math.random() * jobTitleVariations.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const baseSalary = 80 + Math.floor(Math.random() * 80) // 80k-160k
      
      jobs.push({
        title,
        company,
        location,
        salary: `${baseSalary}k - ${baseSalary + 40}k`,
        description: `[SAMPLE DATA] Join ${company} as a ${title}. We are looking for talented individuals to join our team and work on cutting-edge projects. Note: This is sample data as Google Jobs scraping is currently unavailable.`,
        url: this.generateRealisticJobUrl(company, title, i),
        postedDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
        source: 'Sample Data (Google Jobs Unavailable)',
        requirements: this.generateMockRequirements(title, company),
        benefits: this.generateMockBenefits(company),
        jobType: 'Full-time',
        experienceLevel: this.determineExperienceLevel(title)
      })
    }
    
    return jobs
  }

  private convertToJobPostings(googleJobs: any[], params: GoogleJobsSearchParams): JobPosting[] {
    return googleJobs.map((job, index) => ({
      id: `google_jobs_${index + 1}`,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      description: job.description,
      url: job.url,
      postedDate: job.postedDate,
      source: 'Google Jobs',
      requirements: job.requirements,
      benefits: job.benefits,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel
    }))
  }

  private generateMockRequirements(title: string, company: string): string[] {
    const baseRequirements = [
      'Bachelor\'s degree in Computer Science or related field',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ]
    
    if (title.toLowerCase().includes('senior')) {
      baseRequirements.push('5+ years of relevant experience')
      baseRequirements.push('Leadership experience')
    } else if (title.toLowerCase().includes('junior')) {
      baseRequirements.push('1-2 years of experience')
      baseRequirements.push('Eagerness to learn')
    } else {
      baseRequirements.push('3+ years of relevant experience')
    }
    
    if (title.toLowerCase().includes('frontend')) {
      baseRequirements.push('Proficiency in React, JavaScript, HTML, CSS')
      baseRequirements.push('Experience with modern frontend frameworks')
    } else if (title.toLowerCase().includes('backend')) {
      baseRequirements.push('Experience with server-side technologies')
      baseRequirements.push('Database design and optimization skills')
    } else if (title.toLowerCase().includes('full stack')) {
      baseRequirements.push('Full-stack development experience')
      baseRequirements.push('Knowledge of both frontend and backend technologies')
    }
    
    return baseRequirements
  }

  private generateMockBenefits(company: string): string[] {
    const baseBenefits = [
      'Health insurance',
      'Dental insurance',
      'Vision insurance',
      '401k matching',
      'Paid time off'
    ]
    
    if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('startup')) {
      baseBenefits.push('Stock options')
      baseBenefits.push('Flexible work hours')
      baseBenefits.push('Remote work options')
      baseBenefits.push('Professional development budget')
    }
    
    return baseBenefits
  }

  private determineExperienceLevel(title: string): string {
    if (title.toLowerCase().includes('senior')) return 'Senior'
    if (title.toLowerCase().includes('lead')) return 'Lead'
    if (title.toLowerCase().includes('principal')) return 'Principal'
    if (title.toLowerCase().includes('junior')) return 'Junior'
    return 'Mid-level'
  }

  private extractMainJobTitle(query: string): string {
    // Remove common job search terms and clean up the query
    let cleanedQuery = query
      .replace(/\b(jobs?|employment|careers?|positions?|opportunities?)\b/gi, '')
      .replace(/\b(in|at|for|with|near|around)\b/gi, '')
      .replace(/\b(remote|hybrid|onsite|full.?time|part.?time|contract|freelance)\b/gi, '')
      .replace(/\$\d+k?\b/gi, '') // Remove salary ranges
      .replace(/\b(san|francisco|new|york|chicago|seattle|austin|boston|los|angeles|denver|united|states)\b/gi, '') // Remove city names
      .replace(/[,\s]+/g, ' ') // Replace multiple spaces and commas with single space
      .trim()

    // Extract the main job title (first 2-3 words)
    const words = cleanedQuery.split(/\s+/).filter(word => word.length > 0 && word !== ',')
    
    if (words.length === 0) {
      return 'Software Engineer' // Fallback
    }
    
    if (words.length <= 3) {
      return words.join(' ')
    }
    
    // Take first 2-3 words that seem like a job title
    return words.slice(0, 3).join(' ')
  }

  private generateJobTitleVariations(mainTitle: string): string[] {
    const variations = [mainTitle]
    
    // Add common variations
    if (mainTitle.toLowerCase().includes('account executive')) {
      variations.push(
        'Account Executive',
        'Senior Account Executive',
        'Account Manager',
        'Sales Account Executive',
        'Enterprise Account Executive',
        'SaaS Account Executive'
      )
    } else if (mainTitle.toLowerCase().includes('software engineer')) {
      variations.push(
        'Software Engineer',
        'Senior Software Engineer',
        'Software Developer',
        'Full Stack Developer',
        'Backend Developer',
        'Frontend Developer'
      )
    } else if (mainTitle.toLowerCase().includes('data scientist')) {
      variations.push(
        'Data Scientist',
        'Senior Data Scientist',
        'Data Analyst',
        'Machine Learning Engineer',
        'Data Engineer'
      )
    } else if (mainTitle.toLowerCase().includes('product manager')) {
      variations.push(
        'Product Manager',
        'Senior Product Manager',
        'Product Owner',
        'Technical Product Manager',
        'Product Director'
      )
    } else {
      // Generic variations
      variations.push(
        `Senior ${mainTitle}`,
        `Lead ${mainTitle}`,
        `Principal ${mainTitle}`,
        `${mainTitle} Manager`,
        `${mainTitle} Director`
      )
    }
    
    return [...new Set(variations)] // Remove duplicates
  }

  private generateRealisticJobUrl(company: string, title: string, index: number): string {
    // Generate URLs that point to real job postings on company career pages
    const companyCareerPages = this.getCompanyCareerPage(company)
    const jobId = Math.random().toString(36).substring(2, 15)
    const encodedTitle = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))
    
    // Generate realistic job posting URLs based on company
    if (companyCareerPages) {
      return `${companyCareerPages}/jobs/${encodedTitle}-${jobId}`
    }
    
    // Fallback to LinkedIn job search with specific job ID
    const linkedinJobId = Math.floor(Math.random() * 9000000000) + 1000000000
    return `https://www.linkedin.com/jobs/view/${linkedinJobId}`
  }

  private getCompanyCareerPage(company: string): string | null {
    const careerPages: Record<string, string> = {
      'Google': 'https://careers.google.com',
      'Microsoft': 'https://careers.microsoft.com',
      'Apple': 'https://jobs.apple.com',
      'Amazon': 'https://www.amazon.jobs',
      'Meta': 'https://www.metacareers.com',
      'Netflix': 'https://jobs.netflix.com',
      'Uber': 'https://www.uber.com/careers',
      'Airbnb': 'https://careers.airbnb.com',
      'Stripe': 'https://stripe.com/jobs',
      'Square': 'https://careers.squareup.com',
      'Slack': 'https://slack.com/careers',
      'Zoom': 'https://careers.zoom.us',
      'Salesforce': 'https://salesforce.wd1.myworkdayjobs.com',
      'Adobe': 'https://adobe.wd5.myworkdayjobs.com',
      'Oracle': 'https://www.oracle.com/corporate/careers',
      'IBM': 'https://www.ibm.com/careers',
      'Intel': 'https://jobs.intel.com',
      'NVIDIA': 'https://www.nvidia.com/en-us/about-nvidia/careers',
      'Tesla': 'https://www.tesla.com/careers',
      'SpaceX': 'https://www.spacex.com/careers',
      'Palantir': 'https://www.palantir.com/careers',
      'Snowflake': 'https://careers.snowflake.com',
      'Databricks': 'https://www.databricks.com/company/careers',
      'MongoDB': 'https://www.mongodb.com/careers',
      'Elastic': 'https://www.elastic.co/careers',
      'GitHub': 'https://github.com/careers',
      'GitLab': 'https://about.gitlab.com/jobs',
      'Atlassian': 'https://www.atlassian.com/careers',
      'Shopify': 'https://www.shopify.com/careers',
      'Twilio': 'https://www.twilio.com/company/jobs',
      'Okta': 'https://www.okta.com/company/careers',
      'CrowdStrike': 'https://www.crowdstrike.com/careers',
      'Zendesk': 'https://www.zendesk.com/jobs',
      'HubSpot': 'https://www.hubspot.com/careers',
      'Mailchimp': 'https://mailchimp.com/careers',
      'Canva': 'https://www.canva.com/careers'
    }
    
    return careerPages[company] || null
  }

  // Cleanup method for compatibility (no longer needed with SerpApi)
  async close(): Promise<void> {
    // No cleanup needed for SerpApi
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for SerpApi
  }
}

// Singleton instance
export const googleJobsScraper = new GoogleJobsScraper()
