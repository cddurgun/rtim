import { prisma } from '@/lib/prisma'
import { SoraAPI } from './sora-api'
import { VideoModel, VideoStatus, Prisma } from '@prisma/client'
import { CREDIT_COSTS } from '@/lib/constants'
import { InsufficientCreditsError, VideoGenerationError } from '@/lib/types'
import { extractAndGenerateTags } from '@/lib/hashtags'
import { notifyCreditLow } from '@/lib/notifications'
import fs from 'fs'
import path from 'path'

export class VideoService {
  /**
   * Calculate credit cost for video generation
   */
  static calculateCreditCost(params: {
    model: VideoModel
    size: string
    duration: number
  }): number {
    const { model, size, duration } = params

    // 1 credit per second base cost
    const baseCost = CREDIT_COSTS.BASE_COST_PER_SECOND * duration
    const modelMultiplier = CREDIT_COSTS.MODEL_MULTIPLIERS[model] || 1
    const resolutionMultiplier = CREDIT_COSTS.RESOLUTION_MULTIPLIERS[size as keyof typeof CREDIT_COSTS.RESOLUTION_MULTIPLIERS] || 1

    return Math.ceil(baseCost * modelMultiplier * resolutionMultiplier)
  }

  /**
   * Create a video record in the database (without Sora API call)
   * Used when Sora job is created separately
   */
  static async createVideo(params: {
    userId: string
    soraJobId: string
    originalPrompt: string
    enhancedPrompt?: string
    model: VideoModel
    size: string
    duration: number
    creditsCost: number
    workspaceId?: string
    remixedFrom?: string
  }) {
    // Extract and generate tags from prompt
    const tags = extractAndGenerateTags(params.originalPrompt)

    const video = await prisma.video.create({
      data: {
        userId: params.userId,
        soraJobId: params.soraJobId,
        originalPrompt: params.originalPrompt,
        enhancedPrompt: params.enhancedPrompt || params.originalPrompt,
        model: params.model,
        size: params.size,
        duration: params.duration,
        creditsCost: params.creditsCost,
        status: VideoStatus.QUEUED,
        workspaceId: params.workspaceId,
        remixedFrom: params.remixedFrom,
        tags,
      },
    })

    return video
  }

