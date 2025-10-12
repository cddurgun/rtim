/**
 * Intelligent Prompt Enhancement System
 * Analyzes and optimizes user prompts for better Sora-2 video generation
 */

interface CinematicTechnique {
  category: 'camera' | 'lighting' | 'composition' | 'motion' | 'atmosphere'
  terms: string[]
  weight: number
}

interface SafeguardResult {
  safe: boolean
  issues: string[]
  suggestions: string[]
}

interface EnhancementResult {
  originalPrompt: string
  enhancedPrompt: string
  improvements: string[]
  qualityScore: number
  estimatedSuccessRate: number
  cinematicTechniques: string[]
}

export class PromptEnhancer {
  // Cinematic vocabulary database
  private static cinematicTechniques: CinematicTechnique[] = [
    {
      category: 'camera',
      terms: [
        'dolly shot', 'tracking shot', 'crane shot', 'aerial view',
        'dutch angle', 'low angle', 'high angle', 'eye level',
        'close-up', 'medium shot', 'wide shot', 'extreme close-up',
        'over-the-shoulder', 'point of view', 'establishing shot'
      ],
      weight: 1.0
    },
    {
      category: 'lighting',
      terms: [
        'cinematic lighting', 'golden hour', 'blue hour', 'soft lighting',
        'dramatic lighting', 'rim lighting', 'volumetric lighting',
        'natural lighting', 'studio lighting', 'moody lighting',
        'high contrast', 'low key', 'high key'
      ],
      weight: 0.9
    },
    {
      category: 'composition',
      terms: [
        'rule of thirds', 'symmetrical composition', 'leading lines',
        'frame within frame', 'depth of field', 'shallow focus',
        'deep focus', 'bokeh', 'negative space', 'golden ratio'
      ],
      weight: 0.8
    },
    {
      category: 'motion',
      terms: [
        'smooth motion', 'fluid movement', 'slow motion', 'time-lapse',
        'steady cam', 'handheld', 'dynamic movement', 'static shot',
        'panning', 'tilting', 'zooming', 'rack focus'
      ],
      weight: 1.0
    },
    {
      category: 'atmosphere',
      terms: [
        'cinematic', 'atmospheric', 'dramatic', 'epic', 'intimate',
        'ethereal', 'gritty', 'vibrant', 'muted colors', 'saturated',
        'film grain', 'anamorphic', 'widescreen', '35mm film look'
      ],
      weight: 0.7
    }
  ]

  /**
   * Main enhancement pipeline
   */
  static async enhance(
    prompt: string,
    options: {
      style?: string
      preserveOriginal?: boolean
      targetLength?: 'short' | 'medium' | 'long'
      cinematicLevel?: 'minimal' | 'moderate' | 'maximum'
    } = {}
  ): Promise<EnhancementResult> {
    const {
      preserveOriginal = false,
      targetLength = 'medium',
      cinematicLevel = 'moderate'
    } = options

    // Step 1: Analyze original prompt
    const analysis = this.analyzePrompt(prompt)

    // Step 2: Apply cinematic enhancement
    let enhanced = this.applyCinematicEnhancement(prompt, cinematicLevel, analysis)

    // Step 3: Optimize for technical quality
    enhanced = this.applyTechnicalOptimization(enhanced, analysis)

    // Step 4: Apply style consistency if provided
    if (options.style) {
      enhanced = this.applyStyleConsistency(enhanced, options.style)
    }

    // Step 5: Optimize length
    enhanced = this.optimizeLength(enhanced, targetLength)

    // Step 6: Add temporal coherence descriptors
    enhanced = this.addTemporalCoherence(enhanced, analysis)

    // Step 7: Calculate quality metrics
    const qualityScore = this.calculateQualityScore(enhanced, analysis)
    const estimatedSuccessRate = this.estimateSuccessRate(enhanced, analysis)

    return {
      originalPrompt: prompt,
      enhancedPrompt: preserveOriginal ? `${prompt}. ${enhanced}` : enhanced,
      improvements: this.identifyImprovements(prompt, enhanced),
      qualityScore,
      estimatedSuccessRate,
      cinematicTechniques: this.extractAppliedTechniques(enhanced)
    }
  }

