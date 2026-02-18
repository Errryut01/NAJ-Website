import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RapidApiLinkedInService } from '@/lib/rapidapi-linkedin'
import { LinkedInService } from '@/lib/services/linkedin'
import { GrokService } from '@/lib/services/grok'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const where: any = { userId }
    if (status && status !== 'all') {
      where.status = status
    }

    const connections = await prisma.linkedInConnection.findMany({
      where,
      include: {
        messages: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, linkedinAccessToken, searchCriteria, grokApiKey, targetCompanies } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Handle target companies filtering for connections discovery
    if (targetCompanies && Array.isArray(targetCompanies)) {
      return await handleTargetCompaniesConnections(userId, targetCompanies)
    }

    if (!linkedinAccessToken) {
      return NextResponse.json({ error: 'LinkedIn access token is required for connection creation' }, { status: 400 })
    }

    const linkedinService = new LinkedInService(linkedinAccessToken)
    const connections = []

    // Search for people based on criteria
    if (searchCriteria) {
      const { keywords, companyId, limit = 10 } = searchCriteria
      
      let people = []
      if (companyId) {
        people = await linkedinService.getCompanyEmployees(companyId, limit)
      } else if (keywords) {
        people = await linkedinService.searchPeople(keywords, undefined, limit)
      }

      // Get user profile for message generation
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      })

      for (const person of people) {
        // Check if connection already exists
        const existingConnection = await prisma.linkedInConnection.findFirst({
          where: {
            userId,
            linkedinId: person.id
          }
        })

        if (existingConnection) {
          continue
        }

        // Generate connection request message using Grok
        let connectionMessage = 'Hi! I\'d like to connect with you.'
        
        if (grokApiKey && profile) {
          try {
            const grokService = new GrokService(grokApiKey)
            connectionMessage = await grokService.generateLinkedInMessage(
              profile,
              person,
              { 
                id: 'mock-job',
                title: 'Software Engineer', 
                company: 'Tech Company',
                location: 'Remote',
                description: 'Software engineering position',
                url: 'https://example.com/job',
                postedDate: '2024-01-01',
                source: 'Mock'
              },
              'CONNECTION_REQUEST'
            )
          } catch (error) {
            console.error('Error generating connection message:', error)
          }
        }

        // Send connection request
        const connectionSent = await linkedinService.sendConnectionRequest(
          person.id,
          connectionMessage
        )

        if (connectionSent) {
          // Save connection to database
          const connection = await prisma.linkedInConnection.create({
            data: {
              userId,
              linkedinId: person.id,
              name: person.name || 'Unknown',
              title: person.title,
              company: person.company,
              profileUrl: person.profileUrl || '',
              status: 'PENDING'
            }
          })

          // Save connection request message
          await prisma.linkedInMessage.create({
            data: {
              userId,
              connectionId: connection.id,
              content: connectionMessage,
              messageType: 'CONNECTION_REQUEST',
              status: 'SENT',
              sentAt: new Date()
            }
          })

          connections.push(connection)
        }
      }
    }

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error creating connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { connectionId, status } = data

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 })
    }

    const connection = await prisma.linkedInConnection.update({
      where: { id: connectionId },
      data: {
        status,
        connectedAt: status === 'CONNECTED' ? new Date() : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ connection })
  } catch (error) {
    console.error('Error updating connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle connections discovery for target companies
async function handleTargetCompaniesConnections(userId: string, targetCompanies: string[]) {
  try {
    console.log('Fetching connections for target companies:', targetCompanies)
    
    // Get existing connections from database
    const existingConnections = await prisma.linkedInConnection.findMany({
      where: { userId },
      include: {
        messages: true
      }
    })

    // Fetch real LinkedIn connections for target companies (process only 1 company to avoid rate limits)
    const limitedCompanies = targetCompanies.slice(0, 1)
    console.log(`Processing ${limitedCompanies.length} company (limited to avoid rate limits): ${limitedCompanies.join(', ')}`)
    
    const companyConnections = []
    
    // Process companies sequentially to respect rate limits
    for (const company of limitedCompanies) {
      console.log(`Processing company: ${company}`)
      const companyResult = await processCompany(company, existingConnections)
      companyConnections.push(companyResult)
      
      // Add delay between companies if we have more than one
      if (limitedCompanies.length > 1) {
        console.log('Waiting 30 seconds before processing next company...')
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
    }
    
    async function processCompany(company: string, existingConnections: any[]) {
      // Filter existing 1st degree connections for this company
      const companyExistingConnections = existingConnections.filter(conn => 
        conn.company?.toLowerCase().includes(company.toLowerCase()) ||
        company.toLowerCase().includes(conn.company?.toLowerCase() || '')
      )

      // Fetch LinkedIn profiles for this company
      const linkedInProfiles = await fetchLinkedInProfilesForCompany(company)
      
      // Combine existing connections with LinkedIn profiles
      const allConnections = [
        // Existing 1st degree connections
        ...companyExistingConnections.map(conn => ({
          id: conn.id,
          name: conn.name || 'Unknown',
          title: conn.title || 'Unknown Title',
          company: conn.company || company,
          location: 'Unknown Location',
          connectionType: 'existing' as const,
          profileUrl: conn.profileUrl || '#',
          isConnection: true,
          status: conn.status,
          mutualConnections: Math.floor(Math.random() * 10),
          lastInteraction: conn.updatedAt?.toISOString().split('T')[0]
        })),
        // LinkedIn profiles (categorized)
        ...linkedInProfiles
      ]

      return {
        company,
        connections: allConnections,
        totalConnections: allConnections.length,
        existingConnections: companyExistingConnections.length,
        potentialConnections: linkedInProfiles.filter(c => c.connectionType === 'potential').length,
        recruiters: linkedInProfiles.filter(c => c.connectionType === 'recruiter').length,
        hiringManagers: linkedInProfiles.filter(c => c.connectionType === 'hiring_manager').length
      }
    }

    return NextResponse.json({
      success: true,
      companyConnections
    })

  } catch (error) {
    console.error('Error fetching target company connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fetch LinkedIn profiles for a company with proper categorization
async function fetchLinkedInProfilesForCompany(company: string) {
  try {
    console.log(`Fetching LinkedIn profiles for ${company} using RapidAPI LinkedIn service...`)
    
    // Initialize RapidAPI LinkedIn service
    const linkedInService = new RapidApiLinkedInService()
    
      // Fetch LinkedIn profiles using RapidAPI - make only ONE call per company to avoid rate limits
      const allEmployees = await linkedInService.searchCompanyEmployees(company, 'employee')
      
      // Categorize the results locally instead of making multiple API calls
      const recruiters = allEmployees.filter(profile => 
        profile.jobTitle?.toLowerCase().includes('recruiter') ||
        profile.jobTitle?.toLowerCase().includes('talent') ||
        profile.headline?.toLowerCase().includes('recruiter') ||
        profile.headline?.toLowerCase().includes('talent')
      )
      
      const hiringManagers = allEmployees.filter(profile =>
        profile.jobTitle?.toLowerCase().includes('manager') ||
        profile.jobTitle?.toLowerCase().includes('director') ||
        profile.jobTitle?.toLowerCase().includes('vice president') ||
        profile.jobTitle?.toLowerCase().includes('vp') ||
        profile.headline?.toLowerCase().includes('manager') ||
        profile.headline?.toLowerCase().includes('director')
      )
      
      const otherEmployees = allEmployees.filter(profile => 
        !recruiters.includes(profile) && !hiringManagers.includes(profile)
      )

    // Convert RapidAPI LinkedIn profiles to the expected format
    const convertedProfiles = [
      ...recruiters.map(profile => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.jobTitle || profile.headline,
        company: profile.companyName || company,
        location: profile.location,
        connectionType: 'recruiter' as const,
        profileUrl: profile.profileUrl || '#',
        isConnection: profile.connectionDegree === '1st',
        status: profile.connectionDegree === '1st' ? 'CONNECTED' : 'NOT_CONNECTED',
        mutualConnections: profile.mutualConnections || 0,
        lastInteraction: profile.lastInteraction
      })),
      ...hiringManagers.map(profile => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.jobTitle || profile.headline,
        company: profile.companyName || company,
        location: profile.location,
        connectionType: 'hiring_manager' as const,
        profileUrl: profile.profileUrl || '#',
        isConnection: profile.connectionDegree === '1st',
        status: profile.connectionDegree === '1st' ? 'CONNECTED' : 'NOT_CONNECTED',
        mutualConnections: profile.mutualConnections || 0,
        lastInteraction: profile.lastInteraction
      })),
      ...otherEmployees.map(profile => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.jobTitle || profile.headline,
        company: profile.companyName || company,
        location: profile.location,
        connectionType: 'potential' as const,
        profileUrl: profile.profileUrl || '#',
        isConnection: profile.connectionDegree === '1st',
        status: profile.connectionDegree === '1st' ? 'CONNECTED' : 'NOT_CONNECTED',
        mutualConnections: profile.mutualConnections || 0,
        lastInteraction: profile.lastInteraction
      }))
    ]

    console.log(`Found ${convertedProfiles.length} profiles for ${company}`)
    return convertedProfiles
    } catch (error) {
      console.error(`Error fetching LinkedIn profiles for ${company}:`, error)
      // Return empty array if API fails - no more mock data
      return []
    }
}

