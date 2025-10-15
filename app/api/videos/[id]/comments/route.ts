import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { notifyVideoComment, notifyCommentReply } from '@/lib/notifications'

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get top-level comments only (parentId is null)
    const [comments, total] = await Promise.all([
      prisma.videoComment.findMany({
        where: {
          videoId,
          parentId: null,
        },
        orderBy: { createdAt: 'desc' },
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
          replies: {
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
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.videoComment.count({
        where: {
          videoId,
          parentId: null,
        },
      }),
    ])

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: comment.user,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        user: reply.user,
      })),
    }))

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      hasMore: skip + comments.length < total,
      page,
      total,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({
      success: true,
      comments: [],
      hasMore: false,
      page: 1,
      total: 0,
    })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: videoId } = await params
    const body = await req.json()
    const validatedData = commentSchema.parse(body)

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // If replying to a comment, check if parent exists
    let parentComment = null
    if (validatedData.parentId) {
      parentComment = await prisma.videoComment.findUnique({
        where: { id: validatedData.parentId },
        include: {
          user: true,
        },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Create comment and update count in transaction
    const [comment] = await prisma.$transaction([
      prisma.videoComment.create({
        data: {
          content: validatedData.content,
          videoId,
          userId: session.user.id,
          parentId: validatedData.parentId,
        },
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
      prisma.video.update({
        where: { id: videoId },
        data: { commentsCount: { increment: 1 } },
      }),
    ])

    // Create notifications
    if (parentComment) {
      // Reply notification
      if (parentComment.userId !== session.user.id) {
        await notifyCommentReply(
          parentComment.userId,
          session.user.name || 'Someone',
          session.user.id,
          videoId,
          comment.id,
          validatedData.content
        )
      }
    } else {
      // New comment notification
      if (video.userId !== session.user.id) {
        await notifyVideoComment(
          video.userId,
          session.user.name || 'Someone',
          session.user.id,
          videoId,
          video.originalPrompt,
          comment.id,
          validatedData.content
        )
      }
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: comment.user,
      },
    })
  } catch (error) {
    console.error('Error creating comment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
