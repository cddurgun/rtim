import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check for demo account first (for backward compatibility)
        if (credentials.email === 'demo@rtim.app' && credentials.password === 'demo123') {
          // Try to find or create demo user in database
          let demoUser = await prisma.user.findUnique({
            where: { email: 'demo@rtim.app' },
          })

          if (!demoUser) {
            // Create demo user if doesn't exist
            const passwordHash = await bcrypt.hash('demo123', 12)
            demoUser = await prisma.user.create({
              data: {
                email: 'demo@rtim.app',
                name: 'Demo User',
                passwordHash,
                credits: 1000, // Give demo user more credits
                tier: 'PRO',
              },
            })
          }

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            image: demoUser.image,
          }
        }

        // Check database for real users
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              passwordHash: true,
            },
          })

          if (!user || !user.passwordHash) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          // Update last active timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    // Uncomment when you add OAuth credentials
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string

        // Fetch user data from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { credits: true, tier: true }
          })

          if (dbUser) {
            session.user.credits = dbUser.credits
            session.user.tier = dbUser.tier
          } else {
            // Fallback if user not in DB (no starter credits)
            session.user.credits = 0
            session.user.tier = 'BASIC'
          }
        } catch (error) {
          console.error('Error fetching user from database:', error)
          session.user.credits = 0
          session.user.tier = 'BASIC'
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Extend the session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      credits?: number
      tier?: string
    }
  }
}
