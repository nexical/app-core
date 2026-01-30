import { HookSystem } from '@/lib/modules/hooks';

/**
 * Hook Template
 *
 * Location: src/hooks/
 * Naming: {kebab-case}-hooks.ts
 *
 * Rules:
 * 1. Must implement a static `init()` method.
 * 2. Use HookSystem.on for side effects (asynchronous).
 * 3. Use HookSystem.filter for data modification (synchronous/middleware).
 * 4. NEVER import 'db' directly. Use Services or Federated SDK.
 * 5. Handle 'actor' context in filters for security/scoping.
 *
 * Discovery:
 * The module generator automatically scans src/hooks/ and calls init()
 * for every file found. Manual registration in server-init.ts is FORBIDDEN.
 */
export class __Entity__Hooks {
  static async init() {
    // 1. Listen for Events (Side Effects)
    HookSystem.on('__entity__.created', async (event: any) => {
      const { id, actorId } = event;
      // Example: Trigger background job, send email, or update external system.
    });

    // 2. Filter Data (Middleware)
    HookSystem.filter('__entity__.read', async (data: any, context?: any) => {
      const { actor } = context || {};

      // Example: Authorization-based field stripping
      if (actor?.role !== 'ADMIN') {
        delete (data as any).internalNote;
      }

      return data;
    });
  }
}
