import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getUserWithCredits(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      credits: true,
      tier: true,
    },
  })
}

export async function checkUserCredits(userId: string, requiredCredits: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.credits >= requiredCredits
}
