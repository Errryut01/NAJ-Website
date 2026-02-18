import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/google/callback`

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action') || 'connect'

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 })
  }

  if (action === 'connect') {
    // Generate Google OAuth URL for Gmail
    const state = JSON.stringify({ userId, action: 'connect', provider: 'gmail' })
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ]
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent'
    })

    return NextResponse.json({ authUrl })
  }

  if (action === 'check') {
    // Check if user has an active Gmail connection
    const emailConnection = await prisma.emailConnection.findFirst({
      where: {
        userId,
        provider: 'gmail',
        isActive: true,
      },
    })

    return NextResponse.json({ 
      connected: !!emailConnection,
      email: emailConnection?.email || null
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, to, subject, body } = await request.json()

    if (!userId || !to || !subject || !body) {
      return NextResponse.json(
        { error: 'User ID, recipient, subject, and body are required' },
        { status: 400 }
      )
    }

    // Get user's Gmail connection
    const emailConnection = await prisma.emailConnection.findFirst({
      where: {
        userId,
        provider: 'gmail',
        isActive: true,
      },
    })

    if (!emailConnection) {
      return NextResponse.json(
        { error: 'No active Gmail connection found. Please connect your Gmail account first.' },
        { status: 404 }
      )
    }

    // Check if token is expired and refresh if needed
    let accessToken = emailConnection.accessToken
    if (emailConnection.expiresAt && new Date() > emailConnection.expiresAt) {
      if (emailConnection.refreshToken) {
        oauth2Client.setCredentials({
          refresh_token: emailConnection.refreshToken
        })
        
        const { credentials } = await oauth2Client.refreshAccessToken()
        accessToken = credentials.access_token!
        
        // Update the connection with new token
        await prisma.emailConnection.update({
          where: { id: emailConnection.id },
          data: {
            accessToken: credentials.access_token!,
            expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        })
      }
    }

    // Set credentials and create Gmail client
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: emailConnection.refreshToken || undefined
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Create email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ].join('\n')

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Send email via Gmail API
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    return NextResponse.json({
      success: true,
      messageId: response.data.id,
      threadId: response.data.threadId,
    })
  } catch (error: any) {
    console.error('Error sending email via Gmail:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

