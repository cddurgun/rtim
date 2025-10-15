import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/videos/[id]/share - Track video share
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params
    const session = await auth()

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, sharesCount: true },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Increment shares count
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: { sharesCount: { increment: 1 } },
      select: { sharesCount: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Share tracked',
      sharesCount: updatedVideo.sharesCount,
    })
  } catch (error) {
    console.error('Failed to track share:', error)
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    )
  }
}
