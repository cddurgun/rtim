import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { VideoService } from '@/lib/services/video-service'
import { VideoStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const statusParam = searchParams.get('status')

    // Filter out 'all' - only pass valid VideoStatus values
    const status = statusParam && statusParam !== 'all'
      ? (statusParam as VideoStatus)
      : undefined

    const result = await VideoService.getUserVideos({
      userId: user.id,
      page,
      limit,
      status,
    })

    // Map database fields to frontend expected fields
    const mappedVideos = result.data.map((video: any) => ({
      id: video.id,
      prompt: video.originalPrompt,
      enhancedPrompt: video.enhancedPrompt,
      model: video.model,
      resolution: video.size,
      duration: video.duration,
      status: video.status,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      cost: video.creditsCost,
      jobId: video.soraJobId,
      createdAt: video.createdAt,
      completedAt: video.completedAt,
      userId: video.userId,
      workspaceId: video.workspaceId,
      views: video.viewsCount || 0,
      likes: video.likesCount || 0,
    }))

    return NextResponse.json({
      success: true,
      videos: mappedVideos,
      hasMore: result.pagination.page < result.pagination.totalPages,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('Error fetching videos:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
