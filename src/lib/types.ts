// Application Status Enum (from Prisma)
export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  REJECTED = 'REJECTED',
  OFFER = 'OFFER',
  WITHDRAWN = 'WITHDRAWN'
}

// Connection Status Enum (from Prisma)
export enum ConnectionStatus {
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

// Message Status Enum (from Prisma)
export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

// LinkedIn Automation Types
export interface LinkedInConnection {
  id: string
  name: string
  headline: string
  company: string
  location: string
  profileUrl: string
  connectionDate: string
}

export interface LinkedInMessage {
  id: string
  recipientId: string
  recipientName: string
  message: string
  sentAt: Date
  status: 'sent' | 'failed' | 'pending'
}