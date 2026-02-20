import { GlobHelper } from '../core/glob-helper';

/**
 * Dynamic Module Initialization
 *
 * Uses Vite's glob import to automatically find and execute 'init.ts' files
 * located in module directories and the core source.
 *
 * This allows modules to register themselves (Services, Shells, Hooks)
 * without modifying core configuration files.
 */
export async function initializeModules() {
  console.info('[Core] Initializing modules...');
  const promises: Promise<void>[] = [];

  // We import glob eagerly so the side-effects (registration) run immediately.
  // 1. Initialize Core First (Registers default '*' shell)
  const core = GlobHelper.getCoreInits();
  Object.values(core).forEach((mod: unknown) => {
    const module = mod as { init?: () => Promise<void> };
    if (typeof module.init === 'function') promises.push(module.init());
  });

  // 2. Initialize Modules (Registers specific overrides like 'auth')
  // Includes standard 'init.ts' AND 'server-init.ts'
  const modules = GlobHelper.getModuleInits();
  Object.values(modules).forEach((mod: unknown) => {
    const module = mod as { init?: () => Promise<void> };
    if (typeof module.init === 'function') promises.push(module.init());
  });

  await Promise.allSettled(promises);

  const count = Object.keys(core).length + Object.keys(modules).length;
  console.info(`[Core] Initialized ${count} module(s) via init.ts`);
}
