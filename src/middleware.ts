import { defineMiddleware } from 'astro:middleware';
import { getModuleMiddlewares } from './lib/registries/middleware-registry';
import { HookSystem } from './lib/modules/hooks';
import { initializeModules } from './lib/modules/module-init';

// Ensure modules are initialized for all requests (Page or API)
await initializeModules();

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const origin = context.request.headers.get('Origin');

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

  let finalResponse: Response | undefined;

  for (const middleware of moduleMiddlewares) {
    if (middleware.onRequest) {
      const response = await middleware.onRequest(
        context,
        async () => undefined as unknown as Response,
      );
      if (response) {
        console.info(`[Middleware] Handled by module (returning response): ${pathname}`);
        await HookSystem.dispatch('core.module.handled', { path: pathname });
        finalResponse = response;
        break;
      }
    }
  }

  if (!finalResponse) {
    finalResponse = await next();
  }

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
