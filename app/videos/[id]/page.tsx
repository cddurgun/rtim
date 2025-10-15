'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'
import { CommentThread } from '@/components/comments/comment-thread'
import { VideoCard } from '@/components/feed/video-card'
import { VideoCardSkeleton } from '@/components/feed/video-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { ShareMenu } from '@/components/share/share-menu'
import {
  Heart,
  Share2,
  MoreVertical,
  Flag,
  Download,
  Eye,
  MessageCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/lib/utils/toast'
import { motion } from 'framer-motion'

interface VideoDetail {
  id: string
  originalPrompt: string
  enhancedPrompt?: string
  videoUrl: string
  thumbnailUrl: string | null
  duration: number
  model: string
  size: string
  tags: string[]
  viewsCount: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  replies?: Comment[]
}

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const videoId = params.id as string

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedVideos, setRelatedVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)

  useEffect(() => {
    fetchVideoDetails()
    fetchComments()
    fetchRelatedVideos()
  }, [videoId])

  const fetchVideoDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}`)

      if (response.ok) {
        const data = await response.json()
        setVideo(data.video)
        setIsLiked(data.video.isLiked)
        setLikesCount(data.video.likesCount)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch video:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    setCommentsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments?limit=50`)

      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const fetchRelatedVideos = async () => {
    try {
      const response = await fetch(`/api/feed?type=forYou&limit=6`)

      if (response.ok) {
        const data = await response.json()
        setRelatedVideos((data.videos || []).filter((v: any) => v.id !== videoId))
      }
    } catch (error) {
      console.error('Failed to fetch related videos:', error)
    }
  }

  const handleLike = async () => {
    if (!session) {
      router.push('/signin')
      return
    }

    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1

    // Optimistic update
    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      const method = newIsLiked ? 'POST' : 'DELETE'
      const response = await fetch(`/api/videos/${videoId}/like`, { method })

      if (response.ok) {
        const data = await response.json()
        setLikesCount(data.likesCount)

        if (newIsLiked) {
          toast.liked(video?.user.name || 'this user')
        } else {
          toast.unliked()
        }
      } else {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikesCount(likesCount)
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      toast.error('Failed to like video')
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Video by ${video?.user.name || 'RTIM user'}`,
          text: video?.originalPrompt,
          url,
        })
        toast.shared()
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.copied()
    }
  }

  const handleSubmitComment = async () => {
    if (!session) {
      router.push('/signin')
      return
    }

    if (!commentContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
        }),
      })

      if (response.ok) {
        toast.commented()
        setCommentContent('')
        fetchComments() // Refresh comments
      } else {
        toast.error('Failed to post comment')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <VideoCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Feed</Button>
        </div>
      </div>
    )
  }

  const displayName = video.user.name || video.user.username || 'Anonymous'
  const username = video.user.username || video.user.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-lg overflow-hidden"
            >
              <EnhancedVideoPlayer
                src={video.videoUrl}
                poster={video.thumbnailUrl || undefined}
                autoPlay={false}
                videoId={videoId}
                className="aspect-video"
              />
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6"
            >
              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Prompt */}
              <h1 className="text-2xl font-bold mb-4">{video.originalPrompt}</h1>

              {/* User Info & Actions */}
              <div className="flex items-center justify-between mb-4">
                <Link href={`/profile/${username}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={video.user.image || undefined} alt={displayName} />
                    <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount}
                  </Button>

                  <ShareMenu
                    videoId={videoId}
                    title={video.originalPrompt}
                    description={video.enhancedPrompt}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.viewsCount.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{video.commentsCount} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Model:</span>
                  <Badge variant="outline">{video.model}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Duration:</span>
                  <span>{video.duration}s</span>
                </div>
              </div>

              {/* Enhanced Prompt */}
              {video.enhancedPrompt && video.enhancedPrompt !== video.originalPrompt && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    AI-Enhanced Prompt:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {video.enhancedPrompt}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h2>

              {/* Comment Input */}
              {session ? (
                <div className="mb-8">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="min-h-[100px] resize-none"
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCommentContent('')}
                          disabled={!commentContent || isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmitComment}
                          disabled={!commentContent.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            'Comment'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="mb-4">Sign in to leave a comment</p>
                  <Button onClick={() => router.push('/signin')}>Sign In</Button>
                </div>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div>
                  {comments.map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      videoId={videoId}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Related Videos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-4">Related Videos</h3>
              <div className="space-y-4">
                {relatedVideos.slice(0, 5).map((relatedVideo) => (
                  <Link
                    key={relatedVideo.id}
                    href={`/videos/${relatedVideo.id}`}
                    className="block group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <video
                        src={relatedVideo.videoUrl}
                        poster={relatedVideo.thumbnailUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {relatedVideo.duration}s
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-600">
                      {relatedVideo.originalPrompt || relatedVideo.prompt}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {relatedVideo.user.name || 'Anonymous'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
