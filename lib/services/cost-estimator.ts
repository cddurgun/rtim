/**
 * Smart Credit System and Cost Optimization
 * Provides cost estimation and optimization suggestions
 */

export interface CostEstimate {
  estimatedCost: number
  breakdown: {
    modelCost: number
    sizeCost: number
    durationCost: number
  }
  alternatives: Alternative[]
  optimizationTips: string[]
  costEfficiencyScore: number
}

export interface Alternative {
  model: string
  size: string
  duration: number
  estimatedCost: number
  qualityImpact: 'minimal' | 'moderate' | 'significant'
  savings: number
  savingsPercentage: number
}

export interface ModelSuggestion {
  recommendedModel: 'SORA_2' | 'SORA_2_PRO'
  reason: string
  confidence: number
  alternatives: {
    model: 'SORA_2' | 'SORA_2_PRO'
    pros: string[]
    cons: string[]
    costDifference: number
  }[]
}

export class CostEstimator {
  // Base costs per second (in credits) - 1 credit per second for 720p
  private static readonly BASE_COSTS = {
    SORA_2: {
      '480p': 0.5,  // 0.5 credits per second for 480p
      '720p': 1.0,  // 1 credit per second for 720p (base)
      '1080p': 1.5, // 1.5 credits per second for 1080p
    },
    SORA_2_PRO: {
      '480p': 1.25,  // 2.5x multiplier
      '720p': 2.5,   // 2.5x multiplier
      '1080p': 3.75, // 2.5x multiplier
    },
  }

  // Dynamic pricing multipliers based on time of day and load
  private static getPricingMultiplier(hour: number, queueLength: number): number {
    let multiplier = 1.0

    // Peak hours (9 AM - 9 PM) have higher pricing
    if (hour >= 9 && hour <= 21) {
      multiplier += 0.2
    }

    // Queue length impact
    if (queueLength > 100) {
      multiplier += 0.3
    } else if (queueLength > 50) {
      multiplier += 0.15
    }

    // Weekend discount
    const day = new Date().getDay()
    if (day === 0 || day === 6) {
      multiplier -= 0.1
    }

    return Math.max(0.7, Math.min(1.5, multiplier))
  }

  /**
   * Calculate base cost without alternatives (used internally to prevent recursion)
   */
  private static calculateBaseCost(params: {
    model: 'SORA_2' | 'SORA_2_PRO'
    size: string
    duration: number
  }): number {
    const { model, size, duration } = params

    // Get base cost per second
    const resolution = this.normalizeSize(size)
    const baseCostPerSecond = this.BASE_COSTS[model][resolution] || this.BASE_COSTS[model]['1080p']

    // Apply dynamic pricing
    const hour = new Date().getHours()
    const queueLength = 0 // TODO: Get from Redis/queue system
    const multiplier = this.getPricingMultiplier(hour, queueLength)

    // Calculate cost
    const modelCost = baseCostPerSecond * duration * multiplier
    return Math.ceil(modelCost)
  }

  /**
   * Estimate cost for video generation
   */
  static estimateCost(params: {
    model: 'SORA_2' | 'SORA_2_PRO'
    size: string
    duration: number
    prompt: string
  }): CostEstimate {
    const { model, size, duration, prompt } = params

    // Get base cost per second
    const resolution = this.normalizeSize(size)
    const baseCostPerSecond = this.BASE_COSTS[model][resolution] || this.BASE_COSTS[model]['1080p']

    // Apply dynamic pricing
    const hour = new Date().getHours()
    const queueLength = 0 // TODO: Get from Redis/queue system
    const multiplier = this.getPricingMultiplier(hour, queueLength)

    // Calculate costs
    const modelCost = baseCostPerSecond * duration * multiplier
    const sizeCost = 0 // Included in base cost
    const durationCost = 0 // Included in base cost
    const estimatedCost = Math.ceil(modelCost)

    // Generate alternatives using helper method (no recursion)
    const alternatives = this.generateAlternatives(params, estimatedCost)

    // Generate optimization tips
    const optimizationTips = this.generateOptimizationTips(params, multiplier)

    // Calculate cost efficiency score
    const costEfficiencyScore = this.calculateEfficiencyScore(params, estimatedCost)

    return {
      estimatedCost,
      breakdown: {
        modelCost,
        sizeCost,
        durationCost,
      },
      alternatives,
      optimizationTips,
      costEfficiencyScore,
    }
  }

