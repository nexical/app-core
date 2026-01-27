
import type { APIContext } from 'astro';
import { roleRegistry } from '../registries/role-registry';

export class ApiGuard {
    /**
     * Enforces a role check for API endpoints. 
     * Throws an error if validation fails (to be caught by defineApi).
     */
    public static async protect(
        context: APIContext,
        roleName: string,
        input: Record<string, any> = {},
        data?: any
    ): Promise<void> {
        const policy = roleRegistry.get(roleName);

        if (!policy) {
            console.error(`[ApiGuard] Role policy '${roleName}' not found in registry.`);
            throw new Error(`Role policy '${roleName}' not found`);
        }

        await policy.check(context, input, data);
    }
}
