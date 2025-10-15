import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { prisma } from '@/lib/prisma'

// Get user's OpenAI API key status
export async function GET() {
  try {
    const user = await requireAuth()

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { openaiApiKey: true },
    })

    return NextResponse.json({
      hasKey: !!userData?.openaiApiKey,
    })
  } catch (error) {
    console.error('Error fetching API key status:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch API key status' },
      { status: 500 }
    )
  }
}

// Save user's OpenAI API key
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      )
    }

    // Update user's OpenAI API key
    await prisma.user.update({
      where: { id: user.id },
      data: { openaiApiKey: apiKey },
    })

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully',
    })
  } catch (error) {
    console.error('Error saving API key:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    )
  }
}

// Delete user's OpenAI API key
export async function DELETE() {
  try {
    const user = await requireAuth()

    await prisma.user.update({
      where: { id: user.id },
      data: { openaiApiKey: null },
    })

    return NextResponse.json({
      success: true,
      message: 'API key removed successfully',
    })
  } catch (error) {
    console.error('Error removing API key:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    )
  }
}
