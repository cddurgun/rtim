import OpenAI from 'openai'
import { STYLE_TEMPLATES } from '@/lib/constants'
import { EnhancedPrompt } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class PromptEnhancementService {
  /**
   * Enhance a user's prompt for better video generation results
   */
  static async enhancePrompt(
    originalPrompt: string,
    options?: {
      styleTemplate?: string
      cinematicLevel?: 'minimal' | 'moderate' | 'maximum'
    }
  ): Promise<EnhancedPrompt> {
    const { styleTemplate, cinematicLevel = 'moderate' } = options || {}

    try {
      // Build enhancement instructions
      const systemPrompt = this.buildSystemPrompt(cinematicLevel, styleTemplate)

      // Use GPT-4 to enhance the prompt
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Original prompt: "${originalPrompt}"

Please enhance this prompt for high-quality video generation. Return a JSON object with:
{
  "enhanced": "the enhanced prompt",
  "improvements": ["list of improvements made"],
  "qualityScore": number between 0-100
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      })

      const response = JSON.parse(completion.choices[0].message.content || '{}')

      // Calculate estimated cost
      const estimatedCost = this.estimateCost(response.enhanced || originalPrompt)

      return {
        original: originalPrompt,
        enhanced: response.enhanced || originalPrompt,
        improvements: response.improvements || [],
        qualityScore: response.qualityScore || 70,
        estimatedCost,
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error)

      // Fallback to rule-based enhancement
      return this.fallbackEnhancement(originalPrompt, styleTemplate)
    }
  }

  /**
   * Build system prompt for GPT-4 based on options
   */
  private static buildSystemPrompt(
    cinematicLevel: 'minimal' | 'moderate' | 'maximum',
    styleTemplate?: string
  ): string {
    const basePrompt = `You are an expert in crafting prompts for AI video generation using OpenAI's Sora-2.
Your goal is to enhance user prompts to produce professional, high-quality videos.`

    const guidelines = `
Guidelines for enhancement:
1. ALWAYS specify shot type (wide, medium, close-up, etc.)
2. Include camera movement if appropriate (dolly, tracking, pan, static)
3. Describe lighting conditions (natural, golden hour, dramatic, soft)
4. Add technical details like depth of field when relevant
5. Ensure temporal coherence by describing motion clearly
6. Keep prompts concise but descriptive (under 500 words)
7. Avoid copyrighted characters, real people, or explicit content
8. Focus on visual storytelling elements

Cinematic level: ${cinematicLevel}
- minimal: Add basic shot types and lighting
- moderate: Add camera movements, lighting, and some technical details
- maximum: Full cinematic treatment with advanced techniques
`

    const styleGuidelines = styleTemplate
      ? `\nStyle template: ${styleTemplate}\n${this.getStyleGuidelines(styleTemplate)}`
      : ''

    return basePrompt + guidelines + styleGuidelines
  }

  /**
   * Get style-specific guidelines
   */
  private static getStyleGuidelines(styleTemplate: string): string {
    const template = STYLE_TEMPLATES.find(t => t.name === styleTemplate)
    if (!template) return ''

    return `Apply these style characteristics:
${template.settings.promptAdditions.map(add => `- ${add}`).join('\n')}
Style: ${template.settings.cinematicStyle}`
  }

  /**
   * Fallback rule-based enhancement when GPT fails
   */
  private static fallbackEnhancement(
    originalPrompt: string,
    styleTemplate?: string
  ): EnhancedPrompt {
    let enhanced = originalPrompt
    const improvements: string[] = []

    // Check if prompt already has shot type
    if (!this.hasShotType(originalPrompt)) {
      enhanced = `Medium shot, ${enhanced}`
      improvements.push('Added shot type')
    }

    // Check if prompt has lighting
    if (!this.hasLighting(originalPrompt)) {
      enhanced = `${enhanced}, natural lighting`
      improvements.push('Added lighting description')
    }

    // Add camera movement for dynamic scenes
    if (this.needsCameraMovement(originalPrompt)) {
      enhanced = `${enhanced}, smooth camera movement`
      improvements.push('Added camera movement')
    }

    // Apply style template if provided
    if (styleTemplate) {
      const template = STYLE_TEMPLATES.find(t => t.name === styleTemplate)
      if (template) {
        const styleAdditions = template.settings.promptAdditions.slice(0, 2).join(', ')
        enhanced = `${enhanced}, ${styleAdditions}`
        improvements.push(`Applied ${styleTemplate} style`)
      }
    }

    return {
      original: originalPrompt,
      enhanced,
      improvements,
      qualityScore: 65,
      estimatedCost: this.estimateCost(enhanced),
    }
  }

  /**
   * Check if prompt already contains shot type
   */
  private static hasShotType(prompt: string): boolean {
    const shotKeywords = ['shot', 'view', 'angle', 'close-up', 'wide', 'medium', 'POV']
    return shotKeywords.some(keyword =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Check if prompt has lighting description
   */
  private static hasLighting(prompt: string): boolean {
    const lightingKeywords = ['light', 'lighting', 'sun', 'shadow', 'bright', 'dark', 'golden hour']
    return lightingKeywords.some(keyword =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Determine if camera movement would benefit the scene
   */
  private static needsCameraMovement(prompt: string): boolean {
    const dynamicKeywords = ['walking', 'running', 'driving', 'flying', 'moving', 'traveling']
    return dynamicKeywords.some(keyword =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Estimate cost based on prompt complexity
   */
  private static estimateCost(prompt: string): number {
    // Base cost (8 seconds, 720p, sora-2)
    const baseCost = 80

    // Adjust based on prompt length (longer = potentially higher quality = more cost)
    const lengthMultiplier = Math.min(1.5, 1 + (prompt.length / 1000))

    return Math.ceil(baseCost * lengthMultiplier)
  }

  /**
   * Analyze prompt for potential issues
   */
  static async analyzeSafety(prompt: string): Promise<{
    safe: boolean
    issues: string[]
  }> {
    try {
      const moderation = await openai.moderations.create({
        input: prompt,
      })

      const result = moderation.results[0]

      if (result.flagged) {
        const issues = Object.entries(result.categories)
          .filter(([, flagged]) => flagged)
          .map(([category]) => category)

        return {
          safe: false,
          issues,
        }
      }

      // Additional custom checks
      const customIssues: string[] = []

      // Check for copyrighted characters
      const copyrightedTerms = ['mickey mouse', 'spider-man', 'harry potter', 'batman', 'superman']
      if (copyrightedTerms.some(term => prompt.toLowerCase().includes(term))) {
        customIssues.push('Contains potentially copyrighted characters')
      }

      // Check for real people
      const celebrityPatterns = /\b(elon musk|taylor swift|donald trump|celebrity|famous person)\b/i
      if (celebrityPatterns.test(prompt)) {
        customIssues.push('References to real people not allowed')
      }

      return {
        safe: customIssues.length === 0,
        issues: customIssues,
      }
    } catch (error) {
      console.error('Error analyzing safety:', error)
      return {
        safe: true,
        issues: [],
      }
    }
  }

  /**
   * Get prompt suggestions based on user's history
   */
  static async getPromptSuggestions(_userId: string): Promise<string[]> {
    // This would analyze user's successful prompts and suggest similar ones
    // For now, return popular templates
    return [
      'A serene lake at sunset with mountains in the background, golden hour lighting, wide shot',
      'Close-up of a coffee cup on a wooden table, steam rising, morning light through window',
      'Aerial shot of a busy city street at night, neon lights, rain-slicked pavement',
      'Wide shot of a person walking through a forest, dappled sunlight, handheld camera',
      'Time-lapse of clouds moving over a landscape, dramatic sky, wide angle',
    ]
  }
}
