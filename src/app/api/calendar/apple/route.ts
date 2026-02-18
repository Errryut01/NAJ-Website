import { NextRequest, NextResponse } from 'next/server'

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/apple/callback'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action') || 'connect'

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (action === 'connect') {
    // For Apple Calendar, we'll use a simplified approach
    // In a real implementation, you'd use Apple's Sign in with Apple or CalDAV
    const state = JSON.stringify({ userId, action: 'connect' })
    
    // For now, we'll redirect to a manual setup page
    const setupUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?section=calendar`)
    setupUrl.searchParams.set('apple_setup', 'true')
    setupUrl.searchParams.set('state', state)

    return NextResponse.redirect(setupUrl.toString())
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
