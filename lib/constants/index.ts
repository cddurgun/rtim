import { VideoModel } from '@prisma/client'

// Credit pricing configuration
// 1 second = 1 credit = $0.30 (flat rate, no multipliers)
export const CREDIT_COSTS = {
  BASE_COST_PER_SECOND: 1, // 1 credit per second = $0.30 USD
  COST_PER_CREDIT_USD: 0.30, // $0.30 per credit
  MODEL_MULTIPLIERS: {
    SORA_2: 1.0,      // No multiplier - flat rate
    SORA_2_PRO: 1.0,  // No multiplier - flat rate
  },
  RESOLUTION_MULTIPLIERS: {
    '480x480': 1.0,
    '640x480': 1.0,
    '1280x720': 1.0,
    '1920x1080': 1.0,
  },
}

// Tier configuration
export const TIER_LIMITS = {
  BASIC: {
    concurrentJobs: 2,
    maxCreditsPerPurchase: 1000,
    features: ['basic_generation', 'prompt_enhancement'],
  },
  PRO: {
    concurrentJobs: 10,
    maxCreditsPerPurchase: 5000,
    features: ['basic_generation', 'prompt_enhancement', 'style_profiles', 'priority_queue', 'advanced_analytics'],
  },
  ENTERPRISE: {
    concurrentJobs: 999,
    maxCreditsPerPurchase: 999999,
    features: ['basic_generation', 'prompt_enhancement', 'style_profiles', 'priority_queue', 'advanced_analytics', 'api_access', 'collaboration', 'white_label'],
  },
}

// Video generation limits
// All videos are 10 seconds only
export const VIDEO_LIMITS = {
  MIN_DURATION: 10,
  MAX_DURATION: 10,
  MAX_PROMPT_LENGTH: 5000,
  SUPPORTED_RESOLUTIONS: ['480x480', '640x480', '1280x720', '1920x1080'],
  SUPPORTED_MODELS: ['sora-2', 'sora-2-pro'] as const,
  SUPPORTED_DURATIONS: [10], // Only 10 seconds supported
}

// Rate limiting
export const RATE_LIMITS = {
  VIDEO_GENERATION: {
    PER_MINUTE: 5,
    PER_HOUR: 50,
    PER_DAY: 200,
  },
  API_REQUESTS: {
    PER_MINUTE: 60,
    PER_HOUR: 1000,
  },
}

// Prompt enhancement templates
export const CINEMATIC_TERMS = {
  SHOT_TYPES: [
    'wide shot',
    'medium shot',
    'close-up',
    'extreme close-up',
    'establishing shot',
    'over-the-shoulder shot',
    'tracking shot',
  ],
  CAMERA_MOVEMENTS: [
    'static camera',
    'slow dolly in',
    'slow dolly out',
    'tracking shot',
    'pan left',
    'pan right',
    'tilt up',
    'tilt down',
    'handheld camera',
    'steadicam',
    'crane shot',
    'aerial shot',
  ],
  LIGHTING_STYLES: [
    'natural lighting',
    'golden hour sunlight',
    'hard lighting',
    'soft diffused lighting',
    'rim lighting',
    'backlighting',
    'dramatic shadows',
    'high contrast',
    'low key lighting',
    'high key lighting',
  ],
  DEPTH_OF_FIELD: [
    'shallow depth of field',
    'deep focus',
    'bokeh background',
    'sharp foreground and background',
  ],
}

// Style templates
export interface StyleTemplate {
  name: string
  description: string
  settings: {
    cinematicStyle: string
    promptAdditions: string[]
  }
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    name: 'Cinematic Film',
    description: 'High-end cinematic look with professional camera work',
    settings: {
      cinematicStyle: 'cinematic',
      promptAdditions: [
        'cinematic composition',
        'film grain',
        'anamorphic lens',
        'shallow depth of field',
        'dramatic lighting',
      ],
    },
  },
  {
    name: 'Documentary',
    description: 'Natural, realistic documentary style',
    settings: {
      cinematicStyle: 'documentary',
      promptAdditions: [
        'natural lighting',
        'handheld camera',
        'realistic colors',
        'observational style',
      ],
    },
  },
  {
    name: 'Commercial/Product',
    description: 'Clean, polished commercial look',
    settings: {
      cinematicStyle: 'commercial',
      promptAdditions: [
        'studio lighting',
        'pristine quality',
        'perfect composition',
        'slow motion',
        'macro detail',
      ],
    },
  },
  {
    name: 'Animation',
    description: 'Animated or stylized visual aesthetic',
    settings: {
      cinematicStyle: 'animation',
      promptAdditions: [
        '3D rendered',
        'vibrant colors',
        'stylized',
        'smooth animation',
      ],
    },
  },
  {
    name: 'Music Video',
    description: 'Dynamic, energetic music video style',
    settings: {
      cinematicStyle: 'music_video',
      promptAdditions: [
        'dynamic movement',
        'creative transitions',
        'bold colors',
        'rhythmic editing',
      ],
    },
  },
]

// Success messages
export const MESSAGES = {
  VIDEO_GENERATION_STARTED: 'Video generation started successfully',
  VIDEO_GENERATION_COMPLETED: 'Your video is ready!',
  VIDEO_GENERATION_FAILED: 'Video generation failed. Please try again.',
  CREDITS_PURCHASED: 'Credits purchased successfully',
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please purchase more.',
}

// API endpoints
export const API_ROUTES = {
  VIDEOS: {
    CREATE: '/api/videos/generate',
    LIST: '/api/videos',
    GET: (id: string) => `/api/videos/${id}`,
    DELETE: (id: string) => `/api/videos/${id}`,
    DOWNLOAD: (id: string) => `/api/videos/${id}/download`,
    REMIX: (id: string) => `/api/videos/${id}/remix`,
  },
  CREDITS: {
    BALANCE: '/api/credits/balance',
    PURCHASE: '/api/credits/purchase',
    HISTORY: '/api/credits/history',
  },
  PROMPT: {
    ENHANCE: '/api/prompt/enhance',
    ESTIMATE: '/api/prompt/estimate',
  },
}

// Default values
export const DEFAULTS = {
  STARTER_CREDITS: 0, // No starter credits - users must purchase
  VIDEO_MODEL: VideoModel.SORA_2,
  VIDEO_RESOLUTION: '1280x720',
  VIDEO_DURATION: 10, // All videos are 10 seconds
}
