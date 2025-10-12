'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, Code, Book, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string | null
  createdAt: string
  expiresAt: string | null
  requestCount: number
}

export default function ApiAccessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

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
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newKeyName) {
      alert('Please enter a key name')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const apiKey = await response.json()
        setApiKeys([apiKey, ...apiKeys])
        setNewKeyName('')
        setShowCreateForm(false)
        alert('API key created! Make sure to copy it now - you won\'t be able to see it again.')
      } else {
        alert('Failed to create API key')
      }
    } catch (error) {
      alert('Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId))
      } else {
        alert('Failed to delete API key')
      }
    } catch (error) {
      alert('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('API key copied to clipboard!')
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">API Access</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage API keys for programmatic access to RTIM
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              {showCreateForm ? 'Cancel' : 'Create API Key'}
            </Button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Generate API Key</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new API key to authenticate your requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Make API Calls</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use your API key in the Authorization header
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Book className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Read Documentation</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check our API docs for endpoints and examples
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create API Key Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for accessing the RTIM API programmatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="Production Server"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Give your API key a descriptive name to remember where it's used
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateApiKey} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* API Keys List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No API keys yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first API key to start using the RTIM API
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        {apiKey.lastUsed ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Never Used</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                        {apiKey.requestCount > 0 && ` • ${apiKey.requestCount} requests`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Quick reference for using the RTIM API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <code>{`curl https://api.rtim.app/v1/videos \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Generate Video</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <code>{`POST /v1/videos
{
  "prompt": "A cinematic shot of a sunset",
  "model": "sora-2",
  "resolution": "1280x720",
  "duration": 8
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Rate Limits</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Basic: 10 requests/minute, 100 requests/hour</li>
                <li>Pro: 30 requests/minute, 500 requests/hour</li>
                <li>Enterprise: Custom limits</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              <Book className="mr-2 h-4 w-4" />
              View Full Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
