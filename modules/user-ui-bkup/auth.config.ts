import GitHub from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';
import type { AuthConfig } from '@auth/core/types';
import { HookSystem } from '@/lib/modules/hooks';
import { api } from '@/lib/api/api';

interface AppUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  role?: string;
  status?: string;
}

export const authConfig: AuthConfig = {
  basePath: '/api/auth',
  trustHost: true,
  debug: false,
  secret: process.env.AUTH_SECRET || import.meta.env?.AUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || import.meta.env?.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET || import.meta.env?.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const identifier = (credentials?.identifier as string) || (credentials?.email as string);
        const password = credentials?.password as string;

        if (!identifier || !password) return null;

        try {
          const response = await api.user.auth.login({
            email: identifier,
            password: password,
          });

          if (response?.success && response.data) {
            const user = response.data;
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              username: (user as AppUser).username,
              role: (user as AppUser).role,
              status: (user as AppUser).status,
            };
          }
        } catch (error) {
          console.error('Auth Login Failed:', error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as AppUser).role;
        token.status = (user as AppUser).status;
        token.username = (user as AppUser).username;
      }
      return token;
    },
    signIn: ({ user }) => {
      if ((user as AppUser).status === 'INACTIVE') {
        return false;
      }
      return true;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = (token as unknown as { id: string }).id || (token.sub as string);
        (session.user as AppUser).role = token.role as string;
        (session.user as AppUser).status = token.status as string;
        (session.user as AppUser).username = token.username as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await HookSystem.dispatch('user.login', { userId: user.id, email: user.email });
    },
    async signOut(message) {
      if ('token' in message && message.token?.sub) {
        await HookSystem.dispatch('user.logout', { userId: message.token.sub });
      }
    },
  },
};

export default authConfig;
