import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/services/auth-utils'
import { PromptEnhancementService } from '@/lib/services/prompt-enhancement'
import { z } from 'zod'

const enhancePromptSchema = z.object({
  prompt: z.string().min(10).max(5000),
  styleTemplate: z.string().optional(),
  cinematicLevel: z.enum(['minimal', 'moderate', 'maximum']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { prompt, styleTemplate, cinematicLevel } = enhancePromptSchema.parse(body)

    // Check prompt safety
    const safetyCheck = await PromptEnhancementService.analyzeSafety(prompt)

    if (!safetyCheck.safe) {
      return NextResponse.json(
        {
          error: 'Prompt contains restricted content',
          issues: safetyCheck.issues,
        },
        { status: 400 }
      )
    }

    // Enhance the prompt
    const enhanced = await PromptEnhancementService.enhancePrompt(prompt, {
      styleTemplate,
      cinematicLevel,
    })

    return NextResponse.json({
      success: true,
      data: enhanced,
    })
  } catch (error) {
    console.error('Error enhancing prompt:', error)

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
