import { NextRequest, NextResponse } from 'next/server'
import { linkedinNetworkingService } from '@/lib/linkedin-networking'
import { JobPosting } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobs }: { jobs: JobPosting[] } = body

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'Invalid jobs data provided' },
        { status: 400 }
      )
    }

    console.log(`Analyzing networking opportunities for ${jobs.length} jobs`)

    // Analyze networking opportunities for each company
    const analyses = await linkedinNetworkingService.analyzeNetworkingOpportunities(jobs)
    
    // Get summary statistics
    const summary = await linkedinNetworkingService.getNetworkingSummary(analyses)

    console.log(`Found networking opportunities across ${analyses.length} companies`)

    return NextResponse.json({
      success: true,
      analyses,
      summary
    })

  } catch (error) {
    console.error('Error analyzing networking opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze networking opportunities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
