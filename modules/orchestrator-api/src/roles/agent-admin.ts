import type { APIContext, AstroGlobal } from 'astro';

export class IsAdmin {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    const actor = context.locals?.actor;

    if (!actor) {
      throw new Error('Unauthorized: Login required');
    }

    if (actor.role !== 'ADMIN') {
      throw new Error('Forbidden: Admin access required');
    }
  }
}
