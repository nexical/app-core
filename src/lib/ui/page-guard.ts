import type { AstroGlobal } from 'astro';
import { roleRegistry } from '../registries/role-registry';

export interface PagePermission {
  check(context: AstroGlobal, input?: any): Promise<void>;
  redirect?(context: AstroGlobal, input?: any): Promise<Response | undefined>;
}

export class PageGuard {
  /**
   * Enforces a role check. If failed, attempts to call the Role's redirect method.
   */
  public static async protect(
    context: AstroGlobal,
    RoleClassOrName: any | string,
    input: Record<string, any> = {},
    data?: any,
  ): Promise<Response | undefined | void> {
    let RoleClass = RoleClassOrName;

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
        return RoleClass.redirect(context, input, data);
      }

      // Fallback default: If "Unauthorized", redirect to login
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return context.redirect('/login');
      }

      // Fallback default: Forbidden
      return context.redirect('/?error=forbidden');
    }
  }
}
