import { prisma } from '@/lib/prisma'
import { NotificationType, Prisma } from '@prisma/client'

interface CreateNotificationParams {
  userId: string // Recipient of the notification
  type: NotificationType
  title: string
  message: string
  actorId?: string // User who triggered the notification
  videoId?: string
  commentId?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Don't notify users about their own actions
    if (params.actorId === params.userId) {
      return null
    }

    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actorId: params.actorId,
        videoId: params.videoId,
        commentId: params.commentId,
        actionUrl: params.actionUrl,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    })

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Helper functions for common notification types

export async function notifyVideoLike(
  videoOwnerId: string,
  likerName: string,
  likerId: string,
  videoId: string,
  videoPrompt: string
) {
  return createNotification({
    userId: videoOwnerId,
    type: 'LIKE',
    title: 'New like on your video',
    message: `${likerName} liked your video "${videoPrompt.substring(0, 50)}${videoPrompt.length > 50 ? '...' : ''}"`,
    actorId: likerId,
    videoId,
    actionUrl: `/videos/${videoId}`,
  })
}

export async function notifyVideoComment(
  videoOwnerId: string,
  commenterName: string,
  commenterId: string,
  videoId: string,
  videoPrompt: string,
  commentId: string,
  commentPreview: string
) {
  return createNotification({
    userId: videoOwnerId,
    type: 'COMMENT',
    title: 'New comment on your video',
    message: `${commenterName} commented: "${commentPreview.substring(0, 100)}${commentPreview.length > 100 ? '...' : ''}"`,
    actorId: commenterId,
    videoId,
    commentId,
    actionUrl: `/videos/${videoId}`,
  })
}

export async function notifyCommentReply(
  commentOwnerId: string,
  replierName: string,
  replierId: string,
  videoId: string,
  commentId: string,
  replyPreview: string
) {
  return createNotification({
    userId: commentOwnerId,
    type: 'REPLY',
    title: 'New reply to your comment',
    message: `${replierName} replied: "${replyPreview.substring(0, 100)}${replyPreview.length > 100 ? '...' : ''}"`,
    actorId: replierId,
    videoId,
    commentId,
    actionUrl: `/videos/${videoId}`,
  })
}

export async function notifyUserFollow(
  followedUserId: string,
  followerName: string,
  followerId: string
) {
  return createNotification({
    userId: followedUserId,
    type: 'FOLLOW',
    title: 'New follower',
    message: `${followerName} started following you`,
    actorId: followerId,
    actionUrl: `/profile/${followerId}`,
  })
}

export async function notifyVideoReady(
  userId: string,
  videoId: string,
  videoPrompt: string
) {
  return createNotification({
    userId,
    type: 'VIDEO_READY',
    title: 'Your video is ready',
    message: `Your video "${videoPrompt.substring(0, 50)}${videoPrompt.length > 50 ? '...' : ''}" has finished generating`,
    videoId,
    actionUrl: `/videos/${videoId}`,
  })
}

export async function notifyCreditLow(userId: string, creditsRemaining: number) {
  return createNotification({
    userId,
    type: 'CREDIT_LOW',
    title: 'Credits running low',
    message: `You have ${creditsRemaining} credits remaining. Consider purchasing more to continue creating videos.`,
    actionUrl: '/billing',
  })
}

export async function notifyMention(
  mentionedUserId: string,
  mentionerName: string,
  mentionerId: string,
  videoId?: string,
  commentId?: string,
  context: string = ''
) {
  return createNotification({
    userId: mentionedUserId,
    type: 'MENTION',
    title: 'You were mentioned',
    message: `${mentionerName} mentioned you${context ? ': ' + context.substring(0, 100) : ''}`,
    actorId: mentionerId,
    videoId,
    commentId,
    actionUrl: videoId ? `/videos/${videoId}` : `/profile/${mentionerId}`,
  })
}
