import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const feedType = searchParams.get('type') || 'forYou' // forYou, following, trending

    const skip = (page - 1) * limit

    // Build where clause based on feed type
    const whereClause: Prisma.VideoWhereInput = {
      isPublic: true,
      status: 'COMPLETED',
      videoUrl: { not: null },
    }

    // Add following filter if needed
    if (feedType === 'following' && session?.user) {
      const following = await prisma.userFollow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })
      const followingIds = following.map((f) => f.followingId)
      if (followingIds.length > 0) {
        whereClause.userId = { in: followingIds }
      }
    }

    // Add trending filter if needed
    if (feedType === 'trending') {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      whereClause.createdAt = { gte: yesterday }
    }

    // Determine sort order based on feed type
    const orderBy: Prisma.VideoOrderByWithRelationInput | Prisma.VideoOrderByWithRelationInput[] =
      feedType === 'trending'
        ? [
            { likesCount: 'desc' },
            { viewsCount: 'desc' },
            { commentsCount: 'desc' },
          ]
        : feedType === 'forYou'
        ? [{ likesCount: 'desc' }, { createdAt: 'desc' }]
        : { createdAt: 'desc' }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: whereClause,
        orderBy,
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
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      }),
      prisma.video.count({ where: whereClause }),
    ])

    // If user is logged in, check which videos they've liked
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

    const videosWithLikeStatus = videos.map(video => ({
      id: video.id,
      prompt: video.originalPrompt,
      enhancedPrompt: video.enhancedPrompt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      model: video.model,
      size: video.size,
      tags: video.tags,
      createdAt: video.createdAt.toISOString(),
      user: video.user,
      likesCount: video.likesCount,
      commentsCount: video.commentsCount,
      viewsCount: video.viewsCount,
      isLiked: likedVideoIds.includes(video.id),
    }))

    return NextResponse.json({
      success: true,
      videos: videosWithLikeStatus,
      hasMore: skip + videos.length < total,
      page,
      total,
    })
  } catch (error) {
    console.error('Error fetching feed:', error)

    // Return empty feed if database not connected
    return NextResponse.json({
      success: true,
      videos: [],
      hasMore: false,
      page: 1,
      total: 0,
    })
  }
}
