export interface ModuleMiddleware {
  publicRoutes?: string[];
  onRequest?: (context: any, next: () => Promise<Response>) => Promise<Response | undefined>;
}

/**
 * Discovers and aggregates middleware from modules.
 * Uses Vite's import.meta.glob for dynamic loading.
 */
import { ModuleDiscovery } from '../modules/module-discovery';

import { getMiddlewareModules } from '../core/glob-helper';

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
  const globbedMiddlewares = getMiddlewareModules();

  // 2. Load module configurations to determine the correct order (Phase + Order)
  const sortedModules = await ModuleDiscovery.loadModules();

  const middlewares: ModuleMiddleware[] = [];

  // 3. Map sorted modules to their middleware implementation
  for (const mod of sortedModules) {
    // Construct the key that matches the glob pattern result
    const key = `/modules/${mod.name}/src/middleware.ts`;
    const middlewareModule = globbedMiddlewares[key] as any;

    if (middlewareModule && middlewareModule.default) {
      middlewares.push(middlewareModule.default);
    }
  }

  cachedMiddlewares = middlewares;
  return middlewares;
}
