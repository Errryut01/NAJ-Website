import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LinkedInService } from '@/lib/services/linkedin'
import { GrokService } from '@/lib/services/grok'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const connectionId = searchParams.get('connectionId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const where: any = { userId }
    if (connectionId) {
      where.connectionId = connectionId
    }

    const messages = await prisma.linkedInMessage.findMany({
      where,
      include: {
        connection: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      userId, 
      connectionId, 
      messageType, 
      content, 
      linkedinAccessToken, 
      grokApiKey,
      jobApplicationId 
    } = data

    if (!userId || !connectionId) {
      return NextResponse.json({ error: 'User ID and connection ID are required' }, { status: 400 })
    }

    // Get connection details
    const connection = await prisma.linkedInConnection.findUnique({
      where: { id: connectionId }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Get user profile for message generation
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    let messageContent = content

    // Generate message using Grok if no content provided
    if (!messageContent && grokApiKey && profile) {
      try {
        const grokService = new GrokService(grokApiKey)
        
        // Get job application details if provided
        let jobData = { 
          id: 'mock-job',
          title: 'Software Engineer', 
          company: 'Tech Company',
          location: 'Remote',
          description: 'Software engineering position',
          url: 'https://example.com/job',
          postedDate: '2024-01-01',
          source: 'Mock'
        }
        
        if (jobApplicationId) {
          const jobApplication = await prisma.jobApplication.findUnique({
            where: { id: jobApplicationId }
          })
          if (jobApplication) {
            jobData = {
              id: jobApplication.id,
              title: jobApplication.jobTitle,
              company: jobApplication.company,
              location: jobApplication.location || 'Unknown',
              description: jobApplication.jobDescription || 'Job description not available',
              url: jobApplication.jobUrl || 'https://example.com/job',
              postedDate: jobApplication.appliedAt?.toISOString().split('T')[0] || '2024-01-01',
              source: 'Application'
            }
          }
        }

        messageContent = await grokService.generateLinkedInMessage(
          profile,
          connection,
          jobData,
          messageType || 'FOLLOW_UP'
        )
      } catch (error) {
        console.error('Error generating message with Grok:', error)
        messageContent = 'Hello! I hope you\'re doing well.'
      }
    }

    // Send message via LinkedIn API
    let messageSent = false
    if (linkedinAccessToken) {
      try {
        const linkedinService = new LinkedInService(linkedinAccessToken)
        messageSent = await linkedinService.sendMessage(
          connection.linkedinId,
          messageContent
        )
      } catch (error) {
        console.error('Error sending message via LinkedIn:', error)
      }
    }

    // Save message to database
    const message = await prisma.linkedInMessage.create({
      data: {
        userId,
        connectionId,
        content: messageContent,
        messageType: messageType || 'FOLLOW_UP',
        status: messageSent ? 'SENT' : 'PENDING',
        sentAt: messageSent ? new Date() : undefined,
        jobApplicationId
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { messageId, status } = data

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const message = await prisma.linkedInMessage.update({
      where: { id: messageId },
      data: {
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
