import { GlobHelper } from '@/lib/core/glob-helper';
import { Logger } from '@/lib/core/logger';

/**
 * Client-Side Module Initialization
 *
 * Eagerly imports all module init.ts and client-init.ts files so their
 * module-level side-effects (ShellRegistry, RoleRegistry registrations)
 * run synchronously during the Vite module graph evaluation.
 *
 * This ensures registries are fully populated before any component renders,
 * eliminating the race condition where MasterShell resolves a shell before
 * module registrations have completed.
 */

// Eager glob: imports run synchronously as part of the bundle.
// Module-level side-effects (e.g. ShellRegistry.register) in each init.ts
// execute immediately when this module is loaded.
const eagerModules = GlobHelper.getClientModuleInitsEager();

export async function initializeClientModules() {
  Logger.info('[Core] Initializing Client modules...');
  const promises: Promise<void>[] = [];

  // 1. Module-level registrations (Shells, Roles etc.) already ran
  //    synchronously via the eager glob return at the top of this file.

  // 2. Call the init() export from each already-eagerly-loaded module.
  //    The module-level registrations already ran; this handles any async
  //    work defined inside the exported init() function.
  for (const path in eagerModules) {
    const mod = eagerModules[path] as { init?: () => Promise<void>; default?: () => Promise<void> };
    if (typeof mod.init === 'function') promises.push(mod.init());
    else if (typeof mod.default === 'function') promises.push(mod.default());
  }

  await Promise.allSettled(promises);
  Logger.info(`[Core] Client Initialized.`);
}
