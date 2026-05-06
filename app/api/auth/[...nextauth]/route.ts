import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { mockUsers } from '@/lib/mock-data'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const dbUser = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (dbUser && await bcrypt.compare(credentials.password, dbUser.password)) {
            return { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role }
          }
        } catch {
          // fallback to mock users
          const mockUser = mockUsers.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          )
          if (mockUser) {
            return { id: mockUser.id, name: mockUser.name, email: mockUser.email, role: mockUser.role }
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { id: string; name: string; email: string; role: string }).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string
        ;(session.user as { role?: string; id?: string }).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'crisislink-secret-key-2024-production',
})

export { handler as GET, handler as POST }
