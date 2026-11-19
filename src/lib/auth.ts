// No type import needed for NextAuth v4
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import NextAuth from 'next-auth'
import crypto from 'crypto'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https'),
        maxAge: 30 * 24 * 60 * 60, // 30 days
        // Don't set domain - let browser handle it automatically for cross-subdomain support
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https'),
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https'),
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }: { token: any; user: any; trigger: any }) {

      if (user) {
        token.role = user.role
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.csrfToken = crypto.randomUUID()
        token.iat = Math.floor(Date.now() / 1000)
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      } else if (token && !token.csrfToken) {
        // If token exists but no CSRF token, generate one
        token.csrfToken = crypto.randomUUID()
      }
      
      // Handle update trigger - refresh user data from database
      if (trigger === 'update' && token.sub) {
        try {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              email: true,
              name: true,
              role: true,
              image: true,
            }
          })
          
          if (updatedUser) {
            token.email = updatedUser.email
            token.name = updatedUser.name
            token.role = updatedUser.role
            token.image = updatedUser.image
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error refreshing user data in JWT callback:', error)
          }
        }
      }
      
      // Refresh token if it's about to expire (within 7 days)
      if (token.exp && token.exp - Math.floor(Date.now() / 1000) < 7 * 24 * 60 * 60) {
        token.csrfToken = crypto.randomUUID()
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      }

      return token
    },
    async session({ session, token }: { session: any; token: any }) {

      if (token) {
        session.user.id = token.sub!
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.image
        session.user.role = token.role as string
        session.csrfToken = token.csrfToken as string

        // Check if session is expired
        if (token.exp && token.exp < Math.floor(Date.now() / 1000)) {
          return null
        }
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allow relative callback URLs, or callback URLs on the same origin
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Export only the configuration - the handler is in [...nextauth]/route.ts
