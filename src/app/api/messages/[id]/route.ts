import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, replyMessage } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const updateData: any = { status: status.toUpperCase() }
    
    // Set timestamp based on status
    const now = new Date()
    switch (status.toUpperCase()) {
      case 'SENT':
        updateData.sentAt = now
        break
      case 'DELIVERED':
        updateData.deliveredAt = now
        break
      case 'READ':
        updateData.readAt = now
        break
      case 'REPLIED':
        updateData.repliedAt = now
        if (replyMessage) {
          updateData.replyMessage = replyMessage
        }
        break
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.message.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
