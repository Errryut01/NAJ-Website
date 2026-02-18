import { NextRequest, NextResponse } from 'next/server'
import { RapidApiLinkedInService, LinkedInSearchParams } from '@/lib/rapidapi-linkedin'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      query, 
      company, 
      location, 
      jobTitle, 
      connectionType, 
      industry, 
      experienceLevel, 
      school, 
      skills, 
      currentCompany, 
      pastCompany, 
      page, 
      limit, 
      sortBy 
    } = data

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const searchParams: LinkedInSearchParams = {
      query,
      company,
      location,
      jobTitle,
      connectionType: connectionType || 'all',
      industry,
      experienceLevel,
      school,
      skills: skills || [],
      currentCompany,
      pastCompany,
      page: page || 1,
      limit: limit || 20,
      sortBy: sortBy || 'relevance'
    }

    const linkedInService = new RapidApiLinkedInService()
    const profiles = await linkedInService.advancedSearch(searchParams)

    return NextResponse.json({
      success: true,
      profiles,
      totalResults: profiles.length,
      searchParams
    })
  } catch (error) {
    console.error('LinkedIn search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('query')
    const company = searchParams.get('company')
    const location = searchParams.get('location')
    const jobTitle = searchParams.get('jobTitle')
    const connectionType = searchParams.get('connectionType') as any
    const industry = searchParams.get('industry')
    const experienceLevel = searchParams.get('experienceLevel') as any
    const school = searchParams.get('school')
    const skills = searchParams.get('skills')?.split(',') || []
    const currentCompany = searchParams.get('currentCompany')
    const pastCompany = searchParams.get('pastCompany')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') as any

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const searchParamsObj: LinkedInSearchParams = {
      query,
      company: company || undefined,
      location: location || undefined,
      jobTitle: jobTitle || undefined,
      connectionType: connectionType || 'all',
      industry: industry || undefined,
      experienceLevel: experienceLevel || undefined,
      school: school || undefined,
      skills: skills.filter(s => s.length > 0),
      currentCompany: currentCompany || undefined,
      pastCompany: pastCompany || undefined,
      page,
      limit,
      sortBy: sortBy || 'relevance'
    }

    const linkedInService = new RapidApiLinkedInService()
    const profiles = await linkedInService.advancedSearch(searchParamsObj)

    return NextResponse.json({
      success: true,
      profiles,
      totalResults: profiles.length,
      searchParams: searchParamsObj
    })
  } catch (error) {
    console.error('LinkedIn search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
