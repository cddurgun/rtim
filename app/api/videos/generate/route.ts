import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { VideoService } from '@/lib/services/video-service'
import { SoraAPI } from '@/lib/services/sora-api'
import { VideoModel } from '@prisma/client'
import { z } from 'zod'

const generateVideoSchema = z.object({
  prompt: z.string().min(10).max(5000),
  model: z.enum(['SORA_2', 'SORA_2_PRO']),
  size: z.string(),
  duration: z.number().refine((val) => [4, 8, 12].includes(val), {
    message: 'Duration must be 4, 8, or 12 seconds (Sora API limitation)',
  }),
  enhancedPrompt: z.string().optional(),
  workspaceId: z.string().optional(),
  remixVideoId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = generateVideoSchema.parse(body)

    // Calculate credit cost
    const creditCost = VideoService.calculateCreditCost({
      model: validatedData.model as VideoModel,
      size: validatedData.size,
      duration: validatedData.duration,
    })

    // For demo without database, we'll skip credit check
    // In production: check if user.credits >= creditCost

    // Map model to Sora API format
    const soraModel = validatedData.model === 'SORA_2_PRO' ? 'sora-2-pro' : 'sora-2'

    // Use enhanced prompt if available, otherwise use original
    const finalPrompt = validatedData.enhancedPrompt || validatedData.prompt

    // Create video job in Sora API
    const soraResponse = await SoraAPI.createVideo({
      prompt: finalPrompt,
      model: soraModel,
      size: validatedData.size,
      seconds: validatedData.duration,
    })

    // Save video record to database
    const video = await VideoService.createVideo({
      userId: user.id,
      soraJobId: soraResponse.id,
      originalPrompt: validatedData.prompt,
      enhancedPrompt: validatedData.enhancedPrompt,
      model: validatedData.model as VideoModel,
      size: validatedData.size,
      duration: validatedData.duration,
      creditsCost: creditCost,
      workspaceId: validatedData.workspaceId,
      remixedFrom: validatedData.remixVideoId,
    })

    // Return job details for client-side polling
    return NextResponse.json({
      success: true,
      data: {
        id: video.id,
        jobId: soraResponse.id,
        status: soraResponse.status,
        prompt: soraResponse.prompt,
        model: validatedData.model,
        size: validatedData.size,
        duration: validatedData.duration,
        creditCost,
      },
    })
  } catch (error) {
    console.error('Error generating video:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.name === 'InsufficientCreditsError') {
      return NextResponse.json(
        { error: error.message },
        { status: 402 } // Payment Required
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
