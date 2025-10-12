'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Sparkles,
  Home,
  Play,
  Video,
  LayoutDashboard,
  Users,
  Palette,
  CreditCard,
  Settings,
  Key,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronRight,
  Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Generate', href: '/generate', icon: Play },
  { name: 'My Videos', href: '/videos', icon: Video },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Style Profiles', href: '/profiles', icon: Palette },
  { name: 'Workspaces', href: '/workspaces', icon: Users },
  { name: 'Credits & Billing', href: '/billing', icon: CreditCard },
  { name: 'API Access', href: '/api-access', icon: Key },
]

const accountNavigation: NavItem[] = [
  { name: 'Profile Settings', href: '/settings/profile', icon: User },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Preferences', href: '/settings/preferences', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-gray-800"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {!isCollapsed && (
              <Link href="/" className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">RTIM</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/" className="flex items-center justify-center w-full">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              />
            </Button>
          </div>

          {/* User info with credits */}
          {session?.user && !isCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">{session.user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {session.user.credits || 100}
                  </span>
                </div>
                <Link href="/billing">
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Buy More
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {session?.user && isCollapsed && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-800">
              <Avatar className="h-10 w-10 mx-auto">
                <AvatarImage src={session.user.image || ''} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                      ${active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                    {!isCollapsed && <span className="flex-1">{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Account section */}
            {!isCollapsed && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 px-2">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </p>
                <div className="space-y-1">
                  {accountNavigation.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                          ${active
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              className={`w-full ${isCollapsed ? 'px-0' : ''}`}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`} />
              {!isCollapsed && 'Sign Out'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content offset */}
      <div className={`${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300`}>
        {/* This div provides the spacing for the main content */}
      </div>
    </>
  )
}