// Simulate LinkedIn People Search API
async function searchLinkedInProfiles(company: string, searchType: 'recruiter' | 'hiring_manager' | 'employee') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const profiles = []
  
  if (searchType === 'recruiter') {
    // Search for recruiters with "recruiter" and "talent" in title
    profiles.push(
      {
        id: `linkedin-recruiter-${company}-1`,
        name: 'Sarah Johnson',
        title: 'Senior Talent Acquisition Manager',
        company,
        location: 'San Francisco, CA',
        connectionType: 'recruiter' as const,
        profileUrl: `https://linkedin.com/in/sarah-johnson-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 15) + 1,
        lastInteraction: undefined,
        searchCriteria: 'talent acquisition'
      },
      {
        id: `linkedin-recruiter-${company}-2`,
        name: 'David Kim',
        title: 'Technical Recruiter',
        company,
        location: 'New York, NY',
        connectionType: 'recruiter' as const,
        profileUrl: `https://linkedin.com/in/david-kim-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 10) + 1,
        lastInteraction: undefined,
        searchCriteria: 'technical recruiter'
      },
      {
        id: `linkedin-recruiter-${company}-3`,
        name: 'Maria Rodriguez',
        title: 'Talent Acquisition Specialist',
        company,
        location: 'Austin, TX',
        connectionType: 'recruiter' as const,
        profileUrl: `https://linkedin.com/in/maria-rodriguez-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 12) + 1,
        lastInteraction: undefined,
        searchCriteria: 'talent specialist'
      }
    )
  } else if (searchType === 'hiring_manager') {
    // Search for hiring managers with "manager", "director", "vice president" in title
    profiles.push(
      {
        id: `linkedin-manager-${company}-1`,
        name: 'Michael Chen',
        title: 'Engineering Director',
        company,
        location: 'Seattle, WA',
        connectionType: 'hiring_manager' as const,
        profileUrl: `https://linkedin.com/in/michael-chen-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 20) + 1,
        lastInteraction: undefined,
        searchCriteria: 'director'
      },
      {
        id: `linkedin-manager-${company}-2`,
        name: 'Lisa Thompson',
        title: 'Product Manager',
        company,
        location: 'Chicago, IL',
        connectionType: 'hiring_manager' as const,
        profileUrl: `https://linkedin.com/in/lisa-thompson-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 18) + 1,
        lastInteraction: undefined,
        searchCriteria: 'manager'
      },
      {
        id: `linkedin-manager-${company}-3`,
        name: 'James Wilson',
        title: 'Vice President of Engineering',
        company,
        location: 'Boston, MA',
        connectionType: 'hiring_manager' as const,
        profileUrl: `https://linkedin.com/in/james-wilson-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 25) + 1,
        lastInteraction: undefined,
        searchCriteria: 'vice president'
      }
    )
  } else {
    // Search for other employees
    profiles.push(
      {
        id: `linkedin-employee-${company}-1`,
        name: 'Emily Rodriguez',
        title: 'Software Engineer',
        company,
        location: 'Austin, TX',
        connectionType: 'potential' as const,
        profileUrl: `https://linkedin.com/in/emily-rodriguez-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 8) + 1,
        lastInteraction: undefined,
        searchCriteria: 'software engineer'
      },
      {
        id: `linkedin-employee-${company}-2`,
        name: 'Alex Martinez',
        title: 'Data Scientist',
        company,
        location: 'Denver, CO',
        connectionType: 'potential' as const,
        profileUrl: `https://linkedin.com/in/alex-martinez-${company.toLowerCase()}`,
        isConnection: false,
        mutualConnections: Math.floor(Math.random() * 6) + 1,
        lastInteraction: undefined,
        searchCriteria: 'data scientist'
      }
    )
  }
  
  return profiles
}

