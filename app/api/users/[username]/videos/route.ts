import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoStatus, Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const session = await auth()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if current user can view videos
    const isOwnProfile = session?.user?.id === user.id
    const canViewProfile = !user.isPrivate || isOwnProfile

    if (!canViewProfile) {
      return NextResponse.json(
        { error: 'This profile is private' },
        { status: 403 }
      )
    }

    // Build query based on viewing permissions
    const whereClause: Prisma.VideoWhereInput = {
      userId: user.id,
      status: VideoStatus.COMPLETED,
      videoUrl: { not: null },
      ...(isOwnProfile ? {} : { isPublic: true }),
    }

    // Fetch videos with pagination
    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalPrompt: true,
          enhancedPrompt: true,
          videoUrl: true,
          thumbnailUrl: true,
          model: true,
          size: true,
          duration: true,
          isPublic: true,
          viewsCount: true,
          likesCount: true,
          commentsCount: true,
          sharesCount: true,
          tags: true,
          createdAt: true,
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
      prisma.video.count({ where: whereClause }),
    ])

    // Check if current user has liked each video
    let videoLikes: { [key: string]: boolean } = {}
    if (session?.user) {
      const likes = await prisma.videoLike.findMany({
        where: {
          userId: session.user.id,
          videoId: { in: videos.map((v) => v.id) },
        },
        select: { videoId: true },
      })
      videoLikes = likes.reduce((acc, like) => {
        acc[like.videoId] = true
        return acc
      }, {} as { [key: string]: boolean })
    }

    // Add isLiked flag to each video
    const videosWithLikes = videos.map((video) => ({
      ...video,
      isLiked: videoLikes[video.id] || false,
    }))

    return NextResponse.json({
      success: true,
      data: {
        videos: videosWithLikes,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching user videos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
