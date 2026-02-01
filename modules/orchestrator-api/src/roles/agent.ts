import type { RolePolicy } from '@/lib/registries/role-registry';
import { type APIContext, type AstroGlobal } from 'astro';

export class IsAgent implements RolePolicy {
   
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: any,
  ): Promise<void> {
    const actor = context.locals?.actor;

    if (!actor) {
      throw new Error('Unauthorized: Login required');
    }
  }
}
