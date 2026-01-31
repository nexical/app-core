import type { RolePolicy } from '@/lib/registries/role-registry';
import { type APIContext, type AstroGlobal } from 'astro';

export class IsMyself implements RolePolicy {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    const currentUser = context.locals?.actor;

    if (!currentUser) {
      throw new Error('Unauthorized: Login required');
    }

    // 1. Check existing data (Post-fetch check)
    if (data) {
      const record = data as { id?: string; userId?: string };
      // If checking a user record, id matches
      if (record.id === currentUser.id) return;
      // If checking a resource (Session, etc), userId matches
      if (record.userId === currentUser.id) return;
    }

    // 2. Check input params (Pre-fetch check or filtered input)
    if (input) {
      const p = input as { id?: string; userId?: string };
      if (p.id === currentUser.id) return;
      if (p.userId === currentUser.id) return;
    }

    // Special case: /user/me alias often used
    // But for strict "myself", if we can't verify ownership, we fail.

    throw new Error('Forbidden: You can only access your own resources');
  }
}
