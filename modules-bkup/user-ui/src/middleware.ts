import type { APIContext, MiddlewareNext } from 'astro';
import { getSession } from './lib/auth-session';
import type { User } from '@modules/user-api/src/sdk';

export default {
  onRequest: async (context: APIContext, next: MiddlewareNext) => {
    const { pathname } = context.url;
    if (pathname.startsWith('/api/auth')) return next();

    const session = await getSession(context.request);
    const user = session?.user as User | undefined;

    if (user && !context.locals.actor) {
      context.locals.actor = {
        type: 'user',
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
      };
    }

    // Inject navData into locals for pages to consume
    const userData = user || context.locals.actor || null;

    context.locals.navData = {
      ...context.locals.navData,
      context: {
        ...context.locals.navData?.context,
        user: userData
          ? {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              username: userData.username,
              role: (userData as User).role,
              status: (userData as User).status,
            }
          : null,
      },
    };

    return undefined; // Continue to next middleware or page
  },
};
