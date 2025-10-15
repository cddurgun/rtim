import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/profiles/[id]/like - Like or unlike a profile
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: profileId } = await params

    // TODO: Implement ProfileLike model in Prisma schema
    // For now, return not implemented status
    return NextResponse.json(
      { error: 'Profile liking feature not yet implemented' },
      { status: 501 }
    )

    // // Check if already liked
    // const existingLike = await prisma.profileLike.findUnique({
    //   where: {
    //     userId_profileId: {
    //       userId: session.user.id,
    //       profileId: profileId,
    //     },
    //   },
    // })

    // if (existingLike) {
    //   // Unlike
    //   await prisma.profileLike.delete({
    //     where: {
    //       userId_profileId: {
    //         userId: session.user.id,
    //         profileId: profileId,
    //       },
    //     },
    //   })

    //   return NextResponse.json({ liked: false })
    // } else {
    //   // Like
    //   await prisma.profileLike.create({
    //     data: {
    //       userId: session.user.id,
    //       profileId: profileId,
    //     },
    //   })

    //   return NextResponse.json({ liked: true })
    // }
  } catch (error) {
    console.error('Failed to like/unlike profile:', error)
    return NextResponse.json({ error: 'Failed to like/unlike profile' }, { status: 500 })
  }
}
