import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching applications for userId:', userId)
    
    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connected successfully')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' }
    })

    console.log(`Found ${applications.length} applications for user ${userId}`)
    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, jobTitle, company, jobUrl, jobDescription, location, salary, source } = body

    console.log('Creating job application:', { userId, jobTitle, company, source })

    if (!userId || !jobTitle || !company) {
      console.log('Missing required fields:', { userId: !!userId, jobTitle: !!jobTitle, company: !!company })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Prisma client type:', typeof prisma)
    console.log('Prisma client jobApplication type:', typeof prisma.jobApplication)

    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connected successfully for POST')
    } catch (dbError) {
      console.error('Database connection failed for POST:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const currentDate = new Date()
    const companyApplicationMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    // Check if application already exists for this company this month
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId,
        company,
        companyApplicationMonth
      }
    })

    if (existingApplication) {
      console.log('Application already exists for this company this month:', company)
      return NextResponse.json({ error: 'Application already exists for this company this month' }, { status: 409 })
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobTitle,
        company,
        jobUrl,
        jobDescription,
        location,
        salary,
        source,
        appliedAt: currentDate,
        status: 'APPLIED',
        currentStage: 'Application Submitted',
        nextActions: [
          'Wait for response (1-2 weeks)',
          'Follow up with recruiter',
          'Prepare for potential interview'
        ],
        companyApplicationMonth
      }
    })

    console.log('Application created successfully:', application.id)
    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}