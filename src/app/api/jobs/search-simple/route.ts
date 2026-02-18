import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1'
const GROK_API_KEY = process.env.GROK_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { userId, jobDescription } = await request.json()

    if (!userId || !jobDescription) {
      return NextResponse.json(
        { error: 'User ID and job description are required' },
        { status: 400 }
      )
    }

    if (!GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      )
    }

    // Use Grok to find 10 similar job openings
    const prompt = `
Based on the following job description, find 10 similar open job positions that are currently available.

Job Description: ${jobDescription}

Please return a JSON array of job openings with the following structure for each job:
{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location",
  "description": "Brief job description (2-3 sentences)",
  "url": "Job posting URL (if available)"
}

Return ONLY a valid JSON array, no additional text or formatting.
Make sure to include actual job openings that are currently available based on the description provided.
`

    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert job search assistant. Find real, currently available job openings that match user descriptions. Return only valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
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
    let jobs
    try {
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jobs = JSON.parse(jsonMatch[0])
      } else {
        jobs = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Error parsing Grok response:', parseError)
      console.error('Response content:', content)
      
      // Fallback: return empty array or mock data
      jobs = []
    }

    // Ensure jobs is an array and limit to 10
    if (!Array.isArray(jobs)) {
      jobs = []
    }
    
    // Add IDs to jobs
    const jobsWithIds = jobs.slice(0, 10).map((job, index) => ({
      ...job,
      id: `job_${Date.now()}_${index}`,
    }))

    return NextResponse.json({
      success: true,
      jobs: jobsWithIds,
      count: jobsWithIds.length
    })
  } catch (error: any) {
    console.error('Error searching for jobs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search for jobs' },
      { status: 500 }
    )
  }
}



