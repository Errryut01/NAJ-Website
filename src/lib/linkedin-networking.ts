import { JobPosting } from './types'

export interface LinkedInPerson {
  id: string
  name: string
  title: string
  company: string
  profileUrl: string
  isConnection: boolean
  category: 'connection' | 'recruiter' | 'hiring_manager' | 'potential_contact'
  mutualConnections?: number
  location?: string
  profileImage?: string
  summary?: string
}

export interface NetworkingAnalysis {
  targetCompany: string
  connections: LinkedInPerson[]
  recruiters: LinkedInPerson[]
  hiringManagers: LinkedInPerson[]
  potentialContacts: LinkedInPerson[]
  totalFound: number
}

export class LinkedInNetworkingService {
  private rapidApiKey = process.env.RAPIDAPI_LINKEDIN_KEY || ''
  private rapidApiHost = 'linkedin-job-search-api.p.rapidapi.com'

  async analyzeNetworkingOpportunities(jobs: JobPosting[]): Promise<NetworkingAnalysis[]> {
    const companyAnalysis: { [key: string]: NetworkingAnalysis } = {}

    // Group jobs by company
    const jobsByCompany = this.groupJobsByCompany(jobs)

    for (const [company, companyJobs] of Object.entries(jobsByCompany)) {
      console.log(`Analyzing networking opportunities for ${company}...`)
      
      const analysis = await this.analyzeCompanyNetworking(company, companyJobs)
      companyAnalysis[company] = analysis
    }

    return Object.values(companyAnalysis)
  }

  private groupJobsByCompany(jobs: JobPosting[]): { [key: string]: JobPosting[] } {
    const grouped: { [key: string]: JobPosting[] } = {}
    
    jobs.forEach(job => {
      if (!grouped[job.company]) {
        grouped[job.company] = []
      }
      grouped[job.company].push(job)
    })

    return grouped
  }

  private async analyzeCompanyNetworking(company: string, jobs: JobPosting[]): Promise<NetworkingAnalysis> {
    try {
      // Find existing connections at the company
      const connections = await this.findConnectionsAtCompany(company)
      
      // Find recruiters at the company
      const recruiters = await this.findRecruitersAtCompany(company)
      
      // Find potential hiring managers (placeholder for now)
      const hiringManagers = await this.findHiringManagersAtCompany(company, jobs)
      
      // Find other potential contacts
      const potentialContacts = await this.findPotentialContactsAtCompany(company)

      return {
        targetCompany: company,
        connections: connections,
        recruiters: recruiters,
        hiringManagers: hiringManagers,
        potentialContacts: potentialContacts,
        totalFound: connections.length + recruiters.length + hiringManagers.length + potentialContacts.length
      }
    } catch (error) {
      console.error(`Error analyzing networking for ${company}:`, error)
      return {
        targetCompany: company,
        connections: [],
        recruiters: [],
        hiringManagers: [],
        potentialContacts: [],
        totalFound: 0
      }
    }
  }

  private async findConnectionsAtCompany(company: string): Promise<LinkedInPerson[]> {
    try {
      // This would typically use LinkedIn's connections API
      // For now, we'll simulate with mock data
      return this.generateMockConnections(company)
    } catch (error) {
      console.error(`Error finding connections at ${company}:`, error)
      return []
    }
  }

  private async findRecruitersAtCompany(company: string): Promise<LinkedInPerson[]> {
    try {
      // Search for people with recruiter/talent titles at the company
      const searchQueries = [
        `"talent acquisition" AND "${company}"`,
        `"recruiter" AND "${company}"`,
        `"talent" AND "${company}"`,
        `"hiring manager" AND "${company}"`
      ]

      const allRecruiters: LinkedInPerson[] = []
      
      for (const query of searchQueries) {
        const recruiters = await this.searchLinkedInPeople(query, company)
        allRecruiters.push(...recruiters)
      }

      // Remove duplicates and categorize
      const uniqueRecruiters = this.removeDuplicatePeople(allRecruiters)
      return uniqueRecruiters.map(person => {
        const isConnection = this.isExistingConnection(person.id)
        return {
          ...person,
          category: isConnection ? 'connection' as const : 'recruiter' as const,
          isConnection: isConnection
        }
      })
    } catch (error) {
      console.error(`Error finding recruiters at ${company}:`, error)
      return []
    }
  }

  private async findHiringManagersAtCompany(company: string, jobs: JobPosting[]): Promise<LinkedInPerson[]> {
    // Placeholder for hiring manager identification
    // This will be implemented when user defines hiring manager criteria
    return []
  }

  private async findPotentialContactsAtCompany(company: string): Promise<LinkedInPerson[]> {
    try {
      // Find other relevant people at the company
      const searchQuery = `"${company}" AND "engineer" OR "manager" OR "director"`
      const contacts = await this.searchLinkedInPeople(searchQuery, company)
      
      // Check if any are existing connections
      return contacts.map(person => {
        const isConnection = this.isExistingConnection(person.id)
        return {
          ...person,
          category: isConnection ? 'connection' as const : 'potential_contact' as const,
          isConnection: isConnection
        }
      })
    } catch (error) {
      console.error(`Error finding potential contacts at ${company}:`, error)
      return []
    }
  }

  private async searchLinkedInPeople(searchQuery: string, company: string): Promise<LinkedInPerson[]> {
    try {
      // This would use LinkedIn's people search API
      // For now, we'll simulate with mock data
      return this.generateMockPeople(searchQuery, company)
    } catch (error) {
      console.error(`Error searching LinkedIn people:`, error)
      return []
    }
  }

