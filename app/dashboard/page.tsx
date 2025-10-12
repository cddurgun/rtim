'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, Users, Sparkles } from 'lucide-react'
import { VideoCard } from '@/components/feed/video-card'

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
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

type FeedType = 'forYou' | 'following' | 'trending'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [videos, setVideos] = useState<FeedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedType, setFeedType] = useState<FeedType>('forYou')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [feedType])

  const fetchFeed = async (pageNum = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/feed?type=${feedType}&page=${pageNum}&limit=12`)

      if (response.ok) {
        const data = await response.json()

        if (pageNum === 1) {
          setVideos(data.videos || [])
        } else {
          setVideos(prev => [...prev, ...(data.videos || [])])
        }

        setHasMore(data.hasMore || false)
        setPage(pageNum)
      } else {
        // If API fails, show empty state
        setVideos([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error)
      setVideos([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchFeed(page + 1)
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

  const handleShare = (videoId: string) => {
    const url = `${window.location.origin}/videos/${videoId}`
    navigator.clipboard.writeText(url)
    // TODO: Show toast notification
    alert('Video link copied to clipboard!')
  }

  const handleTabChange = (value: string) => {
    setFeedType(value as FeedType)
    setPage(1)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Feed</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing AI-generated videos from the community
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/generate">
                Create Video
              </Link>
            </Button>
          </div>
        </div>

        {/* Feed Tabs */}
        <Tabs value={feedType} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="forYou" className="gap-2">
              <Sparkles className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2" disabled={!session}>
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value={feedType} className="mt-6">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">
                  {feedType === 'following'
                    ? 'Follow creators to see their videos here'
                    : 'No videos to display yet'}
                </p>
                <Button asChild>
                  <Link href="/generate">Create the First Video</Link>
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

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      size="lg"
                      variant="outline"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
