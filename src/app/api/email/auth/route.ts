import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  if (!provider || !['gmail', 'yahoo'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider. Use gmail or yahoo' }, { status: 400 })
  }

  try {
    let authUrl: string

    if (provider === 'gmail') {
      authUrl = await emailService.getGmailAuthUrl()
    } else if (provider === 'yahoo') {
      authUrl = await emailService.getYahooAuthUrl()
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}
