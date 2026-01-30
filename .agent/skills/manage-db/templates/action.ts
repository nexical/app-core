import { z } from 'zod';
import type { APIContext } from 'astro';
import { EntityOpsService } from '../services/entity-ops-service';
import type { ServiceResponse } from '@/types/service';

/**
 * ACTION TEMPLATE: Orchestration Layer
 * Actions handle validation and multi-service workflows.
 *
 * LOCATION: modules/{name}/src/actions/
 *
 * STRICT RULES:
 * 1. NEVER import 'db' or 'prisma' here. Use Services.
 * 2. ALWAYS define a 'static schema' for input validation.
 * 3. ALWAYS perform 'this.schema.parse(input)' inside .run().
 * 4. ALWAYS verify 'context.locals.actor' exists.
 * 5. Naming: Filename must be {kebab-case}.ts. Class name PascalCase.
 * 6. MUST be a stateless class with static methods.
 */
export class SyncEntityAction {
  /**
   * MANDATORY: Zod schema for input validation.
   * This is used to guarantee type safety and prevent injection/malformed data.
   */
  static schema = z.object({
    id: z.string().uuid(),
    data: z.record(z.unknown()),
  });

  /**
   * Main entry point for the action.
   */
  static async run(
    input: unknown, // Use unknown to force validation
    context: APIContext,
  ): Promise<ServiceResponse<unknown>> {
    // 1. MANDATORY VALIDATION
    // This ensures we catch malformed input immediately.
    const payload = this.schema.parse(input);

    // 2. MANDATORY AUTHORIZATION
    // Actions are bridge layers; they must verify the actor.
    const actor = context.locals.actor;
    if (!actor) {
      return { success: false, error: 'Unauthorized: No actor found in context.' };
    }

    // 3. Orchestration
    // Pass the validated payload and the full actor object to the Service.
    const result = await EntityOpsService.update(payload.id, payload.data, actor);

    if (!result.success) {
      return { success: false, error: `Sync failed: ${result.error}` };
    }

    return { success: true, data: result.data };
  }
}
