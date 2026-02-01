import type { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

export class PublicPolicy implements RolePolicy {
   
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: any,
  ): Promise<void> {
    // Public access allowed.
    return;
  }
}