  /**
   * Analyze prompt for key characteristics
   */
  private static analyzePrompt(prompt: string): {
    hasCamera: boolean
    hasLighting: boolean
    hasMotion: boolean
    hasAtmosphere: boolean
    hasComposition: boolean
    hasTechnicalTerms: boolean
    wordCount: number
    hasTimeSpecifiers: boolean
    hasColorDescriptors: boolean
    subjectComplexity: 'simple' | 'moderate' | 'complex'
  } {
    const lower = prompt.toLowerCase()

    return {
      hasCamera: this.hasTermsFromCategory(lower, 'camera'),
      hasLighting: this.hasTermsFromCategory(lower, 'lighting'),
      hasMotion: this.hasTermsFromCategory(lower, 'motion'),
      hasAtmosphere: this.hasTermsFromCategory(lower, 'atmosphere'),
      hasComposition: this.hasTermsFromCategory(lower, 'composition'),
      hasTechnicalTerms: /\d+mm|f\/\d|iso|fps|4k|8k|hdr/.test(lower),
      wordCount: prompt.split(/\s+/).length,
      hasTimeSpecifiers: /morning|afternoon|evening|night|sunset|sunrise|dawn|dusk/.test(lower),
      hasColorDescriptors: /red|blue|green|yellow|warm|cool|vibrant|muted|saturated/.test(lower),
      subjectComplexity: this.assessComplexity(prompt)
    }
  }

  /**
   * Apply cinematic language injection
   */
  private static applyCinematicEnhancement(
    prompt: string,
    level: 'minimal' | 'moderate' | 'maximum',
    analysis: any
  ): string {
    let enhanced = prompt
    const additions: string[] = []

    const intensity = { minimal: 1, moderate: 2, maximum: 3 }[level]

    // Add camera work if missing
    if (!analysis.hasCamera && intensity >= 1) {
      const cameraTerms = this.cinematicTechniques.find(t => t.category === 'camera')!.terms
      additions.push(this.selectRelevantTerm(cameraTerms, prompt))
    }

    // Add lighting if missing
    if (!analysis.hasLighting && intensity >= 2) {
      const lightingTerms = this.cinematicTechniques.find(t => t.category === 'lighting')!.terms
      additions.push(this.selectRelevantTerm(lightingTerms, prompt))
    }

    // Add composition if missing and high intensity
    if (!analysis.hasComposition && intensity >= 3) {
      const compositionTerms = this.cinematicTechniques.find(t => t.category === 'composition')!.terms
      additions.push(this.selectRelevantTerm(compositionTerms, prompt))
    }

    // Add atmosphere if missing
    if (!analysis.hasAtmosphere && intensity >= 2) {
      additions.push('cinematic')
    }

    if (additions.length > 0) {
      enhanced = `${enhanced}, ${additions.join(', ')}`
    }

    return enhanced
  }

  /**
   * Apply technical optimizations
   */
  private static applyTechnicalOptimization(prompt: string, analysis: any): string {
    let optimized = prompt

    // Add quality descriptors if missing
    if (!analysis.hasTechnicalTerms && analysis.subjectComplexity !== 'simple') {
      optimized += ', 4k quality, sharp focus, professional cinematography'
    }

    // Ensure proper punctuation
    optimized = optimized.trim().replace(/\s+/g, ' ')

    // Remove redundant commas
    optimized = optimized.replace(/,\s*,/g, ',')

    return optimized
  }

  /**
   * Apply style consistency
   */
  private static applyStyleConsistency(prompt: string, style: string): string {
    const styleMap: Record<string, string> = {
      cinematic: 'cinematic film look, shallow depth of field, anamorphic',
      documentary: 'documentary style, natural lighting, handheld camera',
      animation: 'animated style, vibrant colors, stylized',
      commercial: 'commercial production quality, studio lighting, professional',
      vintage: 'vintage film look, film grain, warm tones, retro aesthetic',
      futuristic: 'futuristic, sci-fi, sleek, high-tech, neon lighting',
      noir: 'film noir style, high contrast, dramatic shadows, black and white',
      dreamy: 'dreamy atmosphere, soft focus, ethereal lighting, pastel colors'
    }

    const styleDescriptor = styleMap[style.toLowerCase()] || style
    return `${prompt}, ${styleDescriptor}`
  }

  /**
   * Optimize prompt length
   */
  private static optimizeLength(
    prompt: string,
    target: 'short' | 'medium' | 'long'
  ): string {
    const wordCount = prompt.split(/\s+/).length
    const targetCounts = { short: 20, medium: 40, long: 70 }
    const targetCount = targetCounts[target]

    if (wordCount > targetCount * 1.5) {
      // Trim while preserving key information
      const sentences = prompt.split(/[.,;]/).filter(s => s.trim())
      const important = sentences.slice(0, Math.ceil(sentences.length * 0.7))
      return important.join(', ')
    }

    return prompt
  }

