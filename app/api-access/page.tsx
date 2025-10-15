'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Key, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ApiAccessPage() {
  const { status } = useSession()
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Fetch API key when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchApiKey()
    }
  }, [status])

  const fetchApiKey = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/openai-key')
      if (response.ok) {
        const data = await response.json()
        setHasKey(data.hasKey)
        if (data.hasKey) {
          // Show masked version
          setApiKey('sk-••••••••••••••••••••••••••••••••••••••••')
        }
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.startsWith('sk-••')) {
      setSaveMessage({ type: 'error', text: 'Please enter a valid OpenAI API key' })
      return
    }

    if (!apiKey.startsWith('sk-')) {
      setSaveMessage({ type: 'error', text: 'OpenAI API keys should start with "sk-"' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/user/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      })

      if (response.ok) {
        setHasKey(true)
        setSaveMessage({ type: 'success', text: 'OpenAI API key saved successfully!' })
        setApiKey('sk-••••••••••••••••••••••••••••••••••••••••')
        setShowKey(false)
      } else {
        const data = await response.json()
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save API key' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save API key. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to remove your OpenAI API key? You won\'t be able to generate videos without it.')) return

    try {
      const response = await fetch('/api/user/openai-key', {
        method: 'DELETE',
      })

      if (response.ok) {
        setHasKey(false)
        setApiKey('')
        setSaveMessage({ type: 'success', text: 'API key removed successfully' })
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to remove API key' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to remove API key' })
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">OpenAI API Key Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bring your own OpenAI API key to generate videos with RTIM
          </p>
        </div>

        {/* Alert Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>BYOK Model:</strong> RTIM uses a Bring Your Own Key (BYOK) model. You need to provide your own OpenAI API key to use Sora video generation. Your API key is encrypted and stored securely.
          </AlertDescription>
        </Alert>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Your API Key</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use your own OpenAI API key for full control and billing transparency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Secure Storage</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your API key is encrypted and never shared with third parties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Direct Billing</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;re billed directly by OpenAI based on your usage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Key Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Your OpenAI API Key</CardTitle>
            <CardDescription>
              Add or update your OpenAI API key to start generating videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveMessage && (
              <Alert className={saveMessage.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
                {saveMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={saveMessage.type === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}>
                  {saveMessage.text}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiKey">OpenAI API Key</Label>
                    {hasKey && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        API Key Configured
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-proj-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your OpenAI API key (starts with &quot;sk-&quot;). Get one from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      OpenAI Platform
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveApiKey} disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        {hasKey ? 'Update API Key' : 'Save API Key'}
                      </>
                    )}
                  </Button>
                  {hasKey && (
                    <Button onClick={handleDeleteApiKey} variant="outline" className="text-red-600 hover:text-red-700">
                      Remove Key
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* How to Get API Key */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get Your OpenAI API Key</CardTitle>
            <CardDescription>Follow these steps to create your API key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
              <li>
                Go to{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  OpenAI Platform - API Keys
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Sign in to your OpenAI account (or create one if you don&apos;t have one)</li>
              <li>Click &quot;Create new secret key&quot;</li>
              <li>Give your key a name (e.g., &quot;RTIM Video Generation&quot;)</li>
              <li>Copy the key (it starts with &quot;sk-&quot;) - you won&apos;t be able to see it again!</li>
              <li>Paste it in the field above and click &quot;Save API Key&quot;</li>
            </ol>

            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                <strong>Important:</strong> Make sure you have billing set up on your OpenAI account and sufficient credits. Video generation with Sora requires an active OpenAI account with available credits.
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Get Your OpenAI API Key
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
