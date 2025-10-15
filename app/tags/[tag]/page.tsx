'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VideoCard } from '@/components/feed/video-card'
import { VideoCardSkeleton } from '@/components/feed/video-card-skeleton'
import { Hash, ArrowLeft, Video } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { toast } from '@/lib/utils/toast'
import { motion } from 'framer-motion'

interface FeedVideo {
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
  tags: string[]
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

export default function TagPage() {
  const params = useParams()
  const router = useRouter()
  const tag = decodeURIComponent(params.tag as string)

  const [videos, setVideos] = useState<FeedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    fetchVideos(1)
  }, [tag])

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      handleLoadMore()
    }
  }, [inView, hasMore, isLoading, isLoadingMore])

  const fetchVideos = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const response = await fetch(`/api/tags/${encodeURIComponent(tag)}?page=${pageNum}&limit=12`)

      if (response.ok) {
        const data = await response.json()

        if (pageNum === 1) {
          setVideos(data.videos || [])
        } else {
          setVideos(prev => [...prev, ...(data.videos || [])])
        }

        setHasMore(data.hasMore || false)
        setTotal(data.total || 0)
        setPage(pageNum)
      } else {
        if (pageNum === 1) {
          setVideos([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      if (pageNum === 1) {
        setVideos([])
      }
      setHasMore(false)
      toast.error('Failed to load videos')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchVideos(page + 1)
    }
  }

  const handleLike = async (videoId: string, isLiked: boolean) => {
    const method = isLiked ? 'POST' : 'DELETE'
    const response = await fetch(`/api/videos/${videoId}/like`, { method })

    if (!response.ok) {
      throw new Error('Failed to like video')
    }

    const data = await response.json()

    // Update local state
    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === videoId
          ? { ...v, isLiked, likesCount: data.likesCount }
          : v
      )
    )
  }

  const handleShare = async (videoId: string) => {
    const url = `${window.location.origin}/videos/${videoId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this AI-generated video',
          url,
        })
        toast.shared()
        return
      } catch (err) {
        // User cancelled
      }
    }

    await navigator.clipboard.writeText(url)
    toast.copied()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Hash className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">#{tag}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {total.toLocaleString()} {total === 1 ? 'video' : 'videos'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Videos Grid */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Hash className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-500 mb-4">
              No videos with the tag #{tag} yet
            </p>
            <Button asChild>
              <Link href="/explore">Explore Other Tags</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center mt-8 py-8">
                {isLoadingMore && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {[1, 2, 3].map((i) => (
                      <VideoCardSkeleton key={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && videos.length > 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>You've seen all videos with #{tag}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
