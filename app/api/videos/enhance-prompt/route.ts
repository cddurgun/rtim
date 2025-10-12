import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PromptEnhancer } from '@/lib/services/prompt-enhancer'
import { z } from 'zod'

const enhanceSchema = z.object({
  prompt: z.string().min(3).max(500),
  style: z.string().optional(),
  preserveOriginal: z.boolean().optional().default(false),
  targetLength: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  cinematicLevel: z.enum(['minimal', 'moderate', 'maximum']).optional().default('moderate'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = enhanceSchema.parse(body)

    // Check safeguards first
    const safeguardCheck = PromptEnhancer.checkSafeguards(validatedData.prompt)

    if (!safeguardCheck.safe) {
      return NextResponse.json({
        success: false,
        safeguard: safeguardCheck,
      }, { status: 400 })
    }

    // Enhance the prompt
    const enhancement = await PromptEnhancer.enhance(validatedData.prompt, {
      style: validatedData.style,
      preserveOriginal: validatedData.preserveOriginal,
      targetLength: validatedData.targetLength,
      cinematicLevel: validatedData.cinematicLevel,
    })

    return NextResponse.json({
      success: true,
      data: enhancement,
      safeguard: safeguardCheck,
    })
  } catch (error) {
    console.error('Error enhancing prompt:', error)

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