  /**
   * Suggest optimal model based on prompt
   */
  static suggestModel(prompt: string, budget?: number): ModelSuggestion {
    const promptComplexity = this.analyzePromptComplexity(prompt)
    const wordCount = prompt.split(/\s+/).length

    let recommendedModel: 'SORA_2' | 'SORA_2_PRO'
    let reason: string
    let confidence: number

    if (promptComplexity === 'complex' || wordCount > 40) {
      recommendedModel = 'SORA_2_PRO'
      reason = 'Your prompt has high complexity and requires advanced capabilities'
      confidence = 85
    } else if (promptComplexity === 'simple' && wordCount < 15) {
      recommendedModel = 'SORA_2'
      reason = 'Your prompt is straightforward - Standard model will work great'
      confidence = 90
    } else {
      // Check budget
      if (budget && budget < 200) {
        recommendedModel = 'SORA_2'
        reason = 'Based on your budget, Standard model offers best value'
        confidence = 75
      } else {
        recommendedModel = 'SORA_2_PRO'
        reason = 'Pro model recommended for optimal quality with this prompt'
        confidence = 80
      }
    }

    return {
      recommendedModel,
      reason,
      confidence,
      alternatives: [
        {
          model: recommendedModel === 'SORA_2' ? 'SORA_2_PRO' : 'SORA_2',
          pros:
            recommendedModel === 'SORA_2'
              ? [
                  'Superior quality and detail',
                  'Better handling of complex scenes',
                  'More accurate motion rendering',
                ]
              : [
                  'Lower cost (50% savings)',
                  'Faster generation time',
                  'Good for simpler scenes',
                ],
          cons:
            recommendedModel === 'SORA_2'
              ? ['2x higher cost', 'Slightly longer generation time']
              : ['May lack detail in complex scenes', 'Less sophisticated lighting'],
          costDifference:
            recommendedModel === 'SORA_2' ? 100 : -100,
        },
      ],
    }
  }

  /**
   * Calculate batch discount
   */
  static calculateBatchDiscount(videoCount: number): {
    discount: number
    discountPercentage: number
    savings: number
  } {
    let discountPercentage = 0

    if (videoCount >= 10) {
      discountPercentage = 20
    } else if (videoCount >= 5) {
      discountPercentage = 10
    } else if (videoCount >= 3) {
      discountPercentage = 5
    }

    return {
      discount: discountPercentage / 100,
      discountPercentage,
      savings: 0, // Calculate based on total cost
    }
  }

  /**
   * Helper methods
   */
  private static normalizeSize(size: string): '480p' | '720p' | '1080p' {
    if (size.includes('1920') || size === '1080p') return '1080p'
    if (size.includes('1280') || size === '720p') return '720p'
    return '480p'
  }

  private static analyzePromptComplexity(prompt: string): 'simple' | 'moderate' | 'complex' {
    const elements = prompt.split(/,|and/).length
    const wordCount = prompt.split(/\s+/).length
    const hasMultipleSubjects = elements > 3
    const hasCinematicTerms = /camera|shot|angle|lighting|focus/.test(prompt.toLowerCase())

    if (hasMultipleSubjects || wordCount > 50) return 'complex'
    if (hasCinematicTerms && wordCount > 20) return 'moderate'
    return 'simple'
  }