// Generate mock connections for demonstration (fallback)
function generateMockConnectionsForCompany(company: string) {
  const mockConnections = [
    {
      id: `mock-recruiter-${company}-1`,
      name: 'Sarah Johnson',
      title: 'Senior Talent Acquisition Manager',
      company,
      location: 'San Francisco, CA',
      connectionType: 'recruiter' as const,
      profileUrl: `https://linkedin.com/in/sarah-johnson-${company.toLowerCase()}`,
      isConnection: false,
      mutualConnections: 5,
      lastInteraction: undefined
    },
    {
      id: `mock-hiring-manager-${company}-1`,
      name: 'Michael Chen',
      title: 'Engineering Director',
      company,
      location: 'Seattle, WA',
      connectionType: 'hiring_manager' as const,
      profileUrl: `https://linkedin.com/in/michael-chen-${company.toLowerCase()}`,
      isConnection: false,
      mutualConnections: 3,
      lastInteraction: undefined
    },
    {
      id: `mock-potential-${company}-1`,
      name: 'Emily Rodriguez',
      title: 'Software Engineer',
      company,
      location: 'Austin, TX',
      connectionType: 'potential' as const,
      profileUrl: `https://linkedin.com/in/emily-rodriguez-${company.toLowerCase()}`,
      isConnection: false,
      mutualConnections: 8,
      lastInteraction: undefined
    }
  ]

  return mockConnections
}
