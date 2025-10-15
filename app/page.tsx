'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Video,
  Wand2,
  Layers,
  Clock,
  DollarSign,
  Users,
  Shield,
  Rocket,
  Brain,
  Palette,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header - Clean and Professional */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RTIM
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {status === 'authenticated' && session?.user ? (
                <>
                  <Link href="/generate">
                    <Button variant="ghost" className="hover:bg-indigo-50 dark:hover:bg-indigo-950">
                      Generate Video
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="flex items-center space-x-2 border-gray-300 dark:border-gray-700">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user.image || ''} />
                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="ghost" className="hover:bg-indigo-50 dark:hover:bg-indigo-950">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Bold and Impactful */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by OpenAI Sora-2
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reimagine
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Video Creation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              The world&apos;s first AI-powered video platform with intelligent prompt enhancement,
              style consistency, and enterprise-grade quality control
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {status === 'authenticated' ? (
                <>
                  <Link href="/generate">
                    <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30">
                      Create Video Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/videos">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-gray-300 dark:border-gray-700">
                      My Videos
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30">
                      Get Started with Your API Key
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/generate">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-gray-300 dark:border-gray-700">
                      View Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {status !== 'authenticated' && (
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Bring your own API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>No platform fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Full billing control</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Value Propositions - From Business Plan */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Leading Creators Choose RTIM
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unique innovations that set us apart from every other AI video platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Innovation 1: Intelligent Enhancement */}
            <Card className="border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  AI Prompt Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Our proprietary Claude-powered enhancement layer analyzes and optimizes your prompts
                  with professional cinematography techniques, lighting theory, and composition rules.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic technical detail enhancement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Professional cinematography patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Context-aware optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Innovation 2: Style Consistency */}
            <Card className="border-2 border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  Style Consistency Engine
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Create reusable style profiles that ensure perfect brand consistency across all
                  your video generations. Enterprise teams can share and enforce brand standards.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Workspace-wide style libraries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Brand guideline enforcement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Team collaboration features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Innovation 3: Smart Cost Optimization */}
            <Card className="border-2 border-pink-100 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="h-14 w-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  Intelligent Cost Control
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  AI-powered model selection suggests the optimal quality-cost balance for each
                  prompt, while real-time usage analytics prevent budget overruns.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time cost estimation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Smart model recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Budget alerts and controls</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Professional-grade features designed for creators, marketers, and enterprises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Dual Model Access
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose between Sora-2 and Sora-2 Pro based on your quality and budget needs
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Workspace Collaboration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team workspaces with shared styles, assets, and collaborative editing
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all">
              <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900 rounded-xl flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Video Remixing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Iterate on existing videos with new prompts while maintaining visual consistency
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 transition-all">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Real-Time Tracking
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor generation progress with live updates and automatic notifications
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Style Templates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pre-built professional styles for marketing, education, and entertainment
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all">
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Enterprise Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                SOC 2 compliant with role-based access control and audit logs
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Usage Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive dashboards tracking costs, quality metrics, and team performance
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 transition-all">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Priority Processing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pro users get faster generation times with dedicated processing queues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Philosophy - From Business Plan */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Usage-Based Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Pay only for what you use. No hidden fees, no complicated tiers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* BYOK Tier */}
            <Card className="border-2 border-indigo-500 dark:border-indigo-600 relative shadow-xl md:col-span-3 lg:col-span-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1">
                  Recommended
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Bring Your Own Key
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Free
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">platform</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use your own OpenAI API key
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Your own OpenAI API key</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">No platform fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Direct OpenAI billing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Full control over costs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">All RTIM features</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="border-2 border-gray-200 dark:border-gray-800 md:col-span-3 lg:col-span-1">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    What&apos;s Included
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      All Features
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Full access to RTIM platform
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Sora-2 & Sora-2 Pro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">AI prompt enhancement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Style profiles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Up to 1080p resolution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Workspaces</span>
                  </li>
                </ul>
                <Link href="/api-access">
                  <Button className="w-full" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Enterprise
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">Custom</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    For teams and businesses
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">All Pro features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Team workspaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Volume discounts</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>BYOK Model:</strong> You&apos;re billed directly by OpenAI for Sora usage. RTIM platform is free - just bring your own OpenAI API key!
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases - From Business Plan */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Built for Every Creator
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From social media to enterprise marketing, RTIM scales with your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Users className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Content Creators
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate engaging social media content, YouTube videos, and promotional materials
                in minutes instead of hours. Perfect for maintaining consistent posting schedules.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Marketing Teams
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create on-brand ad campaigns, product demos, and explainer videos. Workspace
                features ensure team alignment and style consistency across all assets.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Rocket className="h-10 w-10 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Agencies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage multiple client projects with separate workspaces, style libraries, and
                usage tracking. Deliver high-quality videos at scale without scaling costs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <DollarSign className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                E-commerce
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate product showcase videos, lifestyle content, and promotional clips.
                Maintain visual consistency across your entire product catalog.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Brain className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Educators
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create engaging educational content, course materials, and visual explanations.
                Make complex concepts accessible through high-quality video.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Shield className="h-10 w-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Enterprises
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Internal communications, training videos, and corporate presentations. Enterprise
                security, compliance, and dedicated support included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Videos Generated</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  95%
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Customer Satisfaction</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Enterprise Clients</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Processing Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {status !== 'authenticated' && (
        <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Video Workflow?
              </h2>
              <p className="text-xl mb-10 text-indigo-100 max-w-2xl mx-auto">
                Join thousands of creators, marketers, and enterprises who are already creating
                stunning AI videos with RTIM
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-10 py-6 bg-white text-indigo-600 hover:bg-gray-100 shadow-xl">
                    Get Started with Your API Key
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/generate">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white/10">
                    View Demo
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-indigo-100">
                Bring your own OpenAI API key • No platform fees • Full billing control
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RTIM</span>
              </div>
              <p className="text-sm">
                Reimagine video creation with AI-powered intelligence and professional quality.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/generate" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/generate" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/videos" className="hover:text-white transition-colors">Examples</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm mb-4 md:mb-0">
              © 2025 RTIM. Powered by OpenAI Sora-2. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
