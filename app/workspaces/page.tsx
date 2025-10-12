'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Users, Settings, Trash2, Crown, UserPlus, MoreVertical, Video, Coins, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Workspace {
  id: string
  name: string
  description: string | null
  createdAt: string
  ownerId: string
  sharedCredits: number
  _count: {
    members: number
    videos: number
  }
  owner: {
    name: string | null
    image: string | null
  }
  members: Array<{
    id: string
    role: string
    user: {
      name: string | null
      email: string
      image: string | null
    }
  }>
}

export default function WorkspacesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    sharedCredits: 0,
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

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data.workspaces || [])
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name) {
      alert('Please enter a workspace name')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkspace),
      })

      if (response.ok) {
        const workspace = await response.json()
        setWorkspaces([workspace, ...workspaces])
        setNewWorkspace({ name: '', description: '', sharedCredits: 0 })
        setShowCreateForm(false)
      } else {
        alert('Failed to create workspace')
      }
    } catch (error) {
      alert('Failed to create workspace')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWorkspaces(workspaces.filter(w => w.id !== workspaceId))
      } else {
        alert('Failed to delete workspace')
      }
    } catch (error) {
      alert('Failed to delete workspace')
    }
  }

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { variant: any; label: string }> = {
      OWNER: { variant: 'default', label: 'Owner' },
      ADMIN: { variant: 'secondary', label: 'Admin' },
      MEMBER: { variant: 'outline', label: 'Member' },
      VIEWER: { variant: 'outline', label: 'Viewer' },
    }
    const config = roles[role] || roles.MEMBER
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Workspaces</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Collaborate with your team on video projects
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              {showCreateForm ? 'Cancel' : 'Create Workspace'}
            </Button>
          </div>
        </div>

        {/* Create Workspace Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Workspace</CardTitle>
              <CardDescription>
                Set up a shared workspace for team collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="Marketing Team"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Workspace for marketing video content..."
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Shared Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={newWorkspace.sharedCredits || ''}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, sharedCredits: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-500">
                  Allocate credits from your personal balance to share with the team
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateWorkspace} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workspace
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Workspaces Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : workspaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a workspace to start collaborating with your team
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{workspace.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {workspace.description || 'No description'}
                      </CardDescription>
                    </div>
                    {workspace.ownerId === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {workspace._count.members}
                      </div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {workspace._count.videos}
                      </div>
                      <div className="text-xs text-gray-600">Videos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {workspace.sharedCredits}
                      </div>
                      <div className="text-xs text-gray-600">Credits</div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Owner</div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={workspace.owner.image || ''} />
                        <AvatarFallback className="text-xs">
                          {workspace.owner.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{workspace.owner.name || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Members Preview */}
                  {workspace.members.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Team Members</div>
                      <div className="flex -space-x-2">
                        {workspace.members.slice(0, 5).map((member) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={member.user.image || ''} />
                            <AvatarFallback className="text-xs">
                              {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {workspace.members.length > 5 && (
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium">
                              +{workspace.members.length - 5}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/workspaces/${workspace.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/workspaces/${workspace.id}/videos`}>
                      <Video className="mr-2 h-4 w-4" />
                      Videos
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
