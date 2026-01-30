/**
 * Action: __kebab-case__-__group__.ts
 * Orchestrates business logic across services.
 *
 * RULE: MUST use the 'public static async run(input, context: APIContext)' signature.
 * RULE: Naming convention is {kebab-case}-{group}.ts (e.g., register-auth.ts).
 * RULE: Import DTO types from the module's SDK.
 */
import type { APIContext } from 'astro';
import type { ServiceResponse } from '@/types/service';
// IMPORT types from your SDK
// import type { __InputDTO__, __OutputDTO__ } from '../sdk/types';
import { __ServiceName__ } from '../services/__model__-service';

export class __ActionName__Action {
  /**
   * Orchestrates the business logic.
   * @param input - Typed input DTO (validated by the Endpoint layer).
   * @param context - Astro Context for authorization and metadata.
   */
  public static async run(input: any, context: APIContext): Promise<ServiceResponse<any>> {
    const actor = context.locals?.actor;

    // Orchestration Example:
    // 1. Direct 'db' access is permitted for simple orchestration if needed.
    // 2. Call Service A
    const result = await __ServiceName__.create(input);

    // 3. Trigger side effects or cross-module logic (Hooks/other Services)
    // if (result.success) {
    //    await HookSystem.dispatch('module.event', { id: result.data.id });
    // }

    return result;
  }
}
