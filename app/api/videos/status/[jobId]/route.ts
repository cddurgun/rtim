import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { SoraAPI } from '@/lib/services/sora-api'
import { VideoService } from '@/lib/services/video-service'
import { VideoStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    await requireAuth()

    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get job status from Sora API
    const jobStatus = await SoraAPI.getVideoStatus(jobId)

    // Get video from database to get the video ID
    const video = await prisma.video.findFirst({
      where: { soraJobId: jobId },
      select: { id: true },
    })

    // Update video status in database (this will download and save the video if completed)
    try {
      if (jobStatus.status === 'completed' && video?.id && jobId) {
        // Use the full updateVideoStatus method that downloads and saves the video
        await VideoService.updateVideoStatus(video.id, jobId)
      } else if (jobId) {
        // For non-completed statuses, use the simple update
        await VideoService.updateVideoStatusSimple({
          soraJobId: jobId,
          status: jobStatus.status as VideoStatus,
          progress: jobStatus.progress,
          errorMessage: typeof jobStatus.error === 'string' ? jobStatus.error : jobStatus.error?.message,
        })
      }
    } catch (dbError) {
      console.error('Failed to update video status in DB:', dbError)
      // Continue even if DB update fails - return API status
    }

    // Get the updated video with the video URL
    const updatedVideo = await prisma.video.findFirst({
      where: { soraJobId: jobId },
      select: { videoUrl: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...jobStatus,
        download_url: updatedVideo?.videoUrl || jobStatus.download_url,
      },
    })
  } catch (error) {
    console.error('Error fetching video status:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
