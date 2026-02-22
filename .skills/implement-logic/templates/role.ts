import type { APIContext } from 'astro';
import { db } from '@/lib/core/db';
import type { RolePolicy } from '@/lib/core/security/types';

/**
 * Role Policy Template
 *
 * Location: src/roles/
 * Naming: {role-name}.ts (e.g., job-owner.ts)
 *
 * Rules:
 * 1. Implement the RolePolicy interface.
 * 2. Perform DB-level ownership or permission lookups.
 * 3. Return boolean (allow/deny).
 */
export class Is__RoleName__ implements RolePolicy {
  /**
   * Checks if the actor has the required role/ownership.
   *
   * @param context Astro API Context
   * @param input The DTO input for the operation
   * @param data Optional pre-fetched data
   */
  async check(
    context: APIContext,
    input: { id?: string } & Record<string, unknown>,
    data?: Record<string, unknown> & { ownerId?: string },
  ): Promise<boolean> {
    const actor = context.locals.actor;

    if (!actor) return false;

    // Example: Ownership Check
    const record =
      data ||
      (await db.__entity__.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      }));

    if (!record) return false;

    return record.ownerId === actor.id;
  }
}
