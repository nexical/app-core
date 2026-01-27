import { getSession } from "./lib/auth-session";

export default {
    onRequest: async (context: any, next: any) => {
        const { pathname } = context.url;
        if (pathname.startsWith('/api/auth')) return next();

        const session = await getSession(context.request);

        if (session?.user && !context.locals.actor) {
            context.locals.actor = {
                type: 'user',
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                username: (session.user as any).username,
                role: (session.user as any).role,
                status: (session.user as any).status
            };
        }

        // Inject navData into locals for pages to consume
        const userData = session?.user || context.locals.actor || null;

        context.locals.navData = {
            ...context.locals.navData,
            context: {
                ...context.locals.navData?.context,
                user: userData ? {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    username: (userData as any).username,
                    role: (userData as any).role,
                    status: (userData as any).status
                } : null
            }
        };

        return undefined; // Continue to next middleware or page
    }
};
