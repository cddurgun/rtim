import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/workspaces/[id]/members/[memberId] - Remove a member from workspace
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId, memberId: memberIdToRemove } = await params

    // Get the member to be removed
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: memberIdToRemove },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    if (!memberToRemove || memberToRemove.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get current user's member record
    const currentMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    })

    if (!currentMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check permissions
    // Owner can remove anyone except themselves
    // Admin can remove MEMBER and VIEWER
    // Members can only remove themselves
    const canRemove =
      currentMember.role === 'OWNER' ||
      (currentMember.role === 'ADMIN' && !['OWNER', 'ADMIN'].includes(memberToRemove.role)) ||
      (currentMember.userId === memberToRemove.userId) // Self-removal

    if (!canRemove) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove this member' },
        { status: 403 }
      )
    }

    // Prevent owner from removing themselves if they're the only owner
    if (memberToRemove.role === 'OWNER') {
      const ownerCount = await prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: 'OWNER',
        },
      })

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner. Transfer ownership or delete the workspace.' },
          { status: 400 }
        )
      }
    }

    // Remove the member
    await prisma.workspaceMember.delete({
      where: { id: memberIdToRemove },
    })

    // TODO: Send notification to removed user
    // await notifyWorkspaceRemoval(memberToRemove.userId, workspaceId)

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}

// PATCH /api/workspaces/[id]/members/[memberId] - Update member role (owner/admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId, memberId: memberIdToUpdate } = await params
    const { role } = await req.json()

    if (!role || !['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get current user's member record
    const currentMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    })

    if (!currentMember || currentMember.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only workspace owner can change member roles' },
        { status: 403 }
      )
    }

    // Get member to update
    const memberToUpdate = await prisma.workspaceMember.findUnique({
      where: { id: memberIdToUpdate },
    })

    if (!memberToUpdate || memberToUpdate.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberIdToUpdate },
      data: { role },
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
      },
    })

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: 'Member role updated successfully'
    })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}
