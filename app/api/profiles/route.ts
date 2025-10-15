import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profiles - Fetch profiles (discover or my profiles)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') || 'discover'

    let profiles

    if (tab === 'my-profiles') {
      // Fetch user's own profiles
      profiles = await prisma.styleProfile.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      })
    } else {
      // Fetch public profiles for discovery
      profiles = await prisma.styleProfile.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      })
    }

    // Transform the response to match frontend expectations
    const transformedProfiles = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description || '',
      prompt: (profile.settings as any)?.promptTemplate || '',
      model: (profile.settings as any)?.model || 'SORA_2',
      resolution: (profile.settings as any)?.defaultResolution || '1280x720',
      duration: (profile.settings as any)?.defaultDuration || 10,
      isPublic: profile.isPublic,
      userId: profile.userId,
      likes: profile.useCount || 0,
      createdAt: profile.createdAt.toISOString(),
      user: profile.user,
    }))

    return NextResponse.json({ profiles: transformedProfiles })
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

// POST /api/profiles - Create a new style profile
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, prompt, model, resolution, duration, isPublic } = body

    if (!name || !prompt) {
      return NextResponse.json({ error: 'Name and prompt are required' }, { status: 400 })
    }

    // Store configuration in settings JSON field
    const settings = {
      promptTemplate: prompt,
      model: model || 'SORA_2',
      defaultResolution: resolution || '1280x720',
      defaultDuration: duration || 10,
    }

    const profile = await prisma.styleProfile.create({
      data: {
        name,
        description: description || '',
        settings,
        isPublic: isPublic ?? true,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    // Transform response to match frontend expectations
    const transformedProfile = {
      id: profile.id,
      name: profile.name,
      description: profile.description || '',
      prompt: (profile.settings as any)?.promptTemplate || '',
      model: (profile.settings as any)?.model || 'SORA_2',
      resolution: (profile.settings as any)?.defaultResolution || '1280x720',
      duration: (profile.settings as any)?.defaultDuration || 10,
      isPublic: profile.isPublic,
      userId: profile.userId,
      likes: profile.useCount || 0,
      createdAt: profile.createdAt.toISOString(),
      user: profile.user,
    }

    return NextResponse.json(transformedProfile, { status: 201 })
  } catch (error) {
    console.error('Failed to create profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
