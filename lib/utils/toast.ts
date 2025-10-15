import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description })
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description })
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
  // Social media specific toasts
  liked: (username: string) => {
    sonnerToast.success(`Liked ${username}'s video`, {
      icon: '❤️',
    })
  },
  unliked: () => {
    sonnerToast('Removed like', {
      icon: '💔',
    })
  },
  commented: () => {
    sonnerToast.success('Comment posted', {
      icon: '💬',
    })
  },
  followed: (username: string) => {
    sonnerToast.success(`Now following ${username}`, {
      icon: '👥',
    })
  },
  unfollowed: (username: string) => {
    sonnerToast(`Unfollowed ${username}`, {
      icon: '👋',
    })
  },
  copied: () => {
    sonnerToast.success('Link copied to clipboard', {
      icon: '📋',
    })
  },
  shared: () => {
    sonnerToast.success('Shared successfully', {
      icon: '🚀',
    })
  },
}
