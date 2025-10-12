'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Settings, Video, Palette, Globe } from 'lucide-react'

export default function PreferencesSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    defaultModel: 'SORA_2',
    defaultResolution: '1280x720',
    defaultDuration: '8',
    theme: 'system',
    language: 'en',
    autoEnhancePrompts: true,
    showCostEstimates: true,
    defaultQuality: 'standard',
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        alert('Preferences saved successfully!')
      } else {
        alert('Failed to save preferences')
      }
    } catch (error) {
      alert('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your RTIM experience
          </p>
        </div>

        {/* Video Generation Defaults */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Video Generation Defaults</CardTitle>
                <CardDescription>Pre-fill video generation form with these values</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default Model</Label>
                <Select
                  value={preferences.defaultModel}
                  onValueChange={(value) => setPreferences({ ...preferences, defaultModel: value })}
                >
                  <SelectTrigger id="defaultModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SORA_2">Sora-2 (Standard)</SelectItem>
                    <SelectItem value="SORA_2_PRO">Sora-2 Pro (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultResolution">Default Resolution</Label>
                <Select
                  value={preferences.defaultResolution}
                  onValueChange={(value) => setPreferences({ ...preferences, defaultResolution: value })}
                >
                  <SelectTrigger id="defaultResolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="640x480">640x480 (SD)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Duration</Label>
                <Select
                  value={preferences.defaultDuration}
                  onValueChange={(value) => setPreferences({ ...preferences, defaultDuration: value })}
                >
                  <SelectTrigger id="defaultDuration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 seconds</SelectItem>
                    <SelectItem value="8">8 seconds</SelectItem>
                    <SelectItem value="12">12 seconds</SelectItem>
                    <SelectItem value="16">16 seconds</SelectItem>
                    <SelectItem value="20">20 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultQuality">Quality Preset</Label>
                <Select
                  value={preferences.defaultQuality}
                  onValueChange={(value) => setPreferences({ ...preferences, defaultQuality: value })}
                >
                  <SelectTrigger id="defaultQuality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Fast & Cheap)</SelectItem>
                    <SelectItem value="standard">Standard (Balanced)</SelectItem>
                    <SelectItem value="premium">Premium (Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Enhance Prompts</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically apply AI enhancement to prompts
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, autoEnhancePrompts: !preferences.autoEnhancePrompts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.autoEnhancePrompts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.autoEnhancePrompts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Cost Estimates</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Display credit cost before generating videos
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, showCostEstimates: !preferences.showCostEstimates })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.showCostEstimates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.showCostEstimates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how RTIM looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose your preferred color theme for the interface
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your language preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
