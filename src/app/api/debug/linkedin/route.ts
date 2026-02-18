import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Debug LinkedIn - userId:', userId)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        linkedinCredentials: true,
        profile: true
      }
    })

    console.log('Debug LinkedIn - user found:', !!user)
    console.log('Debug LinkedIn - has linkedinCredentials:', !!user?.linkedinCredentials)
    console.log('Debug LinkedIn - has profile:', !!user?.profile)

    // Check environment variables
    const envCheck = {
      LINKEDIN_CLIENT_ID: !!process.env.LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
      LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
      DATABASE_URL: !!process.env.DATABASE_URL
    }

    console.log('Debug LinkedIn - env check:', envCheck)

    // Test LinkedIn OAuth URL generation
    let authUrlTest = null
    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID
      const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/linkedin/callback"
      const scope = 'openid profile email'
      const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      authUrlTest = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}&scope=${scope}&nonce=${nonce}&prompt=consent`
    } catch (error) {
      console.log('Debug LinkedIn - auth URL generation error:', error)
    }

    return NextResponse.json({
      userId,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        hasLinkedInCredentials: !!user.linkedinCredentials,
        hasProfile: !!user.profile,
        linkedinCredentials: user.linkedinCredentials ? {
          hasAccessToken: !!user.linkedinCredentials.accessToken,
          hasRefreshToken: !!user.linkedinCredentials.refreshToken,
          expiresAt: user.linkedinCredentials.expiresAt
        } : null,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          currentTitle: user.profile.currentTitle,
          currentCompany: user.profile.currentCompany,
          country: user.profile.country
        } : null
      } : null,
      environment: envCheck,
      authUrlTest: authUrlTest ? 'Generated successfully' : 'Failed to generate',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug LinkedIn error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

