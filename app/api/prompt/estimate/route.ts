import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { VideoService } from '@/lib/services/video-service'
import { VideoModel } from '@prisma/client'
import { z } from 'zod'

const estimateSchema = z.object({
  model: z.enum(['SORA_2', 'SORA_2_PRO']),
  size: z.string(),
  duration: z.number().refine((val) => [4, 8, 12].includes(val), {
    message: 'Duration must be 4, 8, or 12 seconds (Sora API limitation)',
  }),
})

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { model, size, duration } = estimateSchema.parse(body)

    const credits = VideoService.calculateCreditCost({
      model: model as VideoModel,
      size,
      duration,
    })

    return NextResponse.json({
      success: true,
      data: {
        estimatedCredits: credits,
        breakdown: {
          baseCost: credits,
          model: model,
          resolution: size,
          duration: `${duration}s`,
        },
      },
    })
  } catch (error) {
    console.error('Error estimating cost:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
