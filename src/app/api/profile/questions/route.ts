import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, questions } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Upsert job application questions
    const questionData = await prisma.jobApplicationQuestion.upsert({
      where: { userId },
      update: {
        questions,
        updatedAt: new Date(),
      },
      create: {
        userId,
        questions,
      },
    })

    return NextResponse.json({ success: true, data: questionData })
  } catch (error: any) {
    console.error('Error saving questions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save questions' },
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

    const questions = await prisma.jobApplicationQuestion.findUnique({
      where: { userId },
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (error: any) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}