  /**
   * Add temporal coherence descriptors
   */
  private static addTemporalCoherence(prompt: string, analysis: any): string {
    if (!analysis.hasMotion) {
      return `${prompt}, smooth motion, consistent movement`
    }
    return prompt
  }

  /**
   * Calculate quality score (0-100)
   */
  private static calculateQualityScore(enhanced: string, analysis: any): number {
    let score = 50 // Base score

    // Add points for each category covered
    if (analysis.hasCamera) score += 10
    if (analysis.hasLighting) score += 10
    if (analysis.hasMotion) score += 10
    if (analysis.hasAtmosphere) score += 5
    if (analysis.hasComposition) score += 10
    if (analysis.hasTechnicalTerms) score += 5

    // Bonus for optimal length
    const wordCount = enhanced.split(/\s+/).length
    if (wordCount >= 15 && wordCount <= 50) score += 10

    return Math.min(100, score)
  }

  /**
   * Estimate success rate (0-100)
   */
  private static estimateSuccessRate(enhanced: string, analysis: any): number {
    let rate = 60 // Base rate

    // Increase based on completeness
    const categories = [
      analysis.hasCamera,
      analysis.hasLighting,
      analysis.hasMotion,
      analysis.hasAtmosphere
    ]
    const covered = categories.filter(Boolean).length
    rate += covered * 8

    // Penalize if too complex
    if (analysis.subjectComplexity === 'complex') rate -= 10
    if (analysis.wordCount > 80) rate -= 5

    return Math.min(95, Math.max(40, rate))
  }

  /**
   * Check for content safety
   */
  static checkSafeguards(prompt: string): SafeguardResult {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check for inappropriate content
    const inappropriateTerms = ['violence', 'gore', 'explicit', 'nsfw']
    inappropriateTerms.forEach(term => {
      if (prompt.toLowerCase().includes(term)) {
        issues.push(`Contains potentially inappropriate term: ${term}`)
        suggestions.push('Consider rephrasing to focus on artistic composition')
      }
    })

    // Check for impossible requests
    if (prompt.toLowerCase().includes('text') || prompt.toLowerCase().includes('words')) {
      issues.push('Sora-2 cannot reliably generate readable text')
      suggestions.push('Focus on visual storytelling instead of text generation')
    }

    return {
      safe: issues.length === 0,
      issues,
      suggestions
    }
  }

  /**
   * Helper methods
   */
  private static hasTermsFromCategory(prompt: string, category: string): boolean {
    const technique = this.cinematicTechniques.find(t => t.category === category)
    if (!technique) return false
    return technique.terms.some(term => prompt.includes(term))
  }

  private static selectRelevantTerm(terms: string[], context: string): string {
    // Simple selection - could be enhanced with ML
    const contextLower = context.toLowerCase()

    // Priority terms based on context
    if (contextLower.includes('person') || contextLower.includes('face')) {
      const preferred = terms.filter(t => t.includes('close') || t.includes('portrait'))
      if (preferred.length > 0) return preferred[0]
    }

    if (contextLower.includes('landscape') || contextLower.includes('city')) {
      const preferred = terms.filter(t => t.includes('wide') || t.includes('aerial'))
      if (preferred.length > 0) return preferred[0]
    }

    // Default: return random term
    return terms[Math.floor(Math.random() * terms.length)]
  }

  private static assessComplexity(prompt: string): 'simple' | 'moderate' | 'complex' {
    const elements = prompt.split(/,|and/).length
    const wordCount = prompt.split(/\s+/).length

    if (elements <= 2 && wordCount <= 15) return 'simple'
    if (elements <= 4 && wordCount <= 40) return 'moderate'
    return 'complex'
  }

  private static identifyImprovements(original: string, enhanced: string): string[] {
    const improvements: string[] = []

    const originalLower = original.toLowerCase()
    const enhancedLower = enhanced.toLowerCase()

    this.cinematicTechniques.forEach(technique => {
      const hadBefore = technique.terms.some(term => originalLower.includes(term))
      const hasNow = technique.terms.some(term => enhancedLower.includes(term))

      if (!hadBefore && hasNow) {
        improvements.push(`Added ${technique.category} techniques`)
      }
    })

    if (enhanced.length > original.length * 1.2) {
      improvements.push('Enhanced with professional cinematography terms')
    }

    return improvements
  }

  private static extractAppliedTechniques(enhanced: string): string[] {
    const applied: string[] = []
    const lowerEnhanced = enhanced.toLowerCase()

    this.cinematicTechniques.forEach(technique => {
      technique.terms.forEach(term => {
        if (lowerEnhanced.includes(term)) {
          applied.push(term)
        }
      })
    })

    return [...new Set(applied)]
  }
}
