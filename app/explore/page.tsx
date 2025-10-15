'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { VideoCard } from '@/components/feed/video-card'
import { VideoCardSkeleton } from '@/components/feed/video-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, TrendingUp, Hash, Users, Video, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/utils/toast'
import { debounce } from 'lodash'

interface SearchResults {
  videos: any[]
  users: any[]
  tags: Array<{ tag: string; count: number }>
}

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'users' | 'tags'>('all')
  const [results, setResults] = useState<SearchResults>({
    videos: [],
    users: [],
    tags: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trending, setTrending] = useState<any[]>([])

  // Debounce search query
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query)
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Fetch trending content on mount
  useEffect(() => {
    fetchTrending()
  }, [])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery)

      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('q', debouncedQuery)
      window.history.replaceState({}, '', url.toString())
    } else {
      setResults({ videos: [], users: [], tags: [] })
    }
  }, [debouncedQuery])

  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/feed?type=trending&limit=12')
      if (response.ok) {
        const data = await response.json()
        setTrending(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    }
  }

  const performSearch = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`)

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)

        // Save to recent searches
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
        setRecentSearches(updated)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setResults({ videos: [], users: [], tags: [] })

    const url = new URL(window.location.href)
    url.searchParams.delete('q')
    window.history.replaceState({}, '', url.toString())
  }

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query)
  }

  const handleClearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
  }

  const handleLike = async (videoId: string, isLiked: boolean) => {
    const method = isLiked ? 'POST' : 'DELETE'
    const response = await fetch(`/api/videos/${videoId}/like`, { method })

    if (!response.ok) {
      throw new Error('Failed to like video')
    }

    const data = await response.json()

    // Update local state
    setResults(prev => ({
      ...prev,
      videos: prev.videos.map(v =>
        v.id === videoId ? { ...v, isLiked, likesCount: data.likesCount } : v
      ),
    }))

    setTrending(prev =>
      prev.map(v =>
        v.id === videoId ? { ...v, isLiked, likesCount: data.likesCount } : v
      )
    )
  }

  const handleShare = (videoId: string) => {
    const url = `${window.location.origin}/videos/${videoId}`
    navigator.clipboard.writeText(url)
    toast.copied()
  }

  const hasResults = results.videos.length > 0 || results.users.length > 0 || results.tags.length > 0
  const showTrending = !debouncedQuery && trending.length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing AI-generated videos and creators
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search videos, users, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleClearSearch}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Recent Searches */}
          {!debouncedQuery && recentSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Recent Searches
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={handleClearRecentSearches}
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Tabs */}
        {debouncedQuery.length >= 2 && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all" className="gap-2">
                All
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos
                {results.videos.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {results.videos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
                {results.users.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {results.users.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tags" className="gap-2">
                <Hash className="h-4 w-4" />
                Tags
                {results.tags.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {results.tags.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map((i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !hasResults && debouncedQuery.length >= 2 && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching for something else
                </p>
              </div>
            )}

            {/* Results */}
            {!isLoading && hasResults && (
              <AnimatePresence mode="wait">
                <TabsContent value={activeTab} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Videos Results */}
                    {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">
                          Videos
                          <Badge variant="secondary" className="ml-3">
                            {results.videos.length}
                          </Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.videos.map((video) => (
                            <VideoCard
                              key={video.id}
                              video={video}
                              onLike={handleLike}
                              onShare={handleShare}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Results */}
                    {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">
                          Users
                          <Badge variant="secondary" className="ml-3">
                            {results.users.length}
                          </Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.users.map((user) => (
                            <Link
                              key={user.id}
                              href={`/profile/${user.username || user.id}`}
                              className="block"
                            >
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback>
                                      {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">
                                      {user.name || user.username || 'Anonymous'}
                                    </h3>
                                    {user.username && (
                                      <p className="text-sm text-gray-500 truncate">
                                        @{user.username}
                                      </p>
                                    )}
                                    {user.bio && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                        {user.bio}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                      <span>{user.videosCount} videos</span>
                                      <span>{user.followersCount} followers</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags Results */}
                    {(activeTab === 'all' || activeTab === 'tags') && results.tags.length > 0 && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">
                          Tags
                          <Badge variant="secondary" className="ml-3">
                            {results.tags.length}
                          </Badge>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {results.tags.map(({ tag, count }) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-lg py-3 px-6 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                              onClick={() => handleTagClick(tag)}
                            >
                              <Hash className="h-5 w-5 mr-2" />
                              {tag}
                              <span className="ml-2 text-gray-500">({count})</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            )}
          </Tabs>
        )}

        {/* Trending Section (shown when no search) */}
        {showTrending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
