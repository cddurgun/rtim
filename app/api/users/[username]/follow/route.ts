import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyUserFollow } from '@/lib/notifications'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await params

    // Find user by username
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    })

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userToFollow.id

    // Can't follow yourself
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create follow and update counts in a transaction
    const [follow] = await prisma.$transaction([
      prisma.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId: userId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { increment: 1 } },
      }),
    ])

    // Send follow notification
    await notifyUserFollow(
      userId,
      session.user.name || 'Someone',
      session.user.id,
      username
    )

    return NextResponse.json({
      success: true,
      data: follow,
    })
  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await params

    // Find user by username
    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    })

    if (!userToUnfollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = userToUnfollow.id

    // Check if following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      )
    }

    // Delete follow and update counts in a transaction
    await prisma.$transaction([
      prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId,
          },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { decrement: 1 } },
      }),
    ])

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
