import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag: tagParam } = await params
    const tag = decodeURIComponent(tagParam).toLowerCase()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const session = await auth()

    // Find videos with this tag
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'COMPLETED',
          videoUrl: { not: null },
          tags: {
            has: tag,
          },
        },
        orderBy: [
          { likesCount: 'desc' },
          { viewsCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.video.count({
        where: {
          isPublic: true,
          status: 'COMPLETED',
          tags: {
            has: tag,
          },
        },
      }),
    ])

    // Check if user has liked these videos
    let likedVideoIds: string[] = []
    if (session?.user) {
      const likes = await prisma.videoLike.findMany({
        where: {
          userId: session.user.id,
          videoId: { in: videos.map(v => v.id) },
        },
        select: { videoId: true },
      })
      likedVideoIds = likes.map(l => l.videoId)
    }

    const formattedVideos = videos.map(video => ({
      id: video.id,
      originalPrompt: video.originalPrompt,
      enhancedPrompt: video.enhancedPrompt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      viewsCount: video.viewsCount,
      likesCount: video.likesCount,
      commentsCount: video.commentsCount,
      sharesCount: video.sharesCount,
      isLiked: likedVideoIds.includes(video.id),
      tags: video.tags,
      createdAt: video.createdAt.toISOString(),
      user: video.user,
    }))

    return NextResponse.json({
      success: true,
      tag,
      videos: formattedVideos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    })
  } catch (error) {
    console.error('Failed to fetch videos by tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
