import axios from 'axios'

export interface JobAnalysis {
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

export interface SimilarJobSearch {
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

export class GrokJobAnalyzer {
  private apiKey: string
  private baseUrl: string = 'https://api.x.ai/v1'

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Grok API key not configured')
    }
  }

  /**
   * Analyze a job posting from a URL and extract key information
   */
  async analyzeJobPosting(jobUrl: string): Promise<JobAnalysis> {
    if (!this.apiKey) {
      throw new Error('Grok API key not configured')
    }

    try {
      // First, we need to scrape the job posting content
      const jobContent = await this.scrapeJobPosting(jobUrl)
      
      const prompt = `
Analyze this job posting and extract the following information in JSON format:

Job URL: ${jobUrl}
Job Content: ${jobContent}

Please extract and return ONLY a valid JSON object with these exact fields:
{
  "title": "Job title",
  "company": "Company name", 
  "location": "Job location",
  "description": "Brief job description (2-3 sentences)",
  "requirements": ["requirement1", "requirement2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "skills": ["skill1", "skill2", ...],
  "experienceLevel": "entry|mid|senior|executive",
  "jobType": "full-time|part-time|contract|internship",
  "remoteWork": true/false,
  "salaryRange": {"min": number, "max": number, "currency": "USD"},
  "industry": "Industry name",
  "department": "Department name"
}

Only return the JSON object, no additional text or formatting.
`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0].message.content.trim()
      
      // Parse the JSON response
      try {
        const analysis = JSON.parse(content)
        return this.validateJobAnalysis(analysis)
      } catch (parseError) {
        console.error('Failed to parse Grok response:', parseError)
        console.error('Raw response:', content)
        throw new Error('Failed to parse job analysis from Grok')
      }
    } catch (error) {
      console.error('Error analyzing job posting:', error)
      throw new Error(`Failed to analyze job posting: ${error.message}`)
    }
  }

  /**
   * Generate search parameters for finding similar jobs based on job analysis
   */
  async generateSimilarJobSearch(jobAnalysis: JobAnalysis): Promise<SimilarJobSearch> {
    if (!this.apiKey) {
      throw new Error('Grok API key not configured')
    }

    const prompt = `
Based on this job analysis, generate search parameters to find 10 similar job opportunities:

Job Analysis:
- Title: ${jobAnalysis.title}
- Company: ${jobAnalysis.company}
- Location: ${jobAnalysis.location}
- Description: ${jobAnalysis.description}
- Skills: ${jobAnalysis.skills.join(', ')}
- Experience Level: ${jobAnalysis.experienceLevel}
- Job Type: ${jobAnalysis.jobType}
- Industry: ${jobAnalysis.industry}
- Department: ${jobAnalysis.department}

Generate search parameters that will find similar roles. Return ONLY a valid JSON object with these fields:
{
  "searchQuery": "optimized search query for job boards",
  "location": "preferred location (can be same as original or broader)",
  "filters": {
    "experienceLevel": "entry|mid|senior|executive",
    "jobType": "full-time|part-time|contract|internship", 
    "remoteWork": true/false,
    "salaryMin": number (optional),
    "industry": "industry name"
  }
}

Focus on finding roles with similar:
- Skill requirements
- Experience level
- Job responsibilities
- Industry focus

Only return the JSON object, no additional text.
`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0].message.content.trim()
      
      try {
        const searchParams = JSON.parse(content)
        return this.validateSimilarJobSearch(searchParams)
      } catch (parseError) {
        console.error('Failed to parse Grok search response:', parseError)
        throw new Error('Failed to generate similar job search parameters')
      }
    } catch (error) {
      console.error('Error generating similar job search:', error)
      throw new Error(`Failed to generate search parameters: ${error.message}`)
    }
  }

  /**
   * Scrape job posting content from URL
   */
  private async scrapeJobPosting(url: string): Promise<string> {
    try {
      // For now, we'll use a simple fetch approach
      // In production, you might want to use a more robust scraping service
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job posting: ${response.status}`)
      }
      
      const html = await response.text()
      
      // Simple text extraction - remove HTML tags and get readable content
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      // Limit content length to avoid token limits
      return textContent.substring(0, 8000)
    } catch (error) {
      console.error('Error scraping job posting:', error)
      throw new Error(`Failed to scrape job posting: ${error.message}`)
    }
  }

  /**
   * Validate and sanitize job analysis data
   */
  private validateJobAnalysis(analysis: any): JobAnalysis {
    return {
      title: analysis.title || 'Unknown Title',
      company: analysis.company || 'Unknown Company',
      location: analysis.location || 'Unknown Location',
      description: analysis.description || 'No description available',
      requirements: Array.isArray(analysis.requirements) ? analysis.requirements : [],
      responsibilities: Array.isArray(analysis.responsibilities) ? analysis.responsibilities : [],
      skills: Array.isArray(analysis.skills) ? analysis.skills : [],
      experienceLevel: ['entry', 'mid', 'senior', 'executive'].includes(analysis.experienceLevel) 
        ? analysis.experienceLevel : 'mid',
      jobType: ['full-time', 'part-time', 'contract', 'internship'].includes(analysis.jobType)
        ? analysis.jobType : 'full-time',
      remoteWork: Boolean(analysis.remoteWork),
      salaryRange: analysis.salaryRange || undefined,
      industry: analysis.industry || 'Unknown Industry',
      department: analysis.department || 'Unknown Department'
    }
  }

  /**
   * Validate and sanitize similar job search parameters
   */
  private validateSimilarJobSearch(search: any): SimilarJobSearch {
    return {
      searchQuery: search.searchQuery || 'Software Engineer',
      location: search.location || 'Remote',
      filters: {
        experienceLevel: ['entry', 'mid', 'senior', 'executive'].includes(search.filters?.experienceLevel)
          ? search.filters.experienceLevel : undefined,
        jobType: ['full-time', 'part-time', 'contract', 'internship'].includes(search.filters?.jobType)
          ? search.filters.jobType : undefined,
        remoteWork: Boolean(search.filters?.remoteWork),
        salaryMin: typeof search.filters?.salaryMin === 'number' ? search.filters.salaryMin : undefined,
        industry: search.filters?.industry || undefined
      }
    }
  }
}

// Export singleton instance
export const grokJobAnalyzer = new GrokJobAnalyzer()
