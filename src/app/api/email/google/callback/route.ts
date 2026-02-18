import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/google/callback`

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(`${appUrl}/?section=profile&error=gmail_auth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?section=profile&error=gmail_auth_failed`)
  }

  try {
    const { userId, action, provider } = JSON.parse(state)
    
    if (action === 'connect' && provider === 'gmail') {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code)
      
      if (!tokens.access_token) {
        throw new Error('Failed to get access token')
      }

      // Set credentials and get user's email
      oauth2Client.setCredentials(tokens)
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
      const profile = await gmail.users.getProfile({ userId: 'me' })
      const emailAddress = profile.data.emailAddress!

      // Store email connection in database
      await prisma.emailConnection.upsert({
        where: {
          userId_provider_email: {
            userId,
            provider: 'gmail',
            email: emailAddress,
          },
        },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isActive: true,
          lastSyncAt: new Date(),
        },
        create: {
          userId,
          provider: 'gmail',
          email: emailAddress,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isActive: true,
          lastSyncAt: new Date(),
        },
      })

      return NextResponse.redirect(`${appUrl}/?section=profile&success=gmail_connected`)
    }

    return NextResponse.redirect(`${appUrl}/?section=profile&error=gmail_auth_failed`)
  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/?section=profile&error=gmail_auth_failed`)
  }
}


