import { GlobHelper } from '@/lib/core/glob-helper';

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
  for (const path in core) {
    const mod = (await core[path]()) as { init?: () => Promise<void> };
    if (typeof mod.init === 'function') promises.push(mod.init());
  }

  // 2. Initialize Modules (Registers specific overrides like 'auth')
  const modules = GlobHelper.getModuleInits();
  console.log(
    `[Core] Found ${Object.keys(modules).length} module init files: ${Object.keys(modules).join(', ')}`,
  );
  for (const path in modules) {
    const mod = (await modules[path]()) as { init?: () => Promise<void> };
    if (typeof mod.init === 'function') {
      console.log(`[Core] Initializing module: ${path}`);
      promises.push(mod.init());
    }
  }

  await Promise.allSettled(promises);

  const count = Object.keys(core).length + Object.keys(modules).length;
  console.info(`[Core] Initialized ${count} module(s) via init.ts`);
}
