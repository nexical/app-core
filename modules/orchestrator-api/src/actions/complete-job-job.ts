import { OrchestrationService } from '../services/orchestration-service';
import type { ServiceResponse } from '@/types/service';
import type { CompleteJobDTO, Job } from '../sdk/types';
import type { APIContext } from 'astro';

export class CompleteJobJobAction {
  public static async run(
    input: CompleteJobDTO,
    context: APIContext,
  ): Promise<ServiceResponse<Job>> {
    try {
      const { id } = context.params;
      const { result } = input;
      const actor = context.locals.actor || (context as unknown as { user: { id: string } }).user;
      const actorId = actor?.id;
      const actorType =
        ((context.locals as Record<string, unknown>).actorType as string | undefined) ||
        (actor?.id ? 'user' : undefined);

      if (!id) return { success: false, error: 'orchestrator.action.error.missing_id' };

      const updateRes = await OrchestrationService.complete(id, result, actorId, actorType);
      if (!updateRes.success) {
        return updateRes;
      }

      return { success: true, data: updateRes.data };
    } catch (error) {
      console.error('CompleteJobJobAction Error:', error);
      return {
        success: false,
        error: 'orchestrator.action.error.complete_failed',
      };
    }
  }
}
