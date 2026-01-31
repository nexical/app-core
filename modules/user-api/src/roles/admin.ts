import type { RolePolicy } from '@/lib/registries/role-registry';
import { type APIContext, type AstroGlobal } from 'astro';

export class IsAdmin implements RolePolicy {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    const user = context.locals?.actor;

    if (!user) {
      throw new Error('Unauthorized: Login required');
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Forbidden: Admin access required');
    }
  }
}
