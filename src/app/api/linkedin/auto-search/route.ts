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

    // Also get companies from job search cache if available
    const jobSearchResults = await prisma.jobSearchCache.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        results: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Extract companies from job search results
    const companiesFromJobs = recentJobs.map(job => job.company).filter(Boolean)
    const companiesFromCache = jobSearchResults.flatMap(cache => {
      try {
        const results = JSON.parse(cache.results)
        return results.jobs?.map((job: any) => job.company).filter(Boolean) || []
      } catch {
        return []
      }
    })

    // Combine and deduplicate companies
    const allCompanies = [...new Set([...companiesFromJobs, ...companiesFromCache])]
    
    if (allCompanies.length === 0) {
      return NextResponse.json({ 
        success: true, 
        profiles: [],
        message: 'No recent job search results found to extract companies from'
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
        const connection = await prisma.linkedInConnection.upsert({
          where: {
            userId_linkedinId: {
              userId,
              linkedinId: profile.id
            }
          },
          update: {
            name: `${profile.firstName} ${profile.lastName}`,
            title: profile.jobTitle || profile.headline,
            company: profile.companyName || profile.targetCompany,
            location: profile.location,
            profileUrl: profile.profileUrl,
            status: 'POTENTIAL',
            searchCriteria: profile.searchCriteria,
            targetCompany: profile.targetCompany,
            mutualConnections: profile.mutualConnections,
            lastInteraction: profile.lastInteraction ? new Date(profile.lastInteraction) : null,
            updatedAt: new Date()
          },
          create: {
            userId,
            linkedinId: profile.id,
            name: `${profile.firstName} ${profile.lastName}`,
            title: profile.jobTitle || profile.headline,
            company: profile.companyName || profile.targetCompany,
            location: profile.location,
            profileUrl: profile.profileUrl,
            status: 'POTENTIAL',
            searchCriteria: profile.searchCriteria,
            targetCompany: profile.targetCompany,
            mutualConnections: profile.mutualConnections,
            lastInteraction: profile.lastInteraction ? new Date(profile.lastInteraction) : null
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
      where: {
        userId,
        searchCriteria: {
          in: ['1st_degree', 'recruiter', 'sales_manager']
        }
      },
      orderBy: [
        { searchCriteria: 'asc' }, // 1st_degree first
        { mutualConnections: 'desc' }
      ]
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
