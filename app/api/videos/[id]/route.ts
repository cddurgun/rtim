import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { VideoService } from '@/lib/services/video-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const video = await prisma.video.findUnique({
      where: { id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (video.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If video is still processing, fetch latest status
    if (video.soraJobId && video.status !== 'COMPLETED' && video.status !== 'FAILED') {
      await VideoService.updateVideoStatus(video.id, video.soraJobId)

      // Refetch updated video
      const updatedVideo = await prisma.video.findUnique({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        data: updatedVideo,
      })
    }

    return NextResponse.json({
      success: true,
      data: video,
    })
  } catch (error) {
    console.error('Error fetching video:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    await VideoService.deleteVideo(id, user.id)

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting video:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'Video not found') {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
