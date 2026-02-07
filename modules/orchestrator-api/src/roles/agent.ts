import type { RolePolicy } from '@/lib/registries/role-registry';
import { type APIContext, type AstroGlobal } from 'astro';

export class IsAgent implements RolePolicy {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    const actor = context.locals?.actor;
    if (!actor) {
      throw new Error('Unauthorized: Login required');
    }

    const a = actor as { type?: string; role?: string };
    if (a.type !== 'agent' && a.role !== 'AGENT' && a.role !== 'ADMIN') {
      throw new Error('Forbidden: Agent role required');
    }
  }
}
