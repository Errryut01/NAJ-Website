import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    const accounts = emailService.getActiveAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error getting email accounts:', error)
    return NextResponse.json({ error: 'Failed to get email accounts' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const success = emailService.disconnectAccount(accountId)
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Account disconnected successfully' })
    } else {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error disconnecting account:', error)
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 })
  }
}
