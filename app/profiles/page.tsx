'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, Coins, Plus, Search, Heart, Copy, Trash2, Edit } from 'lucide-react'

interface StyleProfile {
  id: string
  name: string
  description: string
  prompt: string
  model: string
  resolution: string
  duration: number
  isPublic: boolean
  userId: string
  likes: number
  createdAt: string
  user?: {
    name: string
    image: string | null
  }
}

export default function ProfilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<StyleProfile[]>([])
  const [myProfiles, setMyProfiles] = useState<StyleProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'discover' | 'my-profiles'>('discover')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // New profile form state
  const [newProfile, setNewProfile] = useState({
    name: '',
    description: '',
    prompt: '',
    model: 'SORA_2',
    resolution: '1280x720',
    duration: 10,
    isPublic: true,
  })

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

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles()
  }, [activeTab])

  const fetchProfiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/profiles?tab=${activeTab}`)
      const data = await response.json()

      if (activeTab === 'discover') {
        setProfiles(data.profiles || [])
      } else {
        setMyProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = async () => {
    if (!newProfile.name || !newProfile.prompt) {
      alert('Please fill in name and prompt')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      })

      if (response.ok) {
        const profile = await response.json()
        setMyProfiles([profile, ...myProfiles])
        setNewProfile({
          name: '',
          description: '',
          prompt: '',
          model: 'SORA_2',
          resolution: '1280x720',
          duration: 10,
          isPublic: true,
        })
        setShowCreateForm(false)
        alert('Profile created successfully!')
      } else {
        throw new Error('Failed to create profile')
      }
    } catch (error) {
      alert('Failed to create profile')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUseProfile = (profile: StyleProfile) => {
    // Store profile in localStorage and redirect to generate page
    localStorage.setItem('selectedProfile', JSON.stringify(profile))
    router.push('/generate')
  }

  const handleLikeProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchProfiles() // Refresh profiles
      }
    } catch (error) {
      console.error('Failed to like profile:', error)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMyProfiles(myProfiles.filter(p => p.id !== profileId))
      }
    } catch (error) {
      alert('Failed to delete profile')
    }
  }

  const filteredProfiles = (activeTab === 'discover' ? profiles : myProfiles).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">RTIM</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <Coins className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {session?.user?.credits || 100} Credits
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/generate">Generate Video</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/videos">My Videos</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Style Profiles</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Save your favorite generation settings and discover community templates
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'discover'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('my-profiles')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'my-profiles'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Profiles
          </button>
        </div>

        {/* Search & Create */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'my-profiles' && (
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showCreateForm ? 'Cancel' : 'Create Profile'}
            </Button>
          )}
        </div>

        {/* Create Profile Form */}
        {showCreateForm && activeTab === 'my-profiles' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Style Profile</CardTitle>
              <CardDescription>Save your generation settings as a reusable template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  placeholder="Cinematic Sunset"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this profile is best for..."
                  value={newProfile.description}
                  onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt Template</Label>
                <Textarea
                  id="prompt"
                  placeholder="Your prompt template..."
                  value={newProfile.prompt}
                  onChange={(e) => setNewProfile({ ...newProfile, prompt: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={newProfile.model} onValueChange={(value) => setNewProfile({ ...newProfile, model: value })}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SORA_2">Sora-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={newProfile.resolution} onValueChange={(value) => setNewProfile({ ...newProfile, resolution: value })}>
                    <SelectTrigger id="resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="640x480">640x480</SelectItem>
                      <SelectItem value="1280x720">1280x720</SelectItem>
                      <SelectItem value="1920x1080">1920x1080</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={newProfile.duration.toString()}
                    onValueChange={(value) => setNewProfile({ ...newProfile, duration: parseInt(value) })}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newProfile.isPublic}
                  onChange={(e) => setNewProfile({ ...newProfile, isPublic: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">Make this profile public</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateProfile} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'discover' ? 'No public profiles found' : 'No profiles yet. Create your first one!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription className="mt-1">{profile.description}</CardDescription>
                    </div>
                    {activeTab === 'my-profiles' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <p className="line-clamp-3">{profile.prompt}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Sora-2</span>
                    <span>•</span>
                    <span>{profile.resolution}</span>
                    <span>•</span>
                    <span>{profile.duration}s</span>
                  </div>
                  {activeTab === 'discover' && profile.user && (
                    <div className="text-sm text-gray-500">
                      By {profile.user.name || 'Anonymous'}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeProfile(profile.id)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {profile.likes}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUseProfile(profile)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
