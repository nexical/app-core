// GENERATED CODE - DO NOT MODIFY
// Manual Action - Update Job Progress
import type { APIContext } from 'astro';
import type { ServiceResponse } from '@/types/service';
import type { UpdateProgressDTO } from '../sdk/types';
import { OrchestrationService } from '../services/orchestration-service';

/**
 * Action to update job progress.
 */
export class UpdateProgressJobAction {
  public static async run(
    input: UpdateProgressDTO,
    context: APIContext,
  ): Promise<ServiceResponse<void>> {
    const actor = context.locals.actor;
    const actorId = actor?.role === 'ADMIN' ? undefined : actor?.id;

    const result = await OrchestrationService.updateProgress(input.id, input.progress, actorId);

    return result.success ? { success: true } : { success: false, error: result.error };
  }
}
