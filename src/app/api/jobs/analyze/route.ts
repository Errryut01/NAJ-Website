import { NextRequest, NextResponse } from 'next/server'
import { grokJobAnalyzer } from '@/lib/grok-job-analyzer'

export async function POST(request: NextRequest) {
  try {
    const { jobUrl } = await request.json()

    if (!jobUrl) {
      return NextResponse.json(
        { error: 'Job URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(jobUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log('Analyzing job posting:', jobUrl)

    // Analyze the job posting
    const jobAnalysis = await grokJobAnalyzer.analyzeJobPosting(jobUrl)
    
    // Generate search parameters for similar jobs
    const similarJobSearch = await grokJobAnalyzer.generateSimilarJobSearch(jobAnalysis)

    return NextResponse.json({
      success: true,
      jobAnalysis,
      similarJobSearch
    })

  } catch (error: any) {
    console.error('Error analyzing job posting:', error)
    
    // Return a more user-friendly error message
    let errorMessage = 'Failed to analyze job posting'
    if (error.message.includes('API key not configured')) {
      errorMessage = 'Grok API is not configured. Please contact support.'
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not access the job posting. Please check the URL and try again.'
    } else if (error.message.includes('parse')) {
      errorMessage = 'Could not analyze the job posting content. The page might not be accessible or in an unexpected format.'
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message 
      },
      { status: 500 }
    )
  }
}
