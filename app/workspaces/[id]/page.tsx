'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, UserPlus, Trash2, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const workspaceId = params.id as string

  const [workspace, setWorkspace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    fetchWorkspace()
  }, [workspaceId])

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`)
      if (response.ok) {
        const data = await response.json()
        setWorkspace(data.workspace)
      }
    } catch (error) {
      console.error('Failed to fetch workspace:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail) return

    setIsInviting(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (response.ok) {
        alert('Member invited successfully')
        setInviteEmail('')
        fetchWorkspace()
      } else {
        alert('Failed to invite member')
      }
    } catch (error) {
      alert('Failed to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member?')) return

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchWorkspace()
      }
    } catch (error) {
      alert('Failed to remove member')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Workspace not found</h2>
          <Button onClick={() => router.push('/workspaces')}>Back to Workspaces</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/workspaces')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Button>
          <h1 className="text-4xl font-bold mb-2">{workspace.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage workspace settings and team members
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <div className="font-medium">{workspace.name}</div>
              </div>
              <div>
                <Label>Shared Credits</Label>
                <div className="text-2xl font-bold text-purple-600">{workspace.sharedCredits}</div>
              </div>
              <div>
                <Label>Total Members</Label>
                <div className="text-2xl font-bold text-blue-600">{workspace._count?.members || 0}</div>
              </div>
              <div>
                <Label>Total Videos</Label>
                <div className="text-2xl font-bold text-green-600">{workspace._count?.videos || 0}</div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Member */}
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Members</CardTitle>
              <CardDescription>Add new members to this workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleInviteMember} disabled={isInviting || !inviteEmail} className="w-full">
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage workspace members and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspace.members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.user.image || ''} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {member.role !== 'OWNER' && workspace.ownerId === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
