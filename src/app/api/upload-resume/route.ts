import { NextRequest, NextResponse } from 'next/server'
import { parseResumePDF } from '@/lib/resume-parser'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    console.log('Processing resume upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse the PDF
    const resumeData = await parseResumePDF(buffer)

    // Generate a resume URL (for now, we'll use a placeholder or file name)
    const resumeUrl = `/resumes/${userId}/${file.name}`

    // Update user profile with parsed data
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName: resumeData.fullName?.split(' ')[0] || undefined,
        lastName: resumeData.fullName?.split(' ').slice(1).join(' ') || undefined,
        phone: resumeData.phone || undefined,
        city: resumeData.location || undefined, // For now, put location in city field
        summary: resumeData.summary || undefined,
        currentTitle: resumeData.currentTitle || undefined,
        currentCompany: resumeData.currentCompany || undefined,
        skills: resumeData.skills ? JSON.stringify(resumeData.skills) : undefined,
        experience: resumeData.experience ? JSON.stringify(resumeData.experience) : undefined,
        education: resumeData.education ? JSON.stringify(resumeData.education) : undefined,
        resumeUrl: resumeUrl,
      },
      create: {
        userId,
        firstName: resumeData.fullName?.split(' ')[0] || 'User',
        lastName: resumeData.fullName?.split(' ').slice(1).join(' ') || 'Name',
        phone: resumeData.phone || undefined,
        city: resumeData.location || undefined, // For now, put location in city field
        summary: resumeData.summary || undefined,
        currentTitle: resumeData.currentTitle || undefined,
        currentCompany: resumeData.currentCompany || undefined,
        skills: resumeData.skills ? JSON.stringify(resumeData.skills) : undefined,
        experience: resumeData.experience ? JSON.stringify(resumeData.experience) : undefined,
        education: resumeData.education ? JSON.stringify(resumeData.education) : undefined,
        resumeUrl: resumeUrl,
      },
    })

    console.log('Resume data processed and profile updated:', updatedProfile.id)

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: {
        profileId: updatedProfile.id,
        resumeUrl: resumeUrl,
        parsedData: resumeData
      }
    })

  } catch (error) {
    console.error('Error processing resume upload:', error)
    return NextResponse.json({
      error: 'Failed to process resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
