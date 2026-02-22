import { HookSystem } from '@/lib/modules/hooks';
import { db } from '@/lib/core/db';
// import { config } from '@/lib/core/config';

/**
 * Hook Template
 *
 * Location: src/hooks/
 * Naming: {kebab-case}-hooks.ts
 *
 * Rules:
 * 1. Must implement a static `init()` method.
 * 2. MUST export a named `init` function that calls the static method (Auto-Discovery).
 * 3. Use HookSystem.on for side effects (asynchronous).
 * 4. Use HookSystem.filter for data modification (synchronous/middleware).
 * 5. Direct 'db' access is permitted for pragmatic implementation.
 */
export class __Entity__Hooks {
  static async init() {
    // 1. Listen for Events (Side Effects)
    HookSystem.on('__entity__.created', async (event: unknown) => {
      const { id } = event as { id: string };
      // Example: Direct DB update using universal access
      await db.__entity__.update({
        where: { id },
        data: { status: 'INITIALIZED' },
      });
    });

    // 2. Filter Data (Intercept & Transform)
    HookSystem.filter('__entity__.beforeCreate', async (data: unknown) => {
      const parsed = data as Record<string, unknown> & { name?: string };
      // Example: Data transformation
      if (parsed.name) {
        parsed.name = parsed.name.trim();
      }
      return parsed;
    });
  }
}

// MANDATORY: Export for Auto-Discovery
export const init = () => __Entity__Hooks.init();
