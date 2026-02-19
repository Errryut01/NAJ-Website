import { google } from 'googleapis'
import nodemailer from 'nodemailer'

export interface EmailAccount {
  id: string
  email: string
  provider: 'gmail' | 'yahoo' | 'outlook'
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  isActive: boolean
}

export interface EmailMessage {
  id: string
  to: string
  from: string
  subject: string
  body: string
  sentAt: Date
  status: 'sent' | 'failed' | 'pending'
  threadId?: string
  messageId?: string
}

export interface EmailContact {
  id: string
  name: string
  email: string
  lastContacted?: Date
  totalMessages: number
}

export class EmailService {
  private accounts: Map<string, EmailAccount> = new Map()

  // Gmail OAuth2 Configuration
  private gmailOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/email/callback'
  )

  // Yahoo OAuth2 Configuration
  private yahooOAuth2Client = new google.auth.OAuth2(
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET,
    process.env.YAHOO_REDIRECT_URI || 'http://localhost:3000/api/email/callback'
  )

  constructor() {
    // Initialize with any stored accounts
    this.loadStoredAccounts()
  }

  private loadStoredAccounts() {
    // In a real app, this would load from database
    // For now, we'll use a simple in-memory store (no localStorage on server)
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('email_accounts')
        if (stored) {
          const accounts = JSON.parse(stored)
          accounts.forEach((account: EmailAccount) => {
            this.accounts.set(account.id, account)
          })
        }
      }
    } catch (error) {
      console.error('Error loading stored email accounts:', error)
    }
  }

  private saveAccounts() {
    try {
      // Only save to localStorage if we're in a browser environment
      if (typeof window !== 'undefined') {
        const accounts = Array.from(this.accounts.values())
        localStorage.setItem('email_accounts', JSON.stringify(accounts))
      }
    } catch (error) {
      console.error('Error saving email accounts:', error)
    }
  }

  // Gmail Integration
  async getGmailAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ]

    return this.gmailOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  async handleGmailCallback(code: string): Promise<EmailAccount> {
    try {
      const { tokens } = await this.gmailOAuth2Client.getToken(code)
      
      // Get user info using the Gmail API directly
      this.gmailOAuth2Client.setCredentials(tokens)
      const gmail = google.gmail({ version: 'v1', auth: this.gmailOAuth2Client })
      
      // Get profile info from Gmail API
      const profile = await gmail.users.getProfile({ userId: 'me' })
      
      const account: EmailAccount = {
        id: `gmail_${Date.now()}`,
        email: profile.data.emailAddress!,
        provider: 'gmail',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date ?? undefined,
        isActive: true
      }

      this.accounts.set(account.id, account)
      this.saveAccounts()
      
      return account
    } catch (error) {
      console.error('Error handling Gmail callback:', error)
      throw new Error('Failed to authenticate with Gmail')
    }
  }

  // Yahoo Mail Integration (using IMAP/SMTP)
  async getYahooAuthUrl(): Promise<string> {
    // Yahoo uses OAuth2 but with different endpoints
    const scopes = ['mail-r', 'mail-w']
    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${process.env.YAHOO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.YAHOO_REDIRECT_URI || 'http://localhost:3000/api/email/callback')}&response_type=code&scope=${scopes.join(' ')}`
    
    return authUrl
  }

  async handleYahooCallback(code: string): Promise<EmailAccount> {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.YAHOO_CLIENT_ID!,
          client_secret: process.env.YAHOO_CLIENT_SECRET!,
          redirect_uri: process.env.YAHOO_REDIRECT_URI || 'http://localhost:3000/api/email/callback',
          code: code
        })
      })

      const tokens = await tokenResponse.json()
      
      // Get user info
      const userResponse = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })
      
      const userInfo = await userResponse.json()
      
      const account: EmailAccount = {
        id: `yahoo_${Date.now()}`,
        email: userInfo.email,
        provider: 'yahoo',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        isActive: true
      }

      this.accounts.set(account.id, account)
      this.saveAccounts()
      
      return account
    } catch (error) {
      console.error('Error handling Yahoo callback:', error)
      throw new Error('Failed to authenticate with Yahoo Mail')
    }
  }

  // Send Email via Gmail
  async sendGmailMessage(accountId: string, to: string, subject: string, body: string): Promise<EmailMessage> {
    const account = this.accounts.get(accountId)
    if (!account || account.provider !== 'gmail') {
      throw new Error('Gmail account not found')
    }

    try {
      this.gmailOAuth2Client.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken
      })

      const gmail = google.gmail({ version: 'v1', auth: this.gmailOAuth2Client })

      // Create email message
      const message = [
        `To: ${to}`,
        `From: ${account.email}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ].join('\n')

      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      })

      const emailMessage: EmailMessage = {
        id: `email_${Date.now()}`,
        to,
        from: account.email,
        subject,
        body,
        sentAt: new Date(),
        status: 'sent',
        messageId: response.data.id ?? undefined
      }

      return emailMessage
    } catch (error) {
      console.error('Error sending Gmail message:', error)
      throw new Error('Failed to send email via Gmail')
    }
  }

  // Send Email via Yahoo (using SMTP)
  async sendYahooMessage(accountId: string, to: string, subject: string, body: string): Promise<EmailMessage> {
    const account = this.accounts.get(accountId)
    if (!account || account.provider !== 'yahoo') {
      throw new Error('Yahoo account not found')
    }

    try {
      // Create SMTP transporter for Yahoo
      const transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: account.email,
          pass: account.accessToken // Yahoo uses app-specific passwords
        }
      })

      const mailOptions = {
        from: account.email,
        to: to,
        subject: subject,
        html: body
      }

      const info = await transporter.sendMail(mailOptions)

      const emailMessage: EmailMessage = {
        id: `email_${Date.now()}`,
        to,
        from: account.email,
        subject,
        body,
        sentAt: new Date(),
        status: 'sent',
        messageId: info.messageId
      }

      return emailMessage
    } catch (error) {
      console.error('Error sending Yahoo message:', error)
      throw new Error('Failed to send email via Yahoo Mail')
    }
  }

  // Send Email (generic method)
  async sendEmail(accountId: string, to: string, subject: string, body: string): Promise<EmailMessage> {
    const account = this.accounts.get(accountId)
    if (!account) {
      throw new Error('Email account not found')
    }

    switch (account.provider) {
      case 'gmail':
        return this.sendGmailMessage(accountId, to, subject, body)
      case 'yahoo':
        return this.sendYahooMessage(accountId, to, subject, body)
      default:
        throw new Error('Unsupported email provider')
    }
  }

  // Get all connected accounts
  getAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values())
  }

  // Get active accounts
  getActiveAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values()).filter(account => account.isActive)
  }

  // Disconnect account
  disconnectAccount(accountId: string): boolean {
    const account = this.accounts.get(accountId)
    if (account) {
      account.isActive = false
      this.saveAccounts()
      return true
    }
    return false
  }

  // Get contacts from Gmail
  async getGmailContacts(accountId: string): Promise<EmailContact[]> {
    const account = this.accounts.get(accountId)
    if (!account || account.provider !== 'gmail') {
      throw new Error('Gmail account not found')
    }

    try {
      this.gmailOAuth2Client.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken
      })

      const gmail = google.gmail({ version: 'v1', auth: this.gmailOAuth2Client })
      
      // Get recent messages to extract contacts
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100
      })

      const contacts = new Map<string, EmailContact>()
      
      if (response.data.messages) {
        for (const message of response.data.messages) {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!
          })

          const headers = messageDetails.data.payload?.headers || []
          const fromHeader = headers.find(h => h.name === 'From')
          const toHeader = headers.find(h => h.name === 'To')
          
          if (fromHeader && fromHeader.value) {
            const email = this.extractEmail(fromHeader.value)
            if (email && email !== account.email) {
              const contactId = `contact_${email}`
              if (!contacts.has(contactId)) {
                contacts.set(contactId, {
                  id: contactId,
                  name: this.extractName(fromHeader.value),
                  email: email,
                  totalMessages: 1
                })
              } else {
                contacts.get(contactId)!.totalMessages++
              }
            }
          }
        }
      }

      return Array.from(contacts.values())
    } catch (error) {
      console.error('Error getting Gmail contacts:', error)
      return []
    }
  }

  private extractEmail(emailString: string): string | null {
    const match = emailString.match(/<(.+)>/)
    return match ? match[1] : emailString.trim()
  }

  private extractName(emailString: string): string {
    const match = emailString.match(/^(.+)\s*<.+>$/)
    return match ? match[1].trim().replace(/"/g, '') : 'Unknown'
  }
}

// Singleton instance
export const emailService = new EmailService()
