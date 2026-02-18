import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const connections = await prisma.calendarConnection.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching calendar connections:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar connections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, provider, calendarId, calendarName, accessToken, refreshToken, expiresAt } = await request.json()

    if (!userId || !provider || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const connection = await prisma.calendarConnection.upsert({
      where: {
        userId_provider_calendarId: {
          userId,
          provider,
          calendarId: calendarId || 'default',
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        calendarName,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        provider,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        calendarId: calendarId || 'default',
        calendarName,
        isActive: true,
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.json({ connection })
  } catch (error) {
    console.error('Error creating calendar connection:', error)
    return NextResponse.json({ error: 'Failed to create calendar connection' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const connectionId = searchParams.get('connectionId')

  if (!userId || !connectionId) {
    return NextResponse.json({ error: 'User ID and connection ID are required' }, { status: 400 })
  }

  try {
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar connection:', error)
    return NextResponse.json({ error: 'Failed to delete calendar connection' }, { status: 500 })
  }
}
