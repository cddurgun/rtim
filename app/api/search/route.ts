import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, videos, users, tags
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          videos: [],
          users: [],
          tags: [],
        },
      })
    }

    const session = await auth()
    const results: any = {
      videos: [],
      users: [],
      tags: [],
    }

    // Search Videos
    if (type === 'all' || type === 'videos') {
      const videos = await prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'COMPLETED',
          videoUrl: { not: null },
          OR: [
            {
              originalPrompt: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              enhancedPrompt: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              tags: {
                hasSome: [query.toLowerCase()],
              },
            },
          ],
        },
        take: limit,
        orderBy: [
          { likesCount: 'desc' },
          { viewsCount: 'desc' },
          { createdAt: 'desc' },
        ],
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
      })

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

      results.videos = videos.map(video => ({
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
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          followersCount: true,
          followingCount: true,
          _count: {
            select: {
              videos: {
                where: {
                  isPublic: true,
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
        orderBy: {
          followersCount: 'desc',
        },
      })

      // Check if current user follows these users
      let followingIds: string[] = []
      if (session?.user) {
        const following = await prisma.userFollow.findMany({
          where: {
            followerId: session.user.id,
            followingId: { in: users.map(u => u.id) },
          },
          select: { followingId: true },
        })
        followingIds = following.map(f => f.followingId)
      }

      results.users = users.map(user => ({
        ...user,
        videosCount: user._count.videos,
        isFollowing: followingIds.includes(user.id),
        isOwnProfile: session?.user?.id === user.id,
      }))
    }

    // Search Tags
    if (type === 'all' || type === 'tags') {
      // Get unique tags from videos that match the query
      const videosWithTags = await prisma.video.findMany({
        where: {
          isPublic: true,
          status: 'COMPLETED',
          tags: {
            isEmpty: false,
          },
        },
        select: {
          tags: true,
          id: true,
        },
      })

      const tagMap = new Map<string, number>()
      videosWithTags.forEach(video => {
        video.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            tagMap.set(tag.toLowerCase(), (tagMap.get(tag.toLowerCase()) || 0) + 1)
          }
        })
      })

      results.tags = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      query,
      results,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        results: {
          videos: [],
          users: [],
          tags: [],
        },
      },
      { status: 500 }
    )
  }
}
