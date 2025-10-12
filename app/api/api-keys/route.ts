import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET /api/api-keys - Fetch user's API keys
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        lastUsed: true,
        createdAt: true,
        expiresAt: true,
        requestCount: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate a secure API key
    const key = `rtim_${crypto.randomBytes(32).toString('hex')}`

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        userId: session.user.id,
      },
    })

    return NextResponse.json(apiKey, { status: 201 })
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
