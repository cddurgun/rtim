import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces - Fetch user's workspaces
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch workspaces where user is owner or member
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            videos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('Failed to fetch workspaces:', error)
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, sharedCredits } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if user has enough credits to allocate
    if (sharedCredits > 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      })

      if (!user || user.credits < sharedCredits) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
      }
    }

    // Generate unique slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

    // Create workspace and deduct credits in a transaction
    const workspace = await prisma.$transaction(async (tx) => {
      let balanceAfter = 0

      // Deduct credits if allocating to workspace
      if (sharedCredits > 0) {
        const updatedUser = await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: sharedCredits } },
          select: { credits: true },
        })

        balanceAfter = updatedUser.credits

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'WORKSPACE_ALLOCATION',
            amount: -sharedCredits,
            balanceAfter,
            description: `Allocated credits to workspace: ${name}`,
          },
        })
      } else {
        // Get current balance if no credits allocated
        const currentUser = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { credits: true },
        })
        balanceAfter = currentUser?.credits || 0
      }

      // Create workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name,
          slug,
          sharedCredits: sharedCredits || 0,
          ownerId: session.user.id,
          settings: description ? { description } : {},
        },
        include: {
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              members: true,
              videos: true,
            },
          },
        },
      })

      // Create owner as WorkspaceMember with OWNER role
      await tx.workspaceMember.create({
        data: {
          userId: session.user.id,
          workspaceId: newWorkspace.id,
          role: 'OWNER',
        },
      })

      // Fetch complete workspace with members
      const completeWorkspace = await tx.workspace.findUnique({
        where: { id: newWorkspace.id },
        include: {
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              videos: true,
            },
          },
        },
      })

      return completeWorkspace
    })

    return NextResponse.json(workspace, { status: 201 })
  } catch (error) {
    console.error('Failed to create workspace:', error)
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
  }
}
