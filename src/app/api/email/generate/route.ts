import { NextRequest, NextResponse } from 'next/server'
import { GrokService } from '@/lib/services/grok'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, connectionId, jobApplicationId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user profile and Grok credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        grokCredentials: true
      }
    })

    if (!user || !user.grokCredentials) {
      return NextResponse.json({ error: 'User profile or Grok credentials not found' }, { status: 404 })
    }

    // Get connection details
    let connection = null
    if (connectionId) {
      connection = await prisma.linkedInConnection.findUnique({
        where: { id: connectionId }
      })
    }

    // Get job application details
    let jobApplication = null
    if (jobApplicationId) {
      jobApplication = await prisma.jobApplication.findUnique({
        where: { id: jobApplicationId }
      })
    }

    // If no specific connection or job provided, get a sample for demonstration
    if (!connection) {
      connection = await prisma.linkedInConnection.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!jobApplication) {
      jobApplication = await prisma.jobApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!connection || !jobApplication) {
      return NextResponse.json({ 
        error: 'No connections or job applications found to generate email for' 
      }, { status: 404 })
    }

    // Initialize Grok service
    const grokService = new GrokService(user.grokCredentials.apiKey)

    // Generate personalized email
    const emailContent = await grokService.generatePersonalizedEmail(
      user.profile!,
      connection,
      jobApplication
    )

    return NextResponse.json({
      success: true,
      email: {
        subject: emailContent.subject,
        body: emailContent.body,
        recipient: {
          name: connection.name,
          title: connection.title,
          company: connection.company
        },
        job: {
          title: jobApplication.jobTitle,
          company: jobApplication.company
        }
      }
    })

  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's connections and job applications for sample generation
    const connections = await prisma.linkedInConnection.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    const jobApplications = await prisma.jobApplication.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })

    if (connections.length === 0 || jobApplications.length === 0) {
      return NextResponse.json({ 
        error: 'No connections or job applications found' 
      }, { status: 404 })
    }

    // Generate sample emails for the first few connections
    const sampleEmails = []
    
    for (let i = 0; i < Math.min(3, connections.length); i++) {
      const connection = connections[i]
      const jobApplication = jobApplications[i % jobApplications.length] // Cycle through jobs
      
      try {
        // Get user profile and Grok credentials
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            grokCredentials: true
          }
        })

        if (user && user.grokCredentials && user.profile) {
          const grokService = new GrokService(user.grokCredentials.apiKey)
          
          const emailContent = await grokService.generatePersonalizedEmail(
            user.profile,
            connection,
            jobApplication
          )

          sampleEmails.push({
            id: `sample_${i}`,
            connectionId: connection.id,
            jobApplicationId: jobApplication.id,
            subject: emailContent.subject,
            body: emailContent.body,
            recipient: {
              name: connection.name,
              title: connection.title,
              company: connection.company
            },
            job: {
              title: jobApplication.jobTitle,
              company: jobApplication.company
            }
          })
        }
      } catch (error) {
        console.error(`Error generating sample email for connection ${connection.id}:`, error)
        // Continue with next connection
      }
    }

    return NextResponse.json({
      success: true,
      sampleEmails
    })

  } catch (error) {
    console.error('Sample email generation error:', error)
    return NextResponse.json({ error: 'Failed to generate sample emails' }, { status: 500 })
  }
}
