import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keyId = params.id

    // Check if API key exists and belongs to user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    })

    return NextResponse.json({ message: 'API key deleted successfully' })
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
