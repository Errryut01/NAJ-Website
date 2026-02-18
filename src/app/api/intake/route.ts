import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const INTAKE_EMAIL = 'brian@networkajob.io'

function buildEmailHtml(
  formType: string,
  data: Record<string, string>
): string {
  const rows = Object.entries(data)
    .filter(([, v]) => v?.trim())
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333;">${key}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${escapeHtml(value)}</td></tr>`
    )
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#0c071a;">New ${formType} Submission</h2>
      <p style="color:#666;">Submitted from networkajob.com</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#f9f9f9;border-radius:8px;overflow:hidden;">
        ${rows}
      </table>
    </div>
  `
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { formType, ...data } = body as { formType: string; [key: string]: string }

    if (!formType || typeof formType !== 'string') {
      return NextResponse.json(
        { error: 'Missing formType' },
        { status: 400 }
      )
    }

    const labels: Record<string, string> = {
      name: 'Name',
      fullName: 'Full Name',
      email: 'Email',
      resumeOrLinkedinUrl: 'Resume or LinkedIn URL',
      companyOrRole: 'Company / Role',
      message: 'Message',
    }

    const formattedData: Record<string, string> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value != null && String(value).trim()) {
        const label = labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        formattedData[label] = String(value).trim()
      }
    }

    const subject = `NAJ ${formType}: ${formattedData['Name'] || formattedData['Full Name'] || 'New submission'}`
    const html = buildEmailHtml(formType, formattedData)

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'onboarding@resend.dev',
      to: INTAKE_EMAIL,
      replyTo: formattedData['Email'] || undefined,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Intake email error:', err)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
