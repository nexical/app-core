import type { APIContext } from 'astro';
import type { ServiceResponse } from '@/types/service';
import { __Entity__OpsService } from '../services/__entity__-ops-service';
import type { __ActionInput__DTO, __ActionOutput__DTO } from '../sdk/types';

/**
 * Action Template
 *
 * Naming: {kebab-case}-{group}.ts
 * Location: src/actions/
 *
 * Rules:
 * 1. Must implement a static `run(input, context: APIContext)` method.
 * 2. Signature must be strictly typed (STRICTLY FORBIDDEN to use 'any'). Use DTOs from SDK.
 * 3. MUST check for actor authorization.
 * 4. Orchestrate multiple services; implement domain rules.
 * 5. NEVER import 'db' directly.
 * 6. Implement Enumeration Prevention for sensitive actions.
 */

export class __ActionName__Action {
  /**
   * Orchestrates the action logic.
   * @param input Typed DTO from SDK (Source of Truth: models.yaml)
   * @param context Astro API Context
   */
  public static async run(
    input: __ActionInput__DTO,
    context: APIContext,
  ): Promise<ServiceResponse<__ActionOutput__DTO>> {
    // 1. Extract Actor
    const actor = context.locals.actor;

    // 2. Authorization Check (MANDATORY)
    if (!actor) {
      return { success: false, error: 'service.error.unauthorized' };
    }

    // 3. Enumeration Prevention (For sensitive data)
    // If checking user existence, return generic success/fail keys to avoid leaking information.

    // 4. Orchestrate Services
    // Actions bridge multiple domain services or handle complex orchestration.
    const res = await __Entity__OpsService.processOperation(input.id, actor);

    if (!res.success) {
      // Return sanitized error key
      return { success: false, error: res.error };
    }

    return {
      success: true,
      data: res.data,
    };
  }
}
