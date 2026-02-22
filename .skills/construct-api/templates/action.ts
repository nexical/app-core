/**
 * Action: __kebab-case__-__group__.ts
 * Orchestrates business logic across services.
 *
 * RULE: MUST use the 'public static async run(input: unknown, context: APIContext)' signature.
 * RULE: MUST define a 'static schema' (Zod) for input validation.
 * RULE: MUST NOT access 'db' directly. Delegate to Services.
 * RULE: Naming convention is {kebab-case}-{group}.ts (e.g., register-auth.ts).
 */
import { z } from 'zod';
import type { APIContext } from 'astro';
import type { ServiceResponse } from '@/types/service';
// IMPORT types from your SDK
// import type { __InputDTO__, __OutputDTO__ } from '../sdk/types';
import { __ServiceName__ } from '../services/__model__-service';

export class __ActionName__Action {
  /**
   * Input validation schema.
   */
  public static schema = z.object({
    // Define your schema here
    // id: z.string().cuid(),
  });

  /**
   * Orchestrates the business logic.
   * @param input - Raw input from the request.
   * @param context - Astro Context for authorization and metadata.
   */
  public static async run(input: unknown, context: APIContext): Promise<ServiceResponse<unknown>> {
    // 1. Validate Input
    const data = this.schema.parse(input);

    // 2. Actor Verification
    const actor = context.locals?.actor;
    if (!actor) {
      return { success: false, error: 'core.service.error.unauthorized' };
    }

    // Example: Differentiate behavior for Users vs Agents
    // if (actor.type === 'agent') {
    //    // Logic specific to autonomous agents
    // }

    // 3. Orchestration
    // Call Services to perform logic.
    // RULE: NEVER import '@/lib/core/db' in an Action.
    // RULE: NEVER import another Service from a Service. Orchestrate here.
    const result = await __ServiceName__.create(actor, data);

    // 4. Trigger side effects or cross-module logic (Hooks/other Services)
    // if (result.success) {
    //    await HookSystem.dispatch('module.event', { id: result.data.id });
    // }

    return result;
  }
}
