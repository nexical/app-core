// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { FailJobDTO, Job } from '../sdk/types';
import type { APIContext } from 'astro';
import { OrchestrationService } from '../services/orchestration-service';

export class FailJobAction {
  public static async run(input: FailJobDTO, context: APIContext): Promise<ServiceResponse<Job>> {
    const actor = context.locals.actor;
    const actorId = actor?.role === 'ADMIN' ? undefined : actor?.id;
    const result = await OrchestrationService.fail(input.id, input.error, actorId);
    return result as ServiceResponse<Job>;
  }
}
