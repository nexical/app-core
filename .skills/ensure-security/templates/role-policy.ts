import { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

/**
 * TEMPLATE: Role Policy
 *
 * Instructions:
 * 1. Rename the class to match your policy (e.g., `ProjectMemberPolicy`).
 * 2. Define the input type. This represents the COMBINED input from body, query, and params.
 * 3. Implement the `check` method. Throw an Error if validation fails.
 * 4. Place this file in `src/roles/`.
 *
 * CRITICAL: Policies MUST NOT import 'db' directly. Use Services to verify access.
 */
export class __NAME__Policy implements RolePolicy<{ __INPUT_ID__: string }> {
  /**
   * @param context The current API or Page context.
   * @param input The combined input payload (body + query + params).
   * @param data Optional: The pre-fetched data from the database.
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

    // 1. Attribute-Based Check (Using Combined Input)
    // Check if the actor has rights to the specific resource ID passed in URL or Body
    // if (input.__INPUT_ID__ === actor.id) return;

    // 2. Post-Fetch Ownership Check
    // If the API handler already fetched the data, verify ownership here.
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      // Example: Ensure actor owns the record
      if (record.ownerId === actor.id) return;
    }

    // 3. Service-Based Verification
    // Use a Service for complex lookups (e.g., checking team membership).
    // const response = await TeamService.isMember(actor.id, input.teamId);
    // if (!response.success) throw new Error('Access Denied');
  }
}
