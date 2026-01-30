import { getCoreInits, getClientModuleInits } from './glob-helper';

/**
 * Client-Side Module Initialization
 *
 * Safely initializes modules in the browser/client environment.
 * Only loads 'init.ts' and 'client-init.ts' files.
 * EXCLUDES 'server-init.ts'.
 */
export async function initializeClientModules() {
  console.log('[Core] Initializing Client modules...');
  const promises: Promise<void>[] = [];

  // 1. Initialize Core (Shells)
  const core = getCoreInits();
  Object.values(core).forEach((mod: any) => {
    if (typeof mod.init === 'function') promises.push(mod.init());
    // Some init files execute globally on import, which is fine for eager glob
  });

  // 2. Initialize Modules (Shared init.ts and client-init.ts)
  const modules = getClientModuleInits();
  Object.values(modules).forEach((mod: any) => {
    if (typeof mod.init === 'function') promises.push(mod.init());
    else if (typeof mod.default === 'function') promises.push(mod.default());
    // Handle named exports like initUserModule if they are not auto-called
    // But user-ui/init.ts calls itself.
  });

  await Promise.allSettled(promises);
  console.log(`[Core] Client Initialized.`);
}
