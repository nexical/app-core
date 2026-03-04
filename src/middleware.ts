import { defineMiddleware } from 'astro:middleware';
import { getModuleMiddlewares } from '@/lib/registries/middleware-registry';
import { HookSystem } from './lib/modules/hooks';
import { initializeModules } from './lib/modules/module-init';

// Ensure modules are initialized for all requests (Page or API)
console.info('[Core Middleware] Loading and initializing modules...');
await initializeModules();
console.info('[Core Middleware] Modules initialized.');

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const origin = context.request.headers.get('Origin');

  console.log(`[CORE START] ${pathname}, Actor: ${JSON.stringify(context.locals.actor || 'none')}`);

  // Skip middleware for assets
  if (pathname.match(/\.(css|js|png|jpg|jpeg|svg|gif|ico)$/)) {
    return next();
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  const moduleMiddlewares = await getModuleMiddlewares();
  console.log(
    `[Core Middleware] Loaded ${moduleMiddlewares.length} module middlewares for ${pathname}`,
  );

  // Execute module middlewares sequentially.
  // We pass a dummy `next` that returns undefined so modules can do `return next()`.
  // If a module returns a real Response (e.g. redirect), we intercept it immediately.
  let interceptResponse: Response | undefined;

  for (const middleware of moduleMiddlewares) {
    if (middleware.onRequest) {
      console.log(`[Core Middleware] Executing middleware...`);
      const response = await middleware.onRequest(
        context,
        async () => undefined as unknown as Response,
      );

      // If the module returned a tangible Response (not undefined/void), it means
      // it wants to intercept the request (e.g. a redirect or error page).
      if (response && response instanceof Response) {
        console.info(`[Core Middleware] Intercepted by module: ${pathname}`);
        await HookSystem.dispatch('core.module.handled', { path: pathname });
        interceptResponse = response;
        break;
      }
    }
  }

  // If intercepted, use that response. Otherwise, proceed to the actual Astro route.
  console.log(
    `[CORE MID] ${pathname}, Final Actor: ${JSON.stringify(context.locals.actor || 'none')}`,
  );
  const finalResponse = interceptResponse || (await next());
  console.log(`[Core Middleware] Finished processing ${pathname}`);

  const newHeaders = new Headers(finalResponse.headers);
  if (origin) {
    newHeaders.set('Access-Control-Allow-Origin', origin);
    newHeaders.set('Access-Control-Allow-Credentials', 'true');
  }

  const resWithCors = new Response(finalResponse.body, {
    status: finalResponse.status,
    statusText: finalResponse.statusText,
    headers: newHeaders,
  });

  return resWithCors;
});
