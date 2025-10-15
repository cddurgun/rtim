'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/lib/utils/toast'

interface VideoCardProps {
  video: {
    id: string
    originalPrompt: string
    videoUrl: string
    thumbnailUrl: string | null
    duration: number
    viewsCount: number
    likesCount: number
    commentsCount: number
    sharesCount: number
    isLiked: boolean
    tags?: string[]
    createdAt: string
    user: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
  }
  onLike?: (videoId: string, isLiked: boolean) => Promise<void>
  onShare?: (videoId: string) => void
}

export function VideoCard({ video, onLike, onShare }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.isLiked)
  const [likesCount, setLikesCount] = useState(video.likesCount)
  const [isLiking, setIsLiking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1

    // Optimistic update
    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      if (onLike) {
        await onLike(video.id, newIsLiked)
      } else {
        const method = newIsLiked ? 'POST' : 'DELETE'
        const response = await fetch(`/api/videos/${video.id}/like`, { method })

        if (!response.ok) {
          throw new Error('Failed to like video')
        }

        const data = await response.json()
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      console.error('Error liking video:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare(video.id)
    } else {
      // Default share behavior
      const url = `${window.location.origin}/videos/${video.id}`

      // Try native share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Video by ${displayName}`,
            text: video.originalPrompt,
            url,
          })
          toast.shared()
          return
        } catch (err) {
          // User cancelled or share failed, fall back to copy
        }
      }

      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(url)
      toast.copied()
    }
  }

  const displayName = video.user.name || video.user.username || 'Anonymous'
  const username = video.user.username || video.user.id

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Video Section */}
      <div className="relative aspect-video bg-black group">
        {!videoError ? (
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            className="w-full h-full object-contain"
            loop
            muted
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              // Only log if we have a videoUrl (suppress errors for missing/invalid URLs)
              if (video.videoUrl && video.videoUrl.startsWith('http')) {
                console.warn('Video failed to load:', video.videoUrl)
              }
              setVideoError(true)
              setIsPlaying(false)
            }}
            onClick={(e) => {
              e.preventDefault()
              const videoEl = e.currentTarget

              // Check if video source is valid
              if (!video.videoUrl) {
                return
              }

              if (videoEl.paused) {
                // Try to play, catch any errors
                videoEl.play().catch(() => {
                  // Silently fail - video might not be ready yet
                })
              } else {
                videoEl.pause()
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <Play className="h-16 w-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Video unavailable</p>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        {!videoError && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isPlaying ? (
              <div className="bg-black/50 rounded-full p-4">
                <Pause className="h-12 w-12 text-white" />
              </div>
            ) : (
              <div className="bg-black/50 rounded-full p-4">
                <Play className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}s
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${username}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={video.user.image || undefined} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/profile/${username}`} className="hover:underline">
              <p className="font-semibold text-sm truncate">{displayName}</p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Prompt */}
        <p className="text-sm mb-3 line-clamp-2">{video.originalPrompt}</p>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {video.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} onClick={(e) => e.stopPropagation()}>
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
            {video.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{video.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likesCount}</span>
          </Button>

          <Link href={`/videos/${video.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{video.commentsCount}</span>
            </Button>
          </Link>

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="text-xs">{video.sharesCount}</span>
          </Button>

          <div className="ml-auto text-xs text-muted-foreground">
            {video.viewsCount.toLocaleString()} views
          </div>
        </div>
      </div>
    </Card>
  )
}