  private generateMockConnections(company: string): LinkedInPerson[] {
    const firstNames = ['Sarah', 'Michael', 'Jennifer', 'David', 'Alex', 'Maria', 'James', 'Lisa', 'Robert', 'Emily']
    const lastNames = ['Johnson', 'Chen', 'Martinez', 'Wilson', 'Thompson', 'Garcia', 'Brown', 'Davis', 'Miller', 'Anderson']
    const titles = ['Senior Software Engineer', 'Product Manager', 'Engineering Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager', 'Sales Director', 'Operations Manager']
    const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Chicago, IL', 'Boston, MA', 'Los Angeles, CA', 'Denver, CO']
    
    const numConnections = Math.floor(Math.random() * 3) + 1 // 1-3 connections
    const mockConnections: LinkedInPerson[] = []

    for (let i = 0; i < numConnections; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const title = titles[Math.floor(Math.random() * titles.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const mutualConnections = Math.floor(Math.random() * 20) + 1

      mockConnections.push({
        id: `conn_${company.toLowerCase()}_${i + 1}`,
        name: `${firstName} ${lastName}`,
        title: title,
        company: company,
        profileUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${company.toLowerCase()}`,
        isConnection: true,
        category: 'connection' as const,
        mutualConnections: mutualConnections,
        location: location,
        summary: `Experienced professional with expertise in ${title.toLowerCase()} and related technologies`
      })
    }

    return mockConnections
  }

  private generateMockPeople(searchQuery: string, company: string): LinkedInPerson[] {
    const isRecruiter = searchQuery.toLowerCase().includes('recruiter') || 
                       searchQuery.toLowerCase().includes('talent')

    const firstNames = ['Jennifer', 'David', 'Sarah', 'Michael', 'Lisa', 'Robert', 'Maria', 'James', 'Emily', 'Alex']
    const lastNames = ['Martinez', 'Wilson', 'Johnson', 'Chen', 'Davis', 'Brown', 'Garcia', 'Miller', 'Anderson', 'Thompson']
    const locations = ['Austin, TX', 'Seattle, WA', 'San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Boston, MA', 'Los Angeles, CA', 'Denver, CO']

    if (isRecruiter) {
      const recruiterTitles = [
        'Senior Talent Acquisition Specialist',
        'Technical Recruiter',
        'Talent Acquisition Manager',
        'Senior Recruiter',
        'Talent Partner',
        'Recruiting Manager',
        'Talent Acquisition Lead',
        'Technical Talent Acquisition'
      ]
      
      const numRecruiters = Math.floor(Math.random() * 3) + 1 // 1-3 recruiters
      const recruiters: LinkedInPerson[] = []

      for (let i = 0; i < numRecruiters; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const title = recruiterTitles[Math.floor(Math.random() * recruiterTitles.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]

        recruiters.push({
          id: `recruiter_${company.toLowerCase()}_${i + 1}`,
          name: `${firstName} ${lastName}`,
          title: title,
          company: company,
          profileUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${company.toLowerCase()}`,
          isConnection: false,
          category: 'recruiter' as const,
          location: location,
          summary: 'Talent acquisition professional specializing in tech and engineering roles'
        })
      }

      return recruiters
    }

    // Generate potential contacts
    const contactTitles = [
      'Engineering Manager',
      'Senior Software Engineer',
      'Product Manager',
      'Director of Engineering',
      'VP of Engineering',
      'Technical Lead',
      'Principal Engineer',
      'Head of Product'
    ]

    const numContacts = Math.floor(Math.random() * 2) + 1 // 1-2 contacts
    const contacts: LinkedInPerson[] = []

    for (let i = 0; i < numContacts; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const title = contactTitles[Math.floor(Math.random() * contactTitles.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]

      contacts.push({
        id: `contact_${company.toLowerCase()}_${i + 1}`,
        name: `${firstName} ${lastName}`,
        title: title,
        company: company,
        profileUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${company.toLowerCase()}`,
        isConnection: false,
        category: 'potential_contact' as const,
        location: location,
        summary: `Experienced leader with expertise in ${title.toLowerCase()} and team management`
      })
    }

    return contacts
  }

  private removeDuplicatePeople(people: LinkedInPerson[]): LinkedInPerson[] {
    const seen = new Set<string>()
    return people.filter(person => {
      if (seen.has(person.id)) {
        return false
      }
      seen.add(person.id)
      return true
    })
  }

  private isExistingConnection(personId: string): boolean {
    // This would check against your actual LinkedIn connections
    // For now, we'll simulate with some logic - 20% chance of being a connection
    return personId.includes('conn_') || Math.random() < 0.2
  }

  async getNetworkingSummary(analyses: NetworkingAnalysis[]): Promise<{
    totalCompanies: number
    totalConnections: number
    totalRecruiters: number
    totalHiringManagers: number
    totalPotentialContacts: number
    topCompanies: { company: string; count: number }[]
  }> {
    const summary = {
      totalCompanies: analyses.length,
      totalConnections: 0,
      totalRecruiters: 0,
      totalHiringManagers: 0,
      totalPotentialContacts: 0,
      topCompanies: [] as { company: string; count: number }[]
    }

    const companyCounts: { [key: string]: number } = {}

    analyses.forEach(analysis => {
      summary.totalConnections += analysis.connections.length
      summary.totalRecruiters += analysis.recruiters.length
      summary.totalHiringManagers += analysis.hiringManagers.length
      summary.totalPotentialContacts += analysis.potentialContacts.length

      const totalForCompany = analysis.totalFound
      companyCounts[analysis.targetCompany] = totalForCompany
    })

    summary.topCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return summary
  }
}

// Singleton instance
export const linkedinNetworkingService = new LinkedInNetworkingService()
