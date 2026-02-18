import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/google/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(`${appUrl}/?section=calendar&error=google_auth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?section=calendar&error=google_auth_failed`)
  }

  try {
    const { userId, action } = JSON.parse(state)
    
    if (action === 'connect') {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID || '',
          client_secret: GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokens.access_token) {
        throw new Error('Failed to get access token')
      }

      // Get user's calendars
      const calendarsResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      const calendarsData = await calendarsResponse.json()
      const calendars = calendarsData.items || []

      // Store calendar connections
      for (const calendar of calendars) {
        await prisma.calendarConnection.upsert({
          where: {
            userId_provider_calendarId: {
              userId,
              provider: 'google',
              calendarId: calendar.id,
            },
          },
          update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            calendarName: calendar.summary,
            isActive: true,
            lastSyncAt: new Date(),
          },
          create: {
            userId,
            provider: 'google',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            calendarId: calendar.id,
            calendarName: calendar.summary,
            isActive: true,
            lastSyncAt: new Date(),
          },
        })
      }

      return NextResponse.redirect(`${appUrl}/?section=calendar&success=google_connected`)
    }

    return NextResponse.redirect(`${appUrl}/?section=calendar&error=google_auth_failed`)
  } catch (error) {
    console.error('Google Calendar OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/?section=calendar&error=google_auth_failed`)
  }
}
