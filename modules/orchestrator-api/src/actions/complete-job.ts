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
    const result = await OrchestrationService.complete(input.id, input.result, actor?.id);
    return result as ServiceResponse<Job>;
  }
}
