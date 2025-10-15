'use client'

import { useState } from 'react'
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from '@/lib/utils/toast'
import { Textarea } from '@/components/ui/textarea'

interface ShareMenuProps {
  videoId: string
  title: string
  description?: string
  className?: string
}

export function ShareMenu({ videoId, title, description, className }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const videoUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/videos/${videoId}`
  const encodedUrl = encodeURIComponent(videoUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || title)

  const embedCode = `<iframe src="${videoUrl}/embed" width="640" height="360" frameborder="0" allowfullscreen></iframe>`

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  // Track share event
  const trackShare = async () => {
    try {
      await fetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedType(type)
      toast.copied()
      setTimeout(() => setCopiedType(null), 2000)

      // Track share when link is copied
      if (type === 'link') {
        await trackShare()
      }
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: videoUrl,
        })
        setIsOpen(false)
        toast.shared()
        // Track share on successful native share
        await trackShare()
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopy(videoUrl, 'link')
    }
  }

  const handleSocialShare = async (url: string) => {
    window.open(url, '_blank', 'width=600,height=400')
    setIsOpen(false)
    // Track share on social media share
    await trackShare()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Share this video</h3>

          {/* Native Share (if available) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </Button>
          )}

          {/* Social Media Platforms */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Share on social media</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSocialShare(shareLinks.twitter)}
              >
                <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSocialShare(shareLinks.facebook)}
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSocialShare(shareLinks.linkedin)}
              >
                <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleSocialShare(shareLinks.whatsapp)}
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start col-span-2"
                onClick={() => handleSocialShare(shareLinks.email)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Copy link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800"
              />
              <Button
                size="sm"
                onClick={() => handleCopy(videoUrl, 'link')}
              >
                {copiedType === 'link' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Embed code</p>
            <div className="relative">
              <Textarea
                value={embedCode}
                readOnly
                className="text-xs font-mono resize-none pr-20"
                rows={3}
              />
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedCode, 'embed')}
              >
                {copiedType === 'embed' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Code className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
