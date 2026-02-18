import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/linkedin/callback"
    const state = userId // Use userId as state to identify the user after OAuth

    if (!clientId) {
      return NextResponse.json({ error: 'LinkedIn OAuth not configured' }, { status: 500 })
    }

    const scope = 'openid profile email'
    // Use OpenID Connect flow with proper nonce
    const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&nonce=${nonce}&prompt=consent`

    console.log('LinkedIn OAuth URL Debug:', {
      clientId,
      redirectUri,
      state,
      scope,
      authUrl
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
