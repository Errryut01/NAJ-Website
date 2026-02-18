import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from '@/lib/prisma'

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1'
const GROK_API_KEY = process.env.GROK_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { userId, job } = await request.json()

    if (!userId || !job) {
      return NextResponse.json(
        { error: 'User ID and job information are required' },
        { status: 400 }
      )
    }

    if (!GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      )
    }

    // Use Grok to find hiring managers and recruiters for the role
    const prompt = `
Based on the following job posting, identify potential hiring managers and recruiters who might be involved in the hiring process for this role.

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}

Please identify:
1. Hiring managers (department heads, team leads, etc.)
2. Recruiters (talent acquisition, HR recruiters)
3. Sales managers (if applicable for sales roles)

For each contact, provide:
- Name
- Title/Position
- Company (usually the same as the job posting)
- Role type: "hiring_manager", "recruiter", or "sales_manager"
- LinkedIn profile URL if you can identify it (format: https://linkedin.com/in/...)
- Email if you can identify it

Return a JSON array with the following structure:
[
  {
    "name": "Full Name",
    "title": "Job Title",
    "company": "Company Name",
    "role": "hiring_manager|recruiter|sales_manager",
    "linkedInUrl": "https://linkedin.com/in/... (optional)",
    "email": "email@example.com (optional)"
  }
]

Return ONLY a valid JSON array, no additional text or formatting.
Try to find at least 3-5 relevant contacts per role.
`

    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying hiring managers and recruiters for job openings. Use your knowledge of typical company structures and roles to find relevant contacts. Return only valid JSON arrays.'
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
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const content = response.data.choices[0].message.content.trim()
    
    // Parse the JSON response
    let contacts
    try {
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        contacts = JSON.parse(jsonMatch[0])
      } else {
        contacts = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Error parsing Grok response:', parseError)
      console.error('Response content:', content)
      contacts = []
    }

    // Ensure contacts is an array
    if (!Array.isArray(contacts)) {
      contacts = []
    }

    // Create job application record if it doesn't exist
    const companyApplicationMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const jobApplication = await prisma.jobApplication.upsert({
      where: {
        userId_company_companyApplicationMonth: {
          userId,
          company: job.company,
          companyApplicationMonth,
        }
      },
      update: {
        jobTitle: job.title,
        jobUrl: job.url,
        jobDescription: job.description,
        location: job.location,
      },
      create: {
        userId,
        jobTitle: job.title,
        company: job.company,
        jobUrl: job.url,
        jobDescription: job.description,
        location: job.location,
        companyApplicationMonth,
        status: 'DRAFT',
      }
    })

    // Save contacts to database
    const savedContacts = await Promise.all(
      contacts.map(async (contact: any) => {
        return prisma.contact.create({
          data: {
            userId,
            jobApplicationId: jobApplication.id,
            name: contact.name || 'Unknown',
            title: contact.title || null,
            company: contact.company || job.company,
            email: contact.email || null,
            linkedInUrl: contact.linkedInUrl || null,
            role: contact.role || 'hiring_manager',
            approved: false,
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      contacts: savedContacts.map(c => ({
        id: c.id,
        name: c.name,
        title: c.title,
        company: c.company,
        email: c.email,
        linkedInUrl: c.linkedInUrl,
        role: c.role,
        approved: c.approved,
      })),
      count: savedContacts.length
    })
  } catch (error: any) {
    console.error('Error finding contacts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find contacts' },
      { status: 500 }
    )
  }
}



