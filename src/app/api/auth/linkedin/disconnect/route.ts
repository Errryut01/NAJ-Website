import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log(`Starting LinkedIn disconnect for user: ${userId}`)

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // First, check if credentials exist
      const existingCredentials = await tx.linkedInCredentials.findUnique({
        where: { userId: userId }
      })

      if (!existingCredentials) {
        console.log(`No LinkedIn credentials found for user: ${userId}`)
        return
      }

      // Delete LinkedIn credentials for the user
      await tx.linkedInCredentials.delete({
        where: { userId: userId }
      })

      console.log(`LinkedIn credentials deleted for user: ${userId}`)
    })

    console.log(`LinkedIn credentials disconnected successfully for user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'LinkedIn account disconnected successfully' 
    })
  } catch (error: any) {
    console.error('Error disconnecting LinkedIn:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to disconnect LinkedIn account'
    if (error.code === 'P2025') {
      errorMessage = 'LinkedIn credentials not found'
    } else if (error.code === 'P2002') {
      errorMessage = 'Database constraint violation'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if LinkedIn credentials exist for the user
    const credentials = await prisma.linkedInCredentials.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      hasCredentials: !!credentials,
      credentials: credentials 
    })
  } catch (error: any) {
    console.error('Error checking LinkedIn credentials:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check LinkedIn credentials',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    )
  }
}
