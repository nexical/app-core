import type { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext } from 'astro';

export class MemberRole implements RolePolicy {
  /**
   * Validates if the actor has permission for the operation.
   * Throws an error if denied.
   */
  async check(context: APIContext, input: any, data?: any): Promise<void> {
    const actor = context.locals.actor;

    if (!actor) {
      throw new Error('Unauthorized: Authentication required');
    }

    // Example resource-level check
    if (data?.teamId && actor.activeTeamId !== data.teamId) {
      throw new Error('Forbidden: Context mismatch');
    }
  }
}
