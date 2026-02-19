import { NextRequest, NextResponse } from 'next/server'
import { emailService, type EmailContact } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) {
    return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
  }

  try {
    const account = emailService.getActiveAccounts().find(acc => acc.id === accountId)
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    let contacts: EmailContact[] = []
    
    if (account.provider === 'gmail') {
      contacts = await emailService.getGmailContacts(accountId)
    } else {
      // For Yahoo and other providers, return empty array for now
      contacts = []
    }

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error getting contacts:', error)
    return NextResponse.json({ error: 'Failed to get contacts' }, { status: 500 })
  }
}
