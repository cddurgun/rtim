'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

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

  const handleShare = () => {
    if (onShare) {
      onShare(video.id)
    } else {
      // Default share behavior
      const url = `${window.location.origin}/videos/${video.id}`
      navigator.clipboard.writeText(url)
      // TODO: Show toast notification
    }
  }

  const displayName = video.user.name || video.user.username || 'Anonymous'
  const username = video.user.username || video.user.id

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Video Section */}
      <div className="relative aspect-video bg-black group">
        <video
          src={video.videoUrl}
          poster={video.thumbnailUrl || undefined}
          className="w-full h-full object-contain"
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={(e) => {
            const videoEl = e.currentTarget
            if (videoEl.paused) {
              videoEl.play()
            } else {
              videoEl.pause()
            }
          }}
        />

        {/* Play/Pause Overlay */}
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