  private static generateAlternatives(
    params: {
      model: 'SORA_2' | 'SORA_2_PRO'
      size: string
      duration: number
      prompt: string
    },
    currentCost: number
  ): Alternative[] {
    const alternatives: Alternative[] = []

    // Alternative 1: Different model
    const altModel = params.model === 'SORA_2' ? 'SORA_2_PRO' : 'SORA_2'
    const altModelCost = this.calculateBaseCost({ ...params, model: altModel })
    alternatives.push({
      model: altModel,
      size: params.size,
      duration: params.duration,
      estimatedCost: altModelCost,
      qualityImpact: params.model === 'SORA_2' ? 'moderate' : 'minimal',
      savings: currentCost - altModelCost,
      savingsPercentage: Math.round(
        ((currentCost - altModelCost) / currentCost) * 100
      ),
    })

    // Alternative 2: Shorter duration
    if (params.duration > 3) {
      const shorterDuration = Math.ceil(params.duration * 0.7)
      const shorterCost = this.calculateBaseCost({ ...params, duration: shorterDuration })
      alternatives.push({
        model: params.model,
        size: params.size,
        duration: shorterDuration,
        estimatedCost: shorterCost,
        qualityImpact: 'minimal',
        savings: currentCost - shorterCost,
        savingsPercentage: Math.round(
          ((currentCost - shorterCost) / currentCost) * 100
        ),
      })
    }

    // Alternative 3: Lower resolution
    if (params.size.includes('1920') || params.size === '1080p') {
      const lowerResCost = this.calculateBaseCost({ ...params, size: '1280x720' })
      alternatives.push({
        model: params.model,
        size: '1280x720',
        duration: params.duration,
        estimatedCost: lowerResCost,
        qualityImpact: 'moderate',
        savings: currentCost - lowerResCost,
        savingsPercentage: Math.round(
          ((currentCost - lowerResCost) / currentCost) * 100
        ),
      })
    }

    return alternatives.filter(alt => alt.savings > 0)
  }

  private static generateOptimizationTips(
    params: {
      model: string
      size: string
      duration: number
      prompt: string
    },
    multiplier: number
  ): string[] {
    const tips: string[] = []

    if (multiplier > 1.1) {
      tips.push('⏰ Generation costs are higher during peak hours. Consider generating later for 20% savings.')
    }

    if (params.duration > 5) {
      tips.push('⏱️ Shorter videos (3-5s) cost less while still being effective for most use cases.')
    }

    if (params.size.includes('1920') && params.prompt.split(/\s+/).length < 20) {
      tips.push('📐 Your simple prompt may not benefit from 1080p - try 720p for 25% savings.')
    }

    if (params.model === 'SORA_2_PRO') {
      const complexity = this.analyzePromptComplexity(params.prompt)
      if (complexity === 'simple') {
        tips.push('💡 Standard model (SORA_2) can handle this prompt well and costs 50% less.')
      }
    }

    const day = new Date().getDay()
    if (day >= 1 && day <= 5) {
      tips.push('📅 Weekend generations get 10% discount automatically!')
    }

    return tips
  }

  private static calculateEfficiencyScore(
    params: {
      model: string
      size: string
      duration: number
      prompt: string
    },
    cost: number
  ): number {
    let score = 50 // Base score

    const complexity = this.analyzePromptComplexity(params.prompt)

    // Model selection efficiency
    if (params.model === 'SORA_2_PRO' && complexity === 'complex') {
      score += 20
    } else if (params.model === 'SORA_2' && complexity === 'simple') {
      score += 20
    } else if (params.model === 'SORA_2_PRO' && complexity === 'simple') {
      score -= 10 // Overspending
    }

    // Duration efficiency
    if (params.duration >= 3 && params.duration <= 5) {
      score += 15 // Optimal duration
    } else if (params.duration > 8) {
      score -= 10 // May be too long
    }

    // Cost efficiency
    if (cost < 150) {
      score += 15
    } else if (cost > 300) {
      score -= 5
    }

    return Math.min(100, Math.max(0, score))
  }
}
