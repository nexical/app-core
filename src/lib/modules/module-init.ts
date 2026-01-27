
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
    console.log('[Core] Initializing modules...');
    const promises: Promise<void>[] = [];

    // We import glob eagerly so the side-effects (registration) run immediately.
    // 1. Initialize Core First (Registers default '*' shell)
    const core = import.meta.glob('/src/init.ts', { eager: true });
    Object.values(core).forEach((mod: any) => {
        if (typeof mod.init === 'function') promises.push(mod.init());
    });

    // 2. Initialize Modules (Registers specific overrides like 'auth')
    // Includes standard 'init.ts' AND 'server-init.ts'
    const modules = import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/server-init.ts'], { eager: true });
    Object.values(modules).forEach((mod: any) => {
        if (typeof mod.init === 'function') promises.push(mod.init());
    });

    await Promise.allSettled(promises);

    const count = Object.keys(core).length + Object.keys(modules).length;
    console.log(`[Core] Initialized ${count} module(s) via init.ts`);
}
