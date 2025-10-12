'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Filter, Download, Share2, Trash2, Eye, Heart, MessageSquare, Play, MoreVertical, Grid, List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Video {
  id: string
  prompt: string
  enhancedPrompt: string | null
  model: string
  resolution: string
  duration: number
  status: string
  videoUrl: string | null
  thumbnailUrl: string | null
  cost: number
  jobId: string | null
  createdAt: string
  completedAt: string | null
  userId: string
  workspaceId: string | null
  views: number
  likes: number
  user?: {
    name: string | null
    image: string | null
  }
}

type FilterStatus = 'all' | 'COMPLETED' | 'PROCESSING' | 'FAILED'
type SortBy = 'recent' | 'popular' | 'cost'
type ViewMode = 'grid' | 'list'

export default function VideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  useEffect(() => {
    fetchVideos()
  }, [filterStatus, sortBy, page])

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: filterStatus,
        sortBy,
        limit: '12',
      })

      const response = await fetch(`/api/videos?${params}`)
      const data = await response.json()

      if (page === 1) {
        setVideos(data.videos || [])
      } else {
        setVideos(prev => [...prev, ...(data.videos || [])])
      }

      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== videoId))
      } else {
        alert('Failed to delete video')
      }
    } catch (error) {
      alert('Failed to delete video')
    }
  }

  const handleLikeVideo = async (videoId: string) => {
    try {
      await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
      })
      // Refresh videos to update like count
      fetchVideos()
    } catch (error) {
      console.error('Failed to like video:', error)
    }
  }

  const filteredVideos = videos.filter(v =>
    v.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.enhancedPrompt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      COMPLETED: { variant: 'default', label: 'Completed' },
      PROCESSING: { variant: 'secondary', label: 'Processing' },
      FAILED: { variant: 'destructive', label: 'Failed' },
      PENDING: { variant: 'outline', label: 'Pending' },
    }

    const config = variants[status] || variants.PENDING
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Videos</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view all your generated videos
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/generate">
                <Play className="mr-2 h-5 w-5" />
                Generate New Video
              </Link>
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {videos.filter(v => v.status === 'COMPLETED').length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {videos.filter(v => v.status === 'PROCESSING').length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {videos.reduce((sum, v) => sum + (v.views || 0), 0)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {videos.reduce((sum, v) => sum + v.cost, 0).toFixed(0)} Credits
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search videos by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="cost">Highest Cost</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Videos Grid/List */}
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start creating amazing videos with AI
            </p>
            <Button asChild>
              <Link href="/generate">Generate Your First Video</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(video.status)}
                          <span className="text-xs text-gray-500">
                            {formatDate(video.createdAt)}
                          </span>
                        </div>
                        <CardTitle className="text-base line-clamp-2">
                          {video.prompt}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Video thumbnail/player placeholder */}
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {video.status === 'COMPLETED' && video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {video.status === 'PROCESSING' ? (
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          ) : (
                            <Play className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      )}
                      {video.status === 'COMPLETED' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Video metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{video.model === 'SORA_2_PRO' ? 'Pro' : 'Standard'}</span>
                      <span>•</span>
                      <span>{video.resolution}</span>
                      <span>•</span>
                      <span>{video.duration}s</span>
                      <span>•</span>
                      <span>{video.cost} credits</span>
                    </div>

                    {/* Engagement stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{video.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{video.likes || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    {video.status === 'COMPLETED' && video.videoUrl && (
                      <>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={video.videoUrl} download>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
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
      </div>
    </div>
  )
}
