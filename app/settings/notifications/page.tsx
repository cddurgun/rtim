'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Bell, Mail, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function NotificationsSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: {
      videoCompleted: true,
      videoFailed: true,
      creditsLow: true,
      weeklyReport: false,
      marketing: false,
    },
    pushNotifications: {
      videoCompleted: true,
      videoFailed: true,
      creditsLow: false,
    },
    inAppNotifications: {
      videoCompleted: true,
      videoFailed: true,
      creditsLow: true,
      newFeatures: true,
    },
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
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('Notification preferences saved successfully!')
      } else {
        alert('Failed to save preferences')
      }
    } catch (error) {
      alert('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEmailSetting = (key: string) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: !settings.emailNotifications[key as keyof typeof settings.emailNotifications],
      },
    })
  }

  const togglePushSetting = (key: string) => {
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: !settings.pushNotifications[key as keyof typeof settings.pushNotifications],
      },
    })
  }

  const toggleInAppSetting = (key: string) => {
    setSettings({
      ...settings,
      inAppNotifications: {
        ...settings.inAppNotifications,
        [key]: !settings.inAppNotifications[key as keyof typeof settings.inAppNotifications],
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notification Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage how you receive updates and alerts
          </p>
        </div>

        {/* Email Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Receive updates via email</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Video Completed</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified when your video generation is complete
                </div>
              </div>
              <button
                onClick={() => toggleEmailSetting('videoCompleted')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications.videoCompleted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications.videoCompleted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Video Failed</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Alert when video generation fails
                </div>
              </div>
              <button
                onClick={() => toggleEmailSetting('videoFailed')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications.videoFailed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications.videoFailed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Credits Running Low</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Notify when credit balance is below 50
                </div>
              </div>
              <button
                onClick={() => toggleEmailSetting('creditsLow')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications.creditsLow ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications.creditsLow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Weekly Report</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Receive weekly usage and performance summary
                </div>
              </div>
              <button
                onClick={() => toggleEmailSetting('weeklyReport')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Marketing & Updates</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Product updates, tips, and promotional offers
                </div>
              </div>
              <button
                onClick={() => toggleEmailSetting('marketing')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications.marketing ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>Browser and mobile push alerts</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 opacity-50">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Video Completed</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Instant notification when video is ready
                </div>
              </div>
              <button
                disabled
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>Notifications within the RTIM platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Video Updates</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Show in-app alerts for video status changes
                </div>
              </div>
              <button
                onClick={() => toggleInAppSetting('videoCompleted')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.inAppNotifications.videoCompleted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.inAppNotifications.videoCompleted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">New Features</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Announcements about new features and improvements
                </div>
              </div>
              <button
                onClick={() => toggleInAppSetting('newFeatures')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.inAppNotifications.newFeatures ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.inAppNotifications.newFeatures ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
