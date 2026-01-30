import { defineMiddleware } from 'astro:middleware';
import { getModuleMiddlewares } from './lib/registries/middleware-registry';
import { HookSystem } from './lib/modules/hooks';
import { initializeModules } from './lib/modules/module-init';

// Ensure modules are initialized for all requests (Page or API)
await initializeModules();

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Skip middleware for assets
  if (pathname.match(/\.(css|js|png|jpg|jpeg|svg|gif|ico)$/)) {
    return next();
  }

  const moduleMiddlewares = await getModuleMiddlewares();

  // 1. Check for Public Routes from Modules
  // (Planned usage for isPublic check)

  // 2. Execute Module Middlewares
  // Modules can handle auth, redirects, etc.
  // They execute in order. If a module returns a response, the chain stops.
  for (const middleware of moduleMiddlewares) {
    if (middleware.onRequest) {
      const response = await middleware.onRequest(context, async () => undefined as any);
      if (response) {
        await HookSystem.dispatch('core.module.handled', { path: pathname });
        return response;
      }
    }
  }

  // Default: Continue to next middleware or page
  return next();
});
