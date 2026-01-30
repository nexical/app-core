import type { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

/**
 * Role Policy: __role-name__.ts
 * Class-based security policy for route protection.
 *
 * RULE: MUST implement 'RolePolicy' interface.
 * RULE: MUST throw an error if the check fails (returns Promise<void>).
 */
export class __RoleName__Policy implements RolePolicy {
  public readonly name = '__role-kebab-name__';

  /**
   * Determines if the current context has this role.
   * @param context - The Astro API Context or Global Astro object.
   * @param input - The input data being accessed/modified.
   * @param resource - Optional existing resource (for ownership checks).
   */
  async check(
    context: APIContext | AstroGlobal,
    input: unknown,
    resource?: unknown,
  ): Promise<void> {
    const actor = 'locals' in context ? context.locals.actor : context.locals.actor;

    if (!actor) {
      throw new Error('Unauthorized: No actor found in context.');
    }

    // Example Logic:
    // if (actor.role !== 'ADMIN') {
    //     throw new Error('Forbidden: Admin role required.');
    // }
  }
}
