import type { AstroGlobal, APIContext } from 'astro';
import { roleRegistry, type RolePolicy } from '../registries/role-registry';

export interface PagePermission {
  check(
    context: AstroGlobal | APIContext,
    input?: Record<string, unknown>,
    data?: unknown,
  ): Promise<void>;
  redirect?(
    context: AstroGlobal | APIContext,
    input?: Record<string, unknown>,
    data?: unknown,
  ): Promise<Response | undefined>;
}

export class PageGuard {
  /**
   * Enforces a role check. If failed, attempts to call the Role's redirect method.
   */
  public static async protect(
    context: AstroGlobal | APIContext,
    RoleClassOrName: PagePermission | RolePolicy | string,
    input: Record<string, unknown> = {},
    data?: unknown,
  ): Promise<Response | undefined | void> {
    let RoleClass: PagePermission | RolePolicy = RoleClassOrName as PagePermission | RolePolicy;

    if (typeof RoleClassOrName === 'string') {
      const policy = roleRegistry.get(RoleClassOrName);
      if (!policy) {
        console.error(`[PageGuard] Role policy '${RoleClassOrName}' not found in registry.`);
        throw new Error(`Role policy '${RoleClassOrName}' not found`);
      }
      RoleClass = policy;
    }

    try {
      // Support both old signature (context, input) and new (context, input, data)
      // But prefer passing strict types if possible.
      await RoleClass.check(context, input, data);
    } catch (error) {
      // If the role class has a specific redirect strategy, use it
      if (RoleClass.redirect) {
        const result = await RoleClass.redirect(context, input, data);
        if (typeof result === 'string') {
          return context.redirect(result);
        }
        return result;
      }

      // Fallback default: If "Unauthorized", redirect to login
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return context.redirect('/login');
      }

      // Fallback default: Forbidden
      return (context as any).redirect('/?error=forbidden');
    }
  }
}
