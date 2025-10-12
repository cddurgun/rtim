import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      )
    }

    // Create like and update counts in a transaction
    const result = await prisma.$transaction([
      prisma.videoLike.create({
        data: {
          videoId,
          userId: session.user.id,
        },
      }),
      prisma.video.update({
        where: { id: videoId },
        data: { likesCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: video.userId },
        data: { totalLikes: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      likesCount: result[1].likesCount,
    })
  } catch (error) {
    console.error('Error liking video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: videoId } = await params

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if like exists
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId: session.user.id,
        },
      },
    })

    if (!existingLike) {
      return NextResponse.json(
        { error: 'Not liked yet' },
        { status: 400 }
      )
    }

    // Delete like and update counts in a transaction
    const result = await prisma.$transaction([
      prisma.videoLike.delete({
        where: {
          videoId_userId: {
            videoId,
            userId: session.user.id,
          },
        },
      }),
      prisma.video.update({
        where: { id: videoId },
        data: { likesCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: video.userId },
        data: { totalLikes: { decrement: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
      likesCount: result[1].likesCount,
    })
  } catch (error) {
    console.error('Error unliking video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
