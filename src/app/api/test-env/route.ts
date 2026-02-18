import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'configured' : 'missing',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'using default',
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'using default',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('NEXT_PUBLIC'))
  })
}
