import { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

/**
 * TEMPLATE: Role Policy
 *
 * Instructions:
 * 1. Rename the class to match your policy (e.g., `TeamEditorPolicy`).
 * 2. Define the input type (e.g., `{ teamId: string }`).
 * 3. Implement the `check` method. Throw an Error if validation fails.
 * 4. Place this file in `src/roles/`. It will be auto-discovered by the generated `server-init.ts`.
 *
 * CRITICAL: Policies MUST NOT import 'db' directly. Use Services to verify access.
 */
export class __NAME__Policy implements RolePolicy<{ __INPUT_ID__: string }> {
  /**
   * @param context The current API or Page context.
   * @param input The raw input payload from the request.
   * @param data Optional: The pre-fetched data from the database (for post-fetch checks).
   */
  async check(
    context: APIContext | AstroGlobal,
    input: { __INPUT_ID__: string },
    data?: unknown,
  ): Promise<void> {
    const actor = context.locals?.actor;
    if (!actor) {
      throw new Error('User must be authenticated');
    }

    // 1. "Myself" / Ownership Check Pattern (Post-Fetch)
    // If 'data' is provided, check ownership against the fetched record.
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      // Adjust field name (e.g., userId, ownerId) based on your model
      if (record.userId === actor.id) return;
    }

    // 2. Input-Based ID Check (Pre-Fetch)
    // if (input.__INPUT_ID__ === actor.id) return;

    // 3. Service-Based Verification
    // Use a Service to check permissions or data ownership.
    // const response = await __MODEL__Service.verifyAccess(actor.id, input.__INPUT_ID__);

    // if (!response.success) {
    //   throw new Error(response.error?.message || 'Access Denied');
    // }
  }
}
