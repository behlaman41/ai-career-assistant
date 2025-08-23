import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

const prisma = new PrismaClient();

// Feature flags
const GOOGLE_OAUTH_ENABLED = process.env.GOOGLE_OAUTH_ENABLED === 'true';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await axios.post(`${process.env.API_URL}/auth/token`, {
            email: credentials.email,
            password: credentials.password,
          });

          const user = res.data;
          if (user && user.accessToken) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              accessToken: user.accessToken,
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'localhost',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '1025'),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || '',
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@local.test',
    }),
    ...(GOOGLE_OAUTH_ENABLED
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User & { role?: string; accessToken?: string };
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { role?: string; accessToken?: string };
    }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as 'USER' | 'ADMIN') || 'USER';
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
