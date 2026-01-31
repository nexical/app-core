import { getCoreInits, getClientModuleInits } from './glob-helper';
import { Logger } from './logger';

/**
 * Client-Side Module Initialization
 *
 * Safely initializes modules in the browser/client environment.
 * Only loads 'init.ts' and 'client-init.ts' files.
 * EXCLUDES 'server-init.ts'.
 */
export async function initializeClientModules() {
  Logger.info('[Core] Initializing Client modules...');
  const promises: Promise<void>[] = [];

  // 1. Initialize Core (Shells)
  const core = getCoreInits();
  Object.values(core).forEach((mod: unknown) => {
    const minit = mod as { init?: () => Promise<void> };
    if (typeof minit.init === 'function') promises.push(minit.init());
    // Some init files execute globally on import, which is fine for eager glob
  });

  // 2. Initialize Modules (Shared init.ts and client-init.ts)
  const modules = getClientModuleInits();
  Object.values(modules).forEach((mod: unknown) => {
    const minit = mod as { init?: () => Promise<void>; default?: () => Promise<void> };
    if (typeof minit.init === 'function') promises.push(minit.init());
    else if (typeof minit.default === 'function') promises.push(minit.default());
    // Handle named exports like initUserModule if they are not auto-called
    // But user-ui/init.ts calls itself.
  });

  await Promise.allSettled(promises);
  Logger.info(`[Core] Client Initialized.`);
}
