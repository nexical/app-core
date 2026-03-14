/**
 * Discovers and aggregates middleware from modules.
 * Uses Vite's import.meta.glob for dynamic loading.
 */
import { ModuleDiscovery } from '../modules/module-discovery';

import { GlobHelper } from '../core/glob-helper';

export interface ModuleMiddleware {
  publicRoutes?: string[];
  onRequest?: (context: unknown, next: () => Promise<Response>) => Promise<Response | undefined>;
}

// Cache for performance
let cachedMiddlewares: ModuleMiddleware[] | null = null;

/**
 * Discovers and aggregates middleware from modules.
 * Uses ModuleDiscovery to determine order and Vite's import.meta.glob for loading code.
 */
export async function getModuleMiddlewares(): Promise<ModuleMiddleware[]> {
  if (cachedMiddlewares) return cachedMiddlewares;

  // 1. Load all available middleware files via Vite (Build/Runtime)
  // We use a glob to ensure Vite bundles these files
  const globbedMiddlewares = GlobHelper.getMiddlewareModules();
  console.log('[MiddlewareRegistry] Globbed Middlewares:', Object.keys(globbedMiddlewares));

  // 2. Load module configurations to determine the correct order (Phase + Order)
  const sortedModules = await ModuleDiscovery.loadModules();

  const middlewares: ModuleMiddleware[] = [];

  // 3. Map sorted modules to their middleware implementation
  for (const mod of sortedModules) {
    // Construct the key that matches the glob pattern result
    const key = `/modules/${mod.name}/src/middleware.ts`;
    console.log(`[MiddlewareRegistry] Checking key: ${key} for module ${mod.name}`);
    const middlewareFn = globbedMiddlewares[key] as () => Promise<Record<string, unknown>>;

    if (middlewareFn) {
      console.log(`[MiddlewareRegistry] Found middleware for module ${mod.name}`);
      const middlewareModule = (await middlewareFn()) as Record<string, unknown>;
      /* v8 ignore start */
      if (!middlewareModule.default) {
        console.warn(
          `[MiddlewareRegistry] Module ${mod.name} has no default export in middleware.ts`,
        );
        continue;
      }
      /* v8 ignore stop */

      middlewares.push(middlewareModule.default as ModuleMiddleware);
    }
  }

  cachedMiddlewares = middlewares;
  return middlewares;
}
