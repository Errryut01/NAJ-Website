import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const config = {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'present' : 'missing',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }

    console.log('LinkedIn Configuration Test:', config)

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'present' : 'missing'
      }
    })
  } catch (error) {
    console.error('Error testing LinkedIn config:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
