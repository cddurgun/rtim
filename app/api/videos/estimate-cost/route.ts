import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CostEstimator } from '@/lib/services/cost-estimator'
import { z } from 'zod'

const estimateSchema = z.object({
  model: z.enum(['SORA_2', 'SORA_2_PRO']),
  size: z.string(),
  duration: z.number().refine((val) => [4, 8, 12].includes(val), {
    message: 'Duration must be 4, 8, or 12 seconds (Sora API limitation)',
  }),
  prompt: z.string().min(3).max(5000),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = estimateSchema.parse(body)

    // Get cost estimate
    const estimate = CostEstimator.estimateCost(validatedData)

    // Get model suggestion
    const modelSuggestion = CostEstimator.suggestModel(
      validatedData.prompt,
      estimate.estimatedCost
    )

    return NextResponse.json({
      success: true,
      data: {
        estimate,
        modelSuggestion,
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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
