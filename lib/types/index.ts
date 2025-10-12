import { Video, VideoStatus, VideoModel, TransactionType } from '@prisma/client'

// Video generation types
export interface VideoGenerationRequest {
  prompt: string
  model: VideoModel
  size: string
  seconds: number
  inputReference?: File
  remixVideoId?: string
  workspaceId?: string
}

export interface VideoGenerationResponse {
  id: string
  soraJobId: string
  status: VideoStatus
  progress: number
}

export interface EnhancedPrompt {
  original: string
  enhanced: string
  improvements: string[]
  qualityScore: number
  estimatedCost: number
}

// OpenAI Sora API types
export interface SoraCreateJobRequest {
  model: 'sora-2' | 'sora-2-pro'
  prompt: string
  size: string
  seconds: string
  input_reference?: Buffer | Blob
}

export interface SoraJobResponse {
  id: string
  object: 'video'
  created_at: number
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  model: string
  prompt?: string
  progress?: number
  seconds: string
  size: string
  download_url?: string
  error?: string | {
    message: string
    type: string
  }
}

// Credit system types
export interface CreditTransaction {
  type: TransactionType
  amount: number
  description: string
  videoId?: string
  metadata?: Record<string, unknown>
}

export interface CreditEstimate {
  estimatedCredits: number
  baseCost: number
  modelMultiplier: number
  resolutionMultiplier: number
  durationMultiplier: number
  dynamicPricing: number
}

// Style profile types
export interface StyleSettings {
  cinematicStyle?: 'documentary' | 'cinematic' | 'commercial' | 'animation'
  cameraMovement?: 'static' | 'tracking' | 'dolly' | 'pan' | 'aerial'
  lighting?: 'natural' | 'golden_hour' | 'hard_light' | 'soft_diffusion'
  colorGrading?: 'neutral' | 'warm' | 'cool' | 'vibrant' | 'desaturated'
  shotType?: 'wide' | 'medium' | 'close_up' | 'extreme_close_up'
  customPromptAdditions?: string[]
}

// Analytics types
export interface VideoAnalytics {
  totalVideos: number
  successRate: number
  totalCreditsSpent: number
  avgGenerationTime: number
  avgQualityScore: number
  mostUsedModel: VideoModel
  mostUsedResolution: string
}

export interface PromptPerformance {
  prompt: string
  successRate: number
  avgCost: number
  avgQuality: number
  timesUsed: number
  lastUsed: Date
}

// Webhook types
export interface WebhookEvent {
  id: string
  object: 'event'
  created_at: number
  type: 'video.completed' | 'video.failed'
  data: {
    id: string
  }
}

// Error types
export class InsufficientCreditsError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient credits. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientCreditsError'
  }
}

export class VideoGenerationError extends Error {
  constructor(message: string, public readonly soraJobId?: string) {
    super(message)
    this.name = 'VideoGenerationError'
  }
}

// Utility types
export type VideoWithUser = Video & {
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'performanceScore'
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
