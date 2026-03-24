import type { APIContext } from 'astro';
import { roleRegistry } from '@/lib/registries/role-registry';

export class ApiGuard {
  /**
   * Enforces a role check for API endpoints.
   * Throws an error if validation fails (to be caught by defineApi).
   */
  public static async protect(
    context: APIContext,
    roleName: string,
    input: Record<string, unknown> = {},
    data?: unknown,
  ): Promise<void> {
    const policy = roleRegistry.get(roleName);

    if (!policy) {
      const normalized = roleName.toUpperCase();
      if (normalized === 'PUBLIC') return;

      if (normalized === 'ANONYMOUS') {
        if (context.locals.actor) {
          throw new Error('This endpoint is restricted to unauthenticated users only');
        }
        return;
      }

      console.error(`[ApiGuard] Role policy '${roleName}' not found in registry.`);
      throw new Error(`Role policy '${roleName}' not found`);
    }

    await policy.check(context, input, data);
  }
}
