import { SoraJobResponse } from '@/lib/types'

export class SoraAPI {
  /**
   * Create a new video generation job
   */
  static async createVideo(params: {
    prompt: string
    model: 'sora-2' | 'sora-2-pro'
    size: string
    seconds: number
    inputReference?: Buffer
    apiKey: string  // User's OpenAI API key
  }): Promise<SoraJobResponse> {
    try {
      const formData = new FormData()
      formData.append('prompt', params.prompt)
      formData.append('model', params.model)
      formData.append('size', params.size)
      formData.append('seconds', params.seconds.toString())

      if (params.inputReference) {
        const blob = new Blob([params.inputReference.buffer])
        formData.append('input_reference', blob, 'image.jpg')
      }

      const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Sora API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      return data as SoraJobResponse
    } catch (error) {
      console.error('Error creating Sora video:', error)
      throw error
    }
  }

  /**
   * Get the status of a video generation job
   */
  static async getVideoStatus(videoId: string, apiKey: string): Promise<SoraJobResponse> {
    try {
      const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Sora API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting Sora video status:', error)
      throw error
    }
  }

  /**
   * Download video content
   */
  static async downloadVideo(videoId: string, apiKey: string, variant: 'video' | 'thumbnail' | 'spritesheet' = 'video'): Promise<Buffer> {
    try {
      const url = variant === 'video'
        ? `https://api.openai.com/v1/videos/${videoId}/content`
        : `https://api.openai.com/v1/videos/${videoId}/content?variant=${variant}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(`Sora API error: ${error.error?.message || 'Failed to download video'}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error downloading Sora video:', error)
      throw error
    }
  }

  /**
   * Remix an existing video
   */
  static async remixVideo(videoId: string, prompt: string, apiKey: string): Promise<SoraJobResponse> {
    try {
      const response = await fetch(`https://api.openai.com/v1/videos/${videoId}/remix`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Sora API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error remixing Sora video:', error)
      throw error
    }
  }

  /**
   * Delete a video
   */
  static async deleteVideo(videoId: string, apiKey: string): Promise<void> {
    try {
      const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Sora API error: ${error.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting Sora video:', error)
      throw error
    }
  }

  /**
   * Poll for video completion
   */
  static async pollVideoCompletion(
    videoId: string,
    apiKey: string,
    options: {
      maxAttempts?: number
      intervalMs?: number
      onProgress?: (progress: number) => void
    } = {}
  ): Promise<SoraJobResponse> {
    const { maxAttempts = 60, intervalMs = 5000, onProgress } = options

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getVideoStatus(videoId, apiKey)

      if (onProgress && status.progress) {
        onProgress(status.progress)
      }

      if (status.status === 'completed') {
        return status
      }

      if (status.status === 'failed') {
        const errorMessage = typeof status.error === 'string'
          ? status.error
          : status.error?.message || 'Video generation failed'
        throw new Error(errorMessage)
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error('Video generation timeout')
  }
}
