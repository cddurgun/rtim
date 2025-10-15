'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, MapPin, Link as LinkIcon, Calendar, Users, Heart, Video, Lock } from 'lucide-react'
import { VideoCard } from '@/components/feed/video-card'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface UserProfile {
  id: string
  username: string | null
  name: string | null
  image: string | null
  bio: string | null
  website: string | null
  location: string | null
  coverImage: string | null
  followersCount: number
  followingCount: number
  totalLikes: number
  isPrivate: boolean
  createdAt: string
  videosCount: number
  isFollowing: boolean
  isOwnProfile: boolean
}

interface ProfileVideo {
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
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { data: session } = useSession()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<ProfileVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [videosLoading, setVideosLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    fetchVideos()
  }, [username])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/${username}`)

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsFollowing(data.user.isFollowing)
      } else if (response.status === 404) {
        setError('User not found')
      } else if (response.status === 403) {
        setError('This profile is private')
      } else {
        setError('Failed to load profile')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVideos = async (pageNum = 1) => {
    setVideosLoading(true)
    try {
      const response = await fetch(`/api/users/${username}/videos?page=${pageNum}&limit=12`)

      if (response.ok) {
        const data = await response.json()

        if (pageNum === 1) {
          setVideos(data.data.videos || [])
        } else {
          setVideos(prev => [...prev, ...(data.data.videos || [])])
        }

        setHasMore(data.data.pagination.hasMore || false)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setVideosLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!session) {
      // Redirect to signin
      window.location.href = '/signin'
      return
    }

    if (!profile || isFollowLoading) return

    setIsFollowLoading(true)
    const method = isFollowing ? 'DELETE' : 'POST'

    try {
      const response = await fetch(`/api/users/${username}/follow`, { method })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setProfile(prev => prev ? {
          ...prev,
          followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to follow/unfollow user')
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
      alert('Failed to follow/unfollow user')
    } finally {
      setIsFollowLoading(false)
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
    alert('Video link copied to clipboard!')
  }

  const handleLoadMore = () => {
    if (!videosLoading && hasMore) {
      fetchVideos(page + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">{error || 'Profile not found'}</h2>
            <p className="text-gray-600 mb-4">
              {error === 'This profile is private'
                ? 'You need to follow this user to view their profile'
                : 'This user does not exist or has been removed'}
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Feed</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = profile.name || profile.username || 'Anonymous'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="relative pb-6 border-b">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900">
                <AvatarImage src={profile.image || undefined} alt={displayName} />
                <AvatarFallback className="text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="text-gray-600 dark:text-gray-400">@{profile.username || profile.id}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {profile.isOwnProfile ? (
                <Button asChild variant="outline">
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  variant={isFollowing ? 'outline' : 'default'}
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Bio and Details */}
          <div className="mt-6 space-y-4">
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4 text-gray-600" />
                <span className="font-semibold">{profile.videosCount}</span>
                <span className="text-gray-600">Videos</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="font-semibold">{profile.followersCount}</span>
                <span className="text-gray-600">Followers</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:underline">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="font-semibold">{profile.followingCount}</span>
                <span className="text-gray-600">Following</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-gray-600" />
                <span className="font-semibold">{profile.totalLikes}</span>
                <span className="text-gray-600">Likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="mt-8 pb-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-6">
              {videosLoading && page === 1 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-20">
                  <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">No videos yet</p>
                  {profile.isOwnProfile && (
                    <Button asChild>
                      <Link href="/generate">Create Your First Video</Link>
                    </Button>
                  )}
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
                        disabled={videosLoading}
                        size="lg"
                        variant="outline"
                      >
                        {videosLoading ? (
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
    </div>
  )
}
