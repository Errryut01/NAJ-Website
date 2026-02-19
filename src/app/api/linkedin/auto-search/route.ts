import { NextRequest, NextResponse } from 'next/server'
import { RapidApiLinkedInService } from '@/lib/rapidapi-linkedin'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get recent job search results to extract companies
    const recentJobs = await prisma.jobApplication.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        company: true
      },
      distinct: ['company'],
      take: 10 // Limit to top 10 companies
    })

    // Extract companies from job applications
    const allCompanies = [...new Set(recentJobs.map(job => job.company).filter(Boolean))]
    
    if (allCompanies.length === 0) {
      return NextResponse.json({ 
        success: true, 
        profiles: [],
        message: 'No recent job applications found to extract companies from'
      })
    }

    console.log(`Auto-searching LinkedIn for companies: ${allCompanies.join(', ')}`)

    const linkedInService = new RapidApiLinkedInService()
    const allProfiles: any[] = []

    // Search for each company type
    for (const company of allCompanies.slice(0, 5)) { // Limit to 5 companies to avoid rate limits
      try {
        console.log(`Searching for profiles at ${company}...`)
        
        // Search for 1st degree connections at this company
        const firstDegreeProfiles = await linkedInService.searchProfiles({
          query: company,
          company,
          connectionType: 'all'
        }).then(profiles => profiles.map(profile => ({
          ...profile,
          connectionDegree: '1st' as const,
          searchCriteria: '1st_degree',
          targetCompany: company
        })))

        // Search for recruiters at this company
        const recruiterProfiles = await linkedInService.searchProfiles({
          query: `recruiter ${company}`,
          company,
          connectionType: 'recruiter'
        }).then(profiles => profiles.map(profile => ({
          ...profile,
          searchCriteria: 'recruiter',
          targetCompany: company
        })))

        // Search for sales managers at this company
        const salesManagerProfiles = await linkedInService.searchProfiles({
          query: `sales manager ${company}`,
          company,
          connectionType: 'employee'
        }).then(profiles => profiles
          .filter(profile => 
            profile.jobTitle?.toLowerCase().includes('sales') && 
            profile.jobTitle?.toLowerCase().includes('manager')
          )
          .map(profile => ({
            ...profile,
            searchCriteria: 'sales_manager',
            targetCompany: company
          }))
        )

        allProfiles.push(...firstDegreeProfiles, ...recruiterProfiles, ...salesManagerProfiles)

        // Add delay between companies to respect rate limits
        if (allCompanies.indexOf(company) < allCompanies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }

      } catch (error) {
        console.error(`Error searching profiles for ${company}:`, error)
        // Continue with next company
      }
    }

    // Remove duplicates based on profile URL or name
    const uniqueProfiles = allProfiles.filter((profile, index, self) => 
      index === self.findIndex(p => 
        p.profileUrl === profile.profileUrl || 
        (p.firstName === profile.firstName && p.lastName === profile.lastName && p.targetCompany === profile.targetCompany)
      )
    )

    // Sort by priority: 1st degree connections first, then by mutual connections
    const sortedProfiles = uniqueProfiles.sort((a, b) => {
      // 1st degree connections get highest priority
      if (a.connectionDegree === '1st' && b.connectionDegree !== '1st') return -1
      if (b.connectionDegree === '1st' && a.connectionDegree !== '1st') return 1
      
      // Then sort by mutual connections
      return (b.mutualConnections || 0) - (a.mutualConnections || 0)
    })

    // Save the results to the database
    const savedConnections = []
    for (const profile of sortedProfiles.slice(0, 50)) { // Limit to 50 profiles
      try {
        const existing = await prisma.linkedInConnection.findFirst({
          where: { userId, linkedinId: profile.id }
        })
        const connection = existing
          ? await prisma.linkedInConnection.update({
              where: { id: existing.id },
              data: {
                name: `${profile.firstName} ${profile.lastName}`,
                title: profile.jobTitle || profile.headline,
                company: profile.companyName || profile.targetCompany,
                profileUrl: profile.profileUrl,
                status: 'POTENTIAL',
                updatedAt: new Date()
              }
            })
          : await prisma.linkedInConnection.create({
              data: {
                userId,
                linkedinId: profile.id,
                name: `${profile.firstName} ${profile.lastName}`,
                title: profile.jobTitle || profile.headline,
                company: profile.companyName || profile.targetCompany,
                profileUrl: profile.profileUrl,
                status: 'POTENTIAL'
              }
            })
        savedConnections.push(connection)
      } catch (error) {
        console.error(`Error saving connection ${profile.id}:`, error)
      }
    }

    console.log(`Auto-search completed: Found ${sortedProfiles.length} profiles, saved ${savedConnections.length} connections`)

    return NextResponse.json({
      success: true,
      profiles: sortedProfiles,
      savedConnections: savedConnections.length,
      companies: allCompanies,
      message: `Found ${sortedProfiles.length} high-value connections from ${allCompanies.length} companies`
    })

  } catch (error) {
    console.error('Auto-search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get auto-searched connections
    const connections = await prisma.linkedInConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      connections,
      totalResults: connections.length
    })

  } catch (error) {
    console.error('Auto-search GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
