import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/videos/[id]/view - Track video view
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params
    const session = await auth()

    // Get client IP address for deduplication
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown'

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, userId: true },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if view already tracked (within last 24 hours)
    const existingView = await prisma.videoView.findFirst({
      where: {
        videoId,
        ...(session?.user
          ? { userId: session.user.id }
          : { ipAddress }),
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })

    // If view already tracked recently, don't count it again
    if (existingView) {
      return NextResponse.json({
        success: true,
        message: 'View already tracked',
        viewsCount: await getViewsCount(videoId),
      })
    }

    // Create view record and increment counter in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create view record
      await tx.videoView.create({
        data: {
          videoId,
          userId: session?.user?.id || null,
          ipAddress: session?.user ? null : ipAddress,
        },
      })

      // Increment views count
      const updatedVideo = await tx.video.update({
        where: { id: videoId },
        data: { viewsCount: { increment: 1 } },
        select: { viewsCount: true },
      })

      return updatedVideo
    })

    return NextResponse.json({
      success: true,
      message: 'View tracked',
      viewsCount: result.viewsCount,
    })
  } catch (error) {
    console.error('Failed to track view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}

async function getViewsCount(videoId: string): Promise<number> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { viewsCount: true },
  })
  return video?.viewsCount || 0
}
