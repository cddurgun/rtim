'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Plus } from 'lucide-react'
import { VideoCard } from '@/components/feed/video-card'
import { VideoCardSkeleton } from '@/components/feed/video-card-skeleton'

interface Workspace {
  id: string
  name: string
  description: string | null
}

interface Video {
  id: string
  originalPrompt: string
  videoUrl: string
  thumbnailUrl: string | null
  duration: number
  model: string
  size: string
  tags: string[]
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  likesCount: number
  commentsCount: number
  sharesCount: number
  viewsCount: number
  isLiked: boolean
}

export default function WorkspaceVideosPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWorkspaceVideos()
  }, [workspaceId])

  const fetchWorkspaceVideos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/videos`)
      if (response.ok) {
        const data = await response.json()
        setWorkspace(data.workspace)
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to fetch workspace videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
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
          <Button variant="ghost" onClick={() => router.push('/workspaces')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{workspace?.name} Videos</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage videos created in this workspace
              </p>
            </div>
            <Button onClick={() => router.push('/generate')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Video
            </Button>
          </div>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No videos in this workspace yet</p>
            <Button onClick={() => router.push('/generate')}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
