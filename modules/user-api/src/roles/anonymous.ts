import type { RolePolicy } from '@/lib/registries/role-registry';
import { type APIContext, type AstroGlobal } from 'astro';

export class IsAnonymous implements RolePolicy {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    _data?: unknown,
  ): Promise<void> {
    const user = context.locals?.actor;

    if (user) {
      throw new Error('Forbidden: Only guests allowed');
    }
  }

  async redirect(context: AstroGlobal | APIContext) {
    return (context as APIContext).redirect('/');
  }
}
