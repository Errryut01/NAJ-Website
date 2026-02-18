import axios from 'axios'
import { GrokResponse, UserProfile, JobPosting } from '@/lib/types'

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.grok.com/v1'
const GROK_API_KEY = process.env.GROK_API_KEY

export class GrokService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GROK_API_KEY || ''
  }

  async generateResume(
    profile: UserProfile,
    jobPosting: JobPosting,
    preferences?: any
  ): Promise<string> {
    try {
      const prompt = this.buildResumePrompt(profile, jobPosting, preferences)
      
      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer who creates compelling, ATS-friendly resumes tailored to specific job postings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Error generating resume:', error)
      throw new Error('Failed to generate resume')
    }
  }

  async generateCoverLetter(
    profile: UserProfile,
    jobPosting: JobPosting,
    preferences?: any
  ): Promise<string> {
    try {
      const prompt = this.buildCoverLetterPrompt(profile, jobPosting, preferences)
      
      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cover letter writer who creates personalized, compelling cover letters that demonstrate genuine interest and value proposition.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Error generating cover letter:', error)
      throw new Error('Failed to generate cover letter')
    }
  }

  async generateLinkedInMessage(
    profile: UserProfile,
    connection: any,
    jobPosting: JobPosting,
    messageType: string
  ): Promise<string> {
    try {
      const prompt = this.buildLinkedInMessagePrompt(profile, connection, jobPosting, messageType)
      
      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at writing professional LinkedIn messages that are personalized, respectful, and likely to get responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Error generating LinkedIn message:', error)
      throw new Error('Failed to generate LinkedIn message')
    }
  }

  async generatePersonalizedEmail(
    profile: UserProfile,
    connection: any,
    jobApplication: any
  ): Promise<{ subject: string; body: string }> {
    try {
      const prompt = this.buildPersonalizedEmailPrompt(profile, connection, jobApplication)
      
      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at writing professional, personalized emails for job networking. Your emails should be warm, professional, and position the sender as a strong candidate while asking for a brief connection. Keep emails concise but impactful.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0].message.content
      
      // Parse the response to extract subject and body
      const lines = content.split('\n')
      let subject = ''
      let body = ''
      let inBody = false
      
      for (const line of lines) {
        if (line.startsWith('Subject:') || line.startsWith('SUBJECT:')) {
          subject = line.replace(/^(Subject:|SUBJECT:)\s*/i, '').trim()
        } else if (line.startsWith('Body:') || line.startsWith('BODY:') || line.startsWith('Email:')) {
          inBody = true
          body = line.replace(/^(Body:|BODY:|Email:)\s*/i, '').trim()
        } else if (inBody && line.trim()) {
          body += '\n' + line
        }
      }
      
      // If no explicit subject/body structure, treat the whole content as body
      if (!subject || !body) {
        const parts = content.split('\n\n')
        if (parts.length >= 2) {
          subject = parts[0].replace(/^(Subject:|SUBJECT:)\s*/i, '').trim()
          body = parts.slice(1).join('\n\n').trim()
        } else {
          subject = `Re: ${jobApplication.title} Position at ${jobApplication.company}`
          body = content
        }
      }

      return { subject, body }
    } catch (error) {
      console.error('Error generating personalized email:', error)
      throw new Error('Failed to generate personalized email')
    }
  }

  private buildResumePrompt(profile: UserProfile, jobPosting: JobPosting, preferences?: any): string {
    return `
Create a tailored resume for the following job posting:

JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
Location: ${jobPosting.location}
Description: ${jobPosting.description}

CANDIDATE PROFILE:
Name: ${profile.firstName} ${profile.lastName}
Current Title: ${profile.currentTitle || 'N/A'}
Current Company: ${profile.currentCompany || 'N/A'}
Years Experience: ${profile.yearsExperience || 'N/A'}
Summary: ${profile.summary || 'N/A'}
Skills: ${profile.skills?.join(', ') || 'N/A'}

EXPERIENCE:
${JSON.stringify(profile.experience, null, 2)}

EDUCATION:
${JSON.stringify(profile.education, null, 2)}

Requirements:
1. Format as a professional resume
2. Highlight relevant skills and experience for this specific role
3. Use keywords from the job description
4. Keep it concise and ATS-friendly
5. Include a compelling professional summary
6. Focus on achievements and quantifiable results

Generate a complete resume that would make this candidate stand out for this specific position.
    `.trim()
  }

  private buildCoverLetterPrompt(profile: UserProfile, jobPosting: JobPosting, preferences?: any): string {
    return `
Create a personalized cover letter for the following job posting:

JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
Location: ${jobPosting.location}
Description: ${jobPosting.description}

CANDIDATE PROFILE:
Name: ${profile.firstName} ${profile.lastName}
Current Title: ${profile.currentTitle || 'N/A'}
Current Company: ${profile.currentCompany || 'N/A'}
Summary: ${profile.summary || 'N/A'}

Requirements:
1. Write in a professional but engaging tone
2. Show genuine interest in the company and role
3. Highlight 2-3 key qualifications that match the job
4. Include specific examples of relevant achievements
5. Keep it concise (3-4 paragraphs)
6. End with a clear call to action
7. Make it personal and authentic

Generate a compelling cover letter that demonstrates why this candidate is perfect for this role.
    `.trim()
  }

  private buildLinkedInMessagePrompt(profile: UserProfile, connection: any, jobPosting: JobPosting, messageType: string): string {
    const basePrompt = `
Create a professional LinkedIn message for the following scenario:

CANDIDATE:
Name: ${profile.firstName} ${profile.lastName}
Title: ${profile.currentTitle || 'N/A'}
Company: ${profile.currentCompany || 'N/A'}

CONNECTION:
Name: ${connection.name}
Title: ${connection.title || 'N/A'}
Company: ${connection.company || 'N/A'}

JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
    `.trim()

    switch (messageType) {
      case 'CONNECTION_REQUEST':
        return `${basePrompt}

MESSAGE TYPE: Connection Request
Requirements:
1. Keep it under 300 characters
2. Mention a specific reason for connecting
3. Be professional and respectful
4. Reference the company or industry
5. Don't be overly salesy

Generate a connection request message.`

      case 'FOLLOW_UP':
        return `${basePrompt}

MESSAGE TYPE: Follow-up after connection
Requirements:
1. Thank them for accepting the connection
2. Mention your interest in the specific job posting
3. Ask for a brief conversation
4. Be respectful of their time
5. Keep it concise and professional

Generate a follow-up message.`

      case 'INTEREST_EXPRESSION':
        return `${basePrompt}

MESSAGE TYPE: Expressing interest in a position
Requirements:
1. Show genuine interest in the role
2. Highlight relevant experience briefly
3. Ask for a brief conversation
4. Be professional and respectful
5. Keep it under 500 characters

Generate an interest expression message.`

      default:
        return `${basePrompt}

MESSAGE TYPE: General professional message
Requirements:
1. Be professional and respectful
2. Keep it concise
3. Show genuine interest
4. Ask for a brief conversation

Generate a professional message.`
    }
  }

  private buildPersonalizedEmailPrompt(profile: UserProfile, connection: any, jobApplication: any): string {
    return `
Create a personalized professional email for job networking:

CANDIDATE:
Name: ${profile.firstName} ${profile.lastName}
Title: ${profile.currentTitle || 'N/A'}
Company: ${profile.currentCompany || 'N/A'}
Summary: ${profile.summary || 'N/A'}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'N/A'}

CONNECTION:
Name: ${connection.name}
Title: ${connection.title || 'N/A'}
Company: ${connection.company || 'N/A'}
Search Criteria: ${connection.searchCriteria || 'N/A'}

JOB APPLICATION:
Title: ${jobApplication.title}
Company: ${jobApplication.company}
Status: ${jobApplication.status || 'Applied'}

EMAIL REQUIREMENTS:
1. Write a warm, professional email that positions the candidate as a strong fit
2. Reference the specific job application and company
3. Highlight 2-3 key qualifications that match the role
4. Ask for a brief 15-30 minute conversation
5. Show genuine interest in the company and role
6. Be respectful of their time
7. Keep it concise but impactful (3-4 paragraphs)
8. Use a professional but approachable tone

FORMAT:
Subject: [Compelling subject line]
Body: [Email content]

Generate a personalized email that will help the candidate connect with this professional for their job search.
    `.trim()
  }
}
