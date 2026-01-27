import GitHub from "@auth/core/providers/github";
import Credentials from "@auth/core/providers/credentials";
import type { AuthConfig } from "@auth/core/types";
import { HookSystem } from "@/lib/modules/hooks";
import { api } from "@/lib/api/api";

export const authConfig: AuthConfig = {
    basePath: "/api/auth",
    trustHost: true,
    debug: false,
    secret: process.env.AUTH_SECRET || import.meta.env?.AUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
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
                        password: password
                    });

                    if (response?.success && response.data) {
                        const user = response.data;
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            username: (user as any).username,
                            role: (user as any).role,
                            status: (user as any).status,
                        };
                    }
                } catch (error) {
                    console.error("Auth Login Failed:", error);
                }
                return null;
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.status = (user as any).status;
                token.username = (user as any).username;
            }
            return token;
        },
        signIn: ({ user }) => {
            if ((user as any).status === 'INACTIVE') {
                return false;
            }
            return true;
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = (token as any).id || (token.sub as string);
                (session.user as any).role = token.role;
                (session.user as any).status = token.status;
                (session.user as any).username = token.username;
            }

            return session;
        },
    },
    events: {
        async signIn({ user }) {
            await HookSystem.dispatch('user.login', { userId: user.id, email: user.email });
        },
        async signOut(message) {
            if ("token" in message && message.token?.sub) {
                await HookSystem.dispatch('user.logout', { userId: message.token.sub });
            }
        }
    }
};

export default authConfig;