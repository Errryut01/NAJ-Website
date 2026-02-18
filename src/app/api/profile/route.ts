import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: true
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, ...profileData } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    let profile
    if (existingProfile) {
      profile = await prisma.userProfile.update({
        where: { userId },
        data: {
          ...profileData,
          updatedAt: new Date()
        }
      })
    } else {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          ...profileData
        }
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating/updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, ...profileData } = data

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        ...profileData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
