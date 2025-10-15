'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, Coins, Info, Wand2, Play } from 'lucide-react'

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [model, setModel] = useState('SORA_2')
  const [resolution, setResolution] = useState('1280x720')
  const [duration, setDuration] = useState('10')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(80)
  const [costOptimizationTips, setCostOptimizationTips] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loadedProfile, setLoadedProfile] = useState<string>('')
  const [generationStatus, setGenerationStatus] = useState<string>('')
  const [generatedVideo, setGeneratedVideo] = useState<{ url: string; jobId: string } | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [recentVideos, setRecentVideos] = useState<Array<{
    id: string
    prompt: string
    status: string
    videoUrl?: string
    thumbnailUrl?: string
    duration: number
    resolution: string
    cost: number
  }>>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  // Load profile from localStorage if available
  useEffect(() => {
    const selectedProfile = localStorage.getItem('selectedProfile')
    if (selectedProfile) {
      try {
        const profile = JSON.parse(selectedProfile)
        setPrompt(profile.prompt || '')
        setModel(profile.model || 'SORA_2')
        setResolution(profile.resolution || '1280x720')
        setDuration(profile.duration?.toString() || '10')
        setLoadedProfile(profile.name || '')
        localStorage.removeItem('selectedProfile')
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }
  }, [])

  // Fetch recent videos on mount and after generation
  useEffect(() => {
    fetchRecentVideos()
  }, [])

  const fetchRecentVideos = async () => {
    setLoadingRecent(true)
    try {
      const response = await fetch('/api/videos?page=1&limit=3&sortBy=recent')
      const data = await response.json()
      if (data.success && data.videos) {
        setRecentVideos(data.videos)
      }
    } catch (error) {
      console.error('Failed to fetch recent videos:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  // Fetch intelligent cost estimate when parameters change
  useEffect(() => {
    const fetchCostEstimate = async () => {
      if (!prompt.trim()) return

      try {
        const response = await fetch('/api/videos/estimate-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model,
            size: resolution,
            duration: parseInt(duration),
          }),
        })

        const data = await response.json()

        if (data.success && data.data) {
          setEstimatedCost(data.data.estimate.estimatedCost)
          setCostOptimizationTips(data.data.estimate.optimizationTips || [])
        }
      } catch (err) {
        // Silently fail and use fallback calculation
        console.error('Cost estimation error:', err)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchCostEstimate, 500)
    return () => clearTimeout(timeoutId)
  }, [prompt, model, resolution, duration])

  // Poll for video status
  useEffect(() => {
    if (!jobId || !isGenerating) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/videos/status/${jobId}`)
        const data = await response.json()

        if (data.success && data.data) {
          setGenerationStatus(data.data.status || 'processing')

          if (data.data.status === 'completed' && data.data.download_url) {
            setGeneratedVideo({
              url: data.data.download_url,
              jobId: jobId,
            })
            setIsGenerating(false)
            setGenerationStatus('Video generation complete!')
            clearInterval(pollInterval)
            // Refresh recent videos
            fetchRecentVideos()
          } else if (data.data.status === 'failed') {
            setError('Video generation failed. Please try again.')
            setIsGenerating(false)
            clearInterval(pollInterval)
          }
        }
      } catch (err) {
        console.error('Error polling video status:', err)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [jobId, isGenerating])

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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return

    setIsEnhancing(true)
    setError('')

    try {
      const response = await fetch('/api/videos/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cinematicLevel: 'moderate',
          preserveOriginal: false,
          targetLength: 'medium',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompt')
      }

      if (data.success && data.data) {
        setEnhancedPrompt(data.data.enhancedPrompt)

        // Show quality score and success rate in console for debugging
        console.log('Enhancement Quality Score:', data.data.qualityScore)
        console.log('Estimated Success Rate:', data.data.estimatedSuccessRate + '%')
        console.log('Applied Techniques:', data.data.cinematicTechniques)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt')
    } finally {
      setIsEnhancing(false)
    }
  }

  const calculateCost = () => {
    const baseCost = 1 // 1 credit per second
    const durationNum = parseInt(duration)
    const modelMultiplier = model === 'SORA_2_PRO' ? 2.5 : 1.0
    const resolutionMultiplier = resolution === '1920x1080' ? 1.5 : resolution === '1280x720' ? 1.0 : 0.7

    return Math.ceil(baseCost * durationNum * modelMultiplier * resolutionMultiplier)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    const cost = calculateCost()
    const userCredits = session?.user?.credits || 0

    if (userCredits < cost) {
      setError(`Insufficient credits. Need ${cost} credits but you have ${userCredits}`)
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedVideo(null)
    setGenerationStatus('Starting video generation...')

    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          enhancedPrompt,
          model,
          size: resolution,
          duration: parseInt(duration),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start video generation')
      }

      if (data.success && data.data.jobId) {
        setJobId(data.data.jobId)
        setGenerationStatus('Video generation in progress...')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate video')
      setIsGenerating(false)
    }
  }

  const cost = calculateCost()

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
                <Link href="/videos">My Videos</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Generation Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Video</span>
                </CardTitle>
                <CardDescription>
                  Describe your video and let AI bring it to life
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe your video... (e.g., A serene lake at sunset with mountains in the background)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{prompt.length} / 5000 characters</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEnhancePrompt}
                      disabled={!prompt.trim() || isEnhancing}
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-3 w-3" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Enhanced Prompt Display */}
                {enhancedPrompt && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                    <Label className="text-blue-900 dark:text-blue-100">Enhanced Prompt</Label>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{enhancedPrompt}</p>
                  </div>
                )}

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SORA_2">Sora-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution Selection */}
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger id="resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="640x480">640x480 (SD)</SelectItem>
                      <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                      <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Selection */}
<div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    All videos are 10 seconds (1 credit per second)
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Generate Video ({cost} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Preview */}
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Cost Estimate</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Base cost</span>
                  <span className="font-semibold">{parseInt(duration) * 1} credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Model</span>
                  <span className="font-semibold">Sora-2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resolution</span>
                  <span className="font-semibold">{resolution}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{cost} credits</span>
                </div>
                <div className="text-xs text-gray-500">
                  Your balance: {session?.user?.credits || 100} credits
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>{costOptimizationTips.length > 0 ? 'Cost Optimization Tips' : 'Pro Tips'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {costOptimizationTips.length > 0 ? (
                  <>
                    {costOptimizationTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600">•</span>
                      <p>Be specific about camera angles, lighting, and movement</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600">•</span>
                      <p>Use the AI enhancement feature for better results</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600">•</span>
                      <p>All videos are 10 seconds - optimize your prompts for this duration</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600">•</span>
                      <p>Include specific details about motion and action in your prompt</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card>
              <CardHeader>
                <CardTitle>Example Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'A serene lake at sunset with mountains in the background',
                  'Time-lapse of clouds moving over a city skyline',
                  'Close-up of raindrops falling on autumn leaves',
                  'Aerial view of a winding road through a forest',
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left text-sm p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Generation Progress and Result */}
        {(isGenerating || generatedVideo) && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>{isGenerating ? 'Generating Video' : 'Generated Video'}</span>
                </CardTitle>
                <CardDescription>
                  {isGenerating ? generationStatus : 'Your video is ready!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                        <p className="text-lg font-semibold">{generationStatus}</p>
                        <p className="text-sm text-gray-500">
                          This may take 1-3 minutes depending on video length and complexity
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}

                {generatedVideo && !isGenerating && (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={generatedVideo.url}
                        controls
                        className="w-full h-full"
                        autoPlay
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Job ID: {generatedVideo.jobId}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <a href={generatedVideo.url} download>
                            Download Video
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/videos">
                            View in Gallery
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Videos Section */}
        {recentVideos.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Your Recent Videos</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/videos">View All</Link>
                  </Button>
                </div>
                <CardDescription>
                  Quick access to your recently generated videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentVideos.map((video) => (
                    <div key={video.id} className="space-y-2">
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {video.status === 'COMPLETED' && video.videoUrl ? (
                          <video
                            src={video.videoUrl}
                            poster={video.thumbnailUrl || undefined}
                            controls
                            className="w-full h-full object-cover"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : video.status === 'IN_PROGRESS' || video.status === 'QUEUED' ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-2">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                              <p className="text-sm text-gray-500">Processing...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-2">{video.prompt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{video.duration}s • {video.resolution}</span>
                          <span>{video.cost} credits</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
