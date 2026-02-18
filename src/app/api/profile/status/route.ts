import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user with profile and LinkedIn credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        linkedinCredentials: true,
      },
    })

    if (!user) {
      return NextResponse.json({ 
        connected: false, 
        profile: null,
        linkedinCredentials: null 
      })
    }

    const isLinkedInConnected = !!user.linkedinCredentials?.accessToken
    const isProfileComplete = !!user.profile?.firstName && !!user.profile?.lastName

    return NextResponse.json({
      connected: isLinkedInConnected,
      profile: user.profile,
      linkedinCredentials: isLinkedInConnected ? {
        hasAccessToken: true,
        expiresAt: user.linkedinCredentials?.expiresAt
      } : null,
      isProfileComplete,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error checking profile status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
