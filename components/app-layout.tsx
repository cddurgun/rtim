'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Sidebar from './sidebar'
import { Toaster } from './ui/toaster'

interface AppLayoutProps {
  children: React.ReactNode
}

// Pages that should not show the sidebar
const NO_SIDEBAR_PAGES = ['/', '/signin', '/signup', '/error']

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show sidebar on landing, auth pages, or when not authenticated
  const showSidebar =
    status === 'authenticated' &&
    !NO_SIDEBAR_PAGES.includes(pathname || '')

  if (!showSidebar) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
