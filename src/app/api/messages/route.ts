import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const messageType = searchParams.get('messageType')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const where: any = { userId }
    
    if (status) {
      where.status = status.toUpperCase()
    }
    
    if (messageType) {
      where.messageType = messageType.toUpperCase()
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      recipientName,
      recipientTitle,
      recipientCompany,
      recipientEmail,
      linkedinProfileUrl,
      message,
      messageType,
      platform = 'email'
    } = body

    if (!userId || !recipientName || !message || !messageType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newMessage = await prisma.message.create({
      data: {
        userId,
        recipientName,
        recipientTitle,
        recipientCompany,
        recipientEmail,
        linkedinProfileUrl,
        message,
        messageType: messageType.toUpperCase(),
        platform,
        status: 'PENDING'
      }
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
