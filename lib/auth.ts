import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'

// Simplified auth config that works without a database
// When you add a database, add the PrismaAdapter and database-related code
export const authConfig = {
  providers: [
    // Demo credentials provider (remove in production)
    Credentials({
      name: 'Demo Account',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@rtim.app" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is just for demo - remove in production!
        if (credentials?.email === 'demo@rtim.ai' && credentials?.password === 'demo123') {
          return {
            id: 'demo-user',
            email: 'demo@rtim.ai',
            name: 'Demo User',
            image: null,
          }
        }
        return null
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
    async session({ session, token }: any) {
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
            // Fallback if user not in DB
            session.user.credits = 100
            session.user.tier = 'BASIC'
          }
        } catch (error) {
          console.error('Error fetching user from database:', error)
          session.user.credits = 100
          session.user.tier = 'BASIC'
        }
      }
      return session
    },
    async jwt({ token, user }: any) {
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
