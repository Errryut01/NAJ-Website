import axios from 'axios'
import { LinkedInConnection, LinkedInMessage, ConnectionStatus, MessageStatus } from '@/lib/types'

export class LinkedInService {
  private accessToken: string
  private baseUrl = 'https://api.linkedin.com/v2'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getProfile(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error)
      throw new Error('Failed to fetch LinkedIn profile')
    }
  }

  async searchPeople(
    keywords: string,
    companyId?: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        q: 'people',
        keywords: keywords,
        count: limit.toString()
      })

      if (companyId) {
        params.append('current-company', companyId)
      }

      const response = await axios.get(
        `${this.baseUrl}/peopleSearch?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.elements || []
    } catch (error) {
      console.error('Error searching people:', error)
      throw new Error('Failed to search people on LinkedIn')
    }
  }

  async getCompanyEmployees(companyId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/companies/${companyId}/employees`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            count: limit
          }
        }
      )

      return response.data.elements || []
    } catch (error) {
      console.error('Error fetching company employees:', error)
      throw new Error('Failed to fetch company employees')
    }
  }

  async sendConnectionRequest(
    profileId: string,
    message?: string
  ): Promise<boolean> {
    try {
      const payload: any = {
        recipients: [profileId]
      }

      if (message) {
        payload.message = message
      }

      await axios.post(
        `${this.baseUrl}/peopleSearch`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return true
    } catch (error) {
      console.error('Error sending connection request:', error)
      return false
    }
  }

  async sendMessage(
    recipientId: string,
    message: string
  ): Promise<boolean> {
    try {
      // Note: LinkedIn's messaging API requires special permissions
      // This is a simplified implementation
      const payload = {
        recipients: [recipientId],
        subject: 'Professional Inquiry',
        body: message
      }

      await axios.post(
        `${this.baseUrl}/messaging/conversations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  async getConnections(limit: number = 100): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/people/~/connections`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            count: limit
          }
        }
      )

      return response.data.elements || []
    } catch (error) {
      console.error('Error fetching connections:', error)
      throw new Error('Failed to fetch LinkedIn connections')
    }
  }

  async searchJobs(
    keywords: string,
    location?: string,
    limit: number = 25
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        keywords: keywords,
        count: limit.toString()
      })

      if (location) {
        params.append('locationName', location)
      }

      const response = await axios.get(
        `${this.baseUrl}/jobSearch?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.elements || []
    } catch (error) {
      console.error('Error searching jobs:', error)
      throw new Error('Failed to search jobs on LinkedIn')
    }
  }

  async getJobDetails(jobId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error fetching job details:', error)
      throw new Error('Failed to fetch job details')
    }
  }

  async applyToJob(jobId: string, applicationData: any): Promise<boolean> {
    try {
      // Note: LinkedIn job application API requires special permissions
      // This is a simplified implementation
      const payload = {
        jobId: jobId,
        ...applicationData
      }

      await axios.post(
        `${this.baseUrl}/jobs/${jobId}/applications`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return true
    } catch (error) {
      console.error('Error applying to job:', error)
      return false
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        }
      )

      return response.data.access_token
    } catch (error) {
      console.error('Error refreshing access token:', error)
      throw new Error('Failed to refresh access token')
    }
  }
}