  /**
   * Create a video generation job
   */
  static async createVideoJob(params: {
    userId: string
    prompt: string
    enhancedPrompt?: string
    model: VideoModel
    size: string
    duration: number
    workspaceId?: string
    remixVideoId?: string
    inputReference?: Buffer
  }) {
    const {
      userId,
      prompt,
      enhancedPrompt,
      model,
      size,
      duration,
      workspaceId,
      remixVideoId,
      inputReference,
    } = params

    // Calculate cost
    const creditsCost = this.calculateCreditCost({ model, size, duration })

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, openaiApiKey: true },
    })

    if (!user || user.credits < creditsCost) {
      throw new InsufficientCreditsError(creditsCost, user?.credits || 0)
    }

    // Deduct credits and create video record in a transaction
    const video = await prisma.$transaction(async (tx) => {
      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: creditsCost } },
        select: { credits: true },
      })

      const remainingCredits = updatedUser.credits

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'GENERATION',
          amount: -creditsCost,
          balanceAfter: remainingCredits,
          description: `Video generation - ${model} ${size} ${duration}s`,
        },
      })

      // Extract and generate tags from prompt
      const tags = extractAndGenerateTags(prompt)

      // Create video record
      const createdVideo = await tx.video.create({
        data: {
          userId,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt || prompt,
          model,
          size,
          duration,
          creditsCost,
          status: VideoStatus.QUEUED,
          workspaceId,
          remixedFrom: remixVideoId,
          tags,
        },
      })

      // Check for low credits after this transaction
      // Send notification if credits fall below threshold (50)
      if (remainingCredits < 50 && remainingCredits >= 0) {
        // Use setTimeout to not block the transaction
        setTimeout(async () => {
          try {
            await notifyCreditLow(userId, remainingCredits)
          } catch (error) {
            console.error('Failed to send low credit notification:', error)
          }
        }, 0)
      }

      return createdVideo
    })

    // Submit to Sora API
    try {
      const soraModel = model === VideoModel.SORA_2 ? 'sora-2' : 'sora-2-pro'

      let soraJob
      if (remixVideoId) {
        // Get the original video's Sora job ID
        const originalVideo = await prisma.video.findUnique({
          where: { id: remixVideoId },
          select: { soraJobId: true },
        })

        if (!originalVideo?.soraJobId) {
          throw new Error('Original video not found or has no Sora job ID')
        }

        soraJob = await SoraAPI.remixVideo(originalVideo.soraJobId, enhancedPrompt || prompt, user.openaiApiKey || '')
      } else {
        soraJob = await SoraAPI.createVideo({
          prompt: enhancedPrompt || prompt,
          model: soraModel,
          size,
          seconds: duration,
          inputReference,
          apiKey: user.openaiApiKey || '',
        })
      }

      // Update video with Sora job ID
      await prisma.video.update({
        where: { id: video.id },
        data: {
          soraJobId: soraJob.id,
          status: soraJob.status === 'queued' ? VideoStatus.QUEUED : VideoStatus.IN_PROGRESS,
        },
      })

      return { ...video, soraJobId: soraJob.id }
    } catch (error) {
      // If Sora API call fails, refund credits and mark video as failed
      await prisma.$transaction(async (tx) => {
        // Refund credits
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: creditsCost } },
        })

        // Create refund transaction
        await tx.transaction.create({
          data: {
            userId,
            type: 'REFUND',
            amount: creditsCost,
            balanceAfter: user.credits,
            description: 'Refund - Video generation failed',
            videoId: video.id,
          },
        })

        // Update video status
        await tx.video.update({
          where: { id: video.id },
          data: {
            status: VideoStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      })

      throw new VideoGenerationError(
        error instanceof Error ? error.message : 'Failed to create video',
        undefined
      )
    }
  }

  /**
   * Update video status from Sora webhook or polling
   */
  static async updateVideoStatus(videoId: string, soraJobId: string) {
    try {
      // Get user's API key
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { userId: true },
      })

      if (!video) {
        throw new Error('Video not found')
      }

      const user = await prisma.user.findUnique({
        where: { id: video.userId },
        select: { openaiApiKey: true },
      })

      const status = await SoraAPI.getVideoStatus(soraJobId, user?.openaiApiKey || '')

      const updateData: Prisma.VideoUpdateInput = {
        status: this.mapSoraStatus(status.status),
        progress: status.progress || 0,
      }

      if (status.status === 'completed') {
        updateData.completedAt = new Date()

        // Download and store video locally
        try {
          const videoBuffer = await SoraAPI.downloadVideo(soraJobId, user?.openaiApiKey || '', 'video')
          const videoPath = path.join(process.cwd(), 'public', 'videos', `${videoId}.mp4`)
          fs.writeFileSync(videoPath, videoBuffer)

          updateData.videoUrl = `/videos/${videoId}.mp4`

          // Try to download thumbnail (optional, may fail)
          try {
            const thumbnailBuffer = await SoraAPI.downloadVideo(soraJobId, user?.openaiApiKey || '', 'thumbnail')
            const thumbPath = path.join(process.cwd(), 'public', 'videos', `${videoId}-thumb.webp`)
            fs.writeFileSync(thumbPath, thumbnailBuffer)
            updateData.thumbnailUrl = `/videos/${videoId}-thumb.webp`
          } catch (thumbError) {
            const error = thumbError as Error
            console.log('Thumbnail download failed (optional):', error.message)
          }
        } catch (downloadError) {
          console.error('Failed to download and save video:', downloadError)
          // Mark as failed if download fails
          updateData.status = this.mapSoraStatus('failed')
          updateData.errorMessage = 'Failed to download completed video'
        }
      }

      if (status.status === 'failed') {
        updateData.errorMessage = typeof status.error === 'string'
          ? status.error
          : status.error?.message || 'Generation failed'

        // Refund credits on failure
        const video = await prisma.video.findUnique({
          where: { id: videoId },
          select: { userId: true, creditsCost: true },
        })

        if (video) {
          await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
              where: { id: video.userId },
              data: { credits: { increment: video.creditsCost } },
            })

            await tx.transaction.create({
              data: {
                userId: video.userId,
                type: 'REFUND',
                amount: video.creditsCost,
                balanceAfter: user.credits,
                description: 'Automatic refund - Generation failed',
                videoId,
              },
            })
          })
        }
      }

      return await prisma.video.update({
        where: { id: videoId },
        data: updateData,
      })
    } catch (error) {
      console.error('Error updating video status:', error)
      throw error
    }
  }

  /**
   * Map Sora status to our VideoStatus enum
   */
  private static mapSoraStatus(soraStatus: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'queued': VideoStatus.QUEUED,
      'in_progress': VideoStatus.IN_PROGRESS,
      'processing': VideoStatus.IN_PROGRESS,
      'completed': VideoStatus.COMPLETED,
      'failed': VideoStatus.FAILED,
    }

    return statusMap[soraStatus] || VideoStatus.IN_PROGRESS
  }

  /**
   * Map Sora API status (lowercase) to Prisma VideoStatus enum (uppercase)
   */
  private static mapSoraStatusToEnum(soraStatus: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'queued': VideoStatus.QUEUED,
      'in_progress': VideoStatus.IN_PROGRESS,
      'processing': VideoStatus.IN_PROGRESS,
      'completed': VideoStatus.COMPLETED,
      'failed': VideoStatus.FAILED,
      'error': VideoStatus.FAILED,
    }

    return statusMap[soraStatus.toLowerCase()] || VideoStatus.QUEUED
  }

  /**
   * Update video status by Sora job ID (simplified version for polling)
   */
  static async updateVideoStatusSimple(params: {
    soraJobId: string
    status: VideoStatus | string  // Accept both enum and string
    videoUrl?: string
    progress?: number
    errorMessage?: string
  }) {
    const { soraJobId, videoUrl, progress, errorMessage } = params

    // Map the status to proper enum value
    const mappedStatus = typeof params.status === 'string'
      ? this.mapSoraStatusToEnum(params.status)
      : params.status

    const updateData: Prisma.VideoUpdateManyMutationInput = {
      status: mappedStatus,
      progress: progress ?? undefined,
    }

    if (videoUrl) {
      updateData.videoUrl = videoUrl
    }

    if (mappedStatus === VideoStatus.COMPLETED && videoUrl) {
      updateData.completedAt = new Date()
    }

    if (mappedStatus === VideoStatus.FAILED && errorMessage) {
      updateData.errorMessage = errorMessage
    }

    const video = await prisma.video.updateMany({
      where: { soraJobId },
      data: updateData,
    })

    return video
  }

  /**
   * Get user's videos with pagination
   */
  static async getUserVideos(params: {
    userId: string
    page?: number
    limit?: number
    status?: VideoStatus
  }) {
    const { userId, page = 1, limit = 20, status } = params

    const where = {
      userId,
      ...(status && { status }),
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.video.count({ where }),
    ])

    return {
      data: videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Delete a video
   */
  static async deleteVideo(videoId: string, userId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      throw new Error('Video not found')
    }

    if (video.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Delete from Sora if it exists
    if (video.soraJobId) {
      try {
        // Get user's API key
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { openaiApiKey: true },
        })

        await SoraAPI.deleteVideo(video.soraJobId, user?.openaiApiKey || '')
      } catch (error) {
        console.error('Error deleting from Sora:', error)
        // Continue with database deletion even if Sora deletion fails
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: videoId },
    })
  }
}
