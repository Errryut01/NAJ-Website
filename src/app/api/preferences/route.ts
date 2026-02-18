import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const preferences = await prisma.jobSearchPreferences.findUnique({
      where: { userId }
    })

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, ...preferencesData } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if preferences already exist
    const existingPreferences = await prisma.jobSearchPreferences.findUnique({
      where: { userId }
    })

    let preferences
    if (existingPreferences) {
      preferences = await prisma.jobSearchPreferences.update({
        where: { userId },
        data: {
          ...preferencesData,
          updatedAt: new Date()
        }
      })
    } else {
      preferences = await prisma.jobSearchPreferences.create({
        data: {
          userId,
          ...preferencesData
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error creating/updating preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, ...preferencesData } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const preferences = await prisma.jobSearchPreferences.update({
      where: { userId },
      data: {
        ...preferencesData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
