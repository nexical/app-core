import type { APIContext } from 'astro';
import type { ServiceResponse } from '@/types/service';
import { getTranslation } from '@/lib/core/i18n';
import { __Entity__Service } from '../services/__entity__-service';
import type { __ActionInput__DTO, __ActionOutput__DTO } from '../sdk/types';

/**
 * Action Template (Gateway Logic)
 *
 * NOTE: This file is generated via `nexical gen api {module}` based on api.yaml.
 * Actions act as GATEWAYS. They MUST NOT contain business logic or direct DB calls.
 *
 * Rules:
 * 1. Must implement a static `run(input, context: APIContext)` method.
 * 2. Delegate business logic to a Service class.
 * 3. Handle actor extraction and authorization delegation.
 * 4. Use `getTranslation()` for user-facing strings/errors if needed before service call.
 */

export class __ActionName__Action {
  /**
   * Orchestrates the action logic by delegating to a service.
   * @param input Typed DTO from SDK (Source of Truth: api.yaml)
   * @param context Astro API Context
   */
  public static async run(
    input: __ActionInput__DTO,
    context: APIContext,
  ): Promise<ServiceResponse<__ActionOutput__DTO>> {
    const actor = context.locals.actor;
    const translate = await getTranslation();

    // 1. Authorization Check (Basic check or delegation to RolePolicy)
    if (!actor) {
      return { success: false, error: 'service.error.unauthorized' };
    }

    // 2. Service Delegation (Engines handle the logic)
    const response = await __Entity__Service.__method__(input, actor);

    // 3. Response Mapping
    if (!response.success) {
      return {
        success: false,
        error: response.error || translate('service.error.generic'),
      };
    }

    return {
      success: true,
      data: response.data as __ActionOutput__DTO,
    };
  }
}
