// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { CompleteJobDTO, Job } from '../sdk/types';
import type { APIContext } from 'astro';
import { OrchestrationService } from '../services/orchestration-service';

export class CompleteJobAction {
  public static async run(
    input: CompleteJobDTO,
    context: APIContext,
  ): Promise<ServiceResponse<Job>> {
    const actor = context.locals.actor;
    const actorId = actor?.role === 'ADMIN' ? undefined : actor?.id;
    const result = await OrchestrationService.complete(input.id, input.result, actorId);
    return result as ServiceResponse<Job>;
  }
}
