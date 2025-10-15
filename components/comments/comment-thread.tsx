'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Heart, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/lib/utils/toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentThreadProps {
  comment: Comment
  videoId: string
  onReply?: (commentId: string, content: string) => Promise<void>
  depth?: number
}

export function CommentThread({ comment, videoId, onReply, depth = 0 }: CommentThreadProps) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const displayName = comment.user.name || comment.user.username || 'Anonymous'
  const maxDepth = 3 // Limit nesting depth

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId: comment.id,
        }),
      })

      if (response.ok) {
        toast.commented()
        setReplyContent('')
        setShowReplyBox(false)

        if (onReply) {
          await onReply(comment.id, replyContent)
        }

        // Refresh the page to show new reply (or implement optimistic update)
        window.location.reload()
      } else {
        toast.error('Failed to post reply')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={depth > 0 ? 'ml-12 mt-4' : 'mb-6'}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.image || undefined} alt={displayName} />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{displayName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-100">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 px-2">
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-600 hover:text-blue-600"
                onClick={() => setShowReplyBox(!showReplyBox)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-600"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {/* Reply Box */}
          <AnimatePresence>
            {showReplyBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Reply to ${displayName}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyBox(false)
                      setReplyContent('')
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Replies */}
          {comment.replies && showReplies && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  videoId={videoId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
