import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { accountId, to, subject, body } = await request.json()

    if (!accountId || !to || !subject || !body) {
      return NextResponse.json({ 
        error: 'Missing required fields: accountId, to, subject, body' 
      }, { status: 400 })
    }

    const message = await emailService.sendEmail(accountId, to, subject, body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      data: message
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }, { status: 500 })
  }
}
