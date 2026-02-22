/**
 * Module Initialization: server-init.ts
 *
 * This file handles the registration of module-specific logic into global registries.
 * It is called automatically by the Core discovery helper during startup.
 *
 * Location: src/server-init.ts
 */

export const init = async () => {
  /**
   * 1. Register Role Policies
   * Scans the ./roles directory and registers all exported classes.
   */
  import.meta.glob('./roles/*.ts', { eager: true });

  /**
   * 2. Register Hook Listeners
   * Scans the ./hooks directory for side-effect listeners.
   */
  import.meta.glob('./hooks/*.ts', { eager: true });

  /**
   * 3. Register Custom Components/Drivers
   * Add any other module-specific initialization logic here.
   */
};
