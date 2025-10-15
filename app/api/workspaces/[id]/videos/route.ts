import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[id]/videos - Get all videos in a workspace
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaceId = params.id

    // Check if user is a member of this workspace
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get workspace details
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get all videos in this workspace
    const videos = await prisma.video.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
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
      orderBy: { createdAt: 'desc' },
    })

    // Format videos to match VideoCard interface
    const formattedVideos = videos.map(video => ({
      id: video.id,
      originalPrompt: video.originalPrompt,
      videoUrl: video.videoUrl || '',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      viewsCount: video.viewsCount,
      likesCount: video.likesCount,
      commentsCount: video.commentsCount,
      sharesCount: video.sharesCount,
      isLiked: false, // TODO: Check if current user liked this video
      tags: video.tags,
      createdAt: video.createdAt.toISOString(),
      user: {
        id: video.user.id,
        name: video.user.name,
        username: video.user.username,
        image: video.user.image,
      },
    }))

    return NextResponse.json({
      workspace,
      videos: formattedVideos,
    })
  } catch (error) {
    console.error('Error fetching workspace videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspace videos' },
      { status: 500 }
    )
  }
}

// POST /api/workspaces/[id]/videos - Create a video in this workspace
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaceId = params.id

    // Check if user is a member with proper permissions
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }, // VIEWER cannot create videos
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied. Only workspace members can create videos.' },
        { status: 403 }
      )
    }

    // Get workspace to check shared credits
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { sharedCredits: true },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // For now, just return success - video creation logic should be handled
    // by the main video generation endpoint with workspaceId parameter
    return NextResponse.json({
      success: true,
      message: 'Use /api/generate endpoint with workspaceId parameter',
      workspaceId,
      sharedCredits: workspace.sharedCredits,
    })
  } catch (error) {
    console.error('Error creating workspace video:', error)
    return NextResponse.json(
      { error: 'Failed to create workspace video' },
      { status: 500 }
    )
  }
}
