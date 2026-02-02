import { OrchestrationService } from '../services/orchestration-service';
import type { ServiceResponse } from '@/types/service';
import type { PollJobsDTO, Job } from '../sdk/types';
import type { Job } from '@prisma/client';
import type { APIContext } from 'astro';
import type { ApiActor } from '@/lib/api/api-docs';

export class PollJobsOrchestratorAction {
  public static async run(
    input: PollJobsDTO,
    context: APIContext,
  ): Promise<ServiceResponse<Job[]>> {
    try {
      const { capabilities } = input;

      // Resolve Actor from Context (if not in input)
      const actor: ApiActor = context.locals.actor;
      const actorId = input.actorId || actor?.id;
      const actorType = input.actorType || actor?.type;

      // Fix: Prioritize actorId (authenticated user/agent) over input.agentId.
      // This ensures that the entity locking the job is the same entity that will try to complete it.
      const lockId = actorId || input.agentId || 'unknown-agent';

      // If the actor is an AGENT, they should be able to pick up ANY job (worker pool).
      // If the actor is a USER, they likely only want to poll their OWN jobs.
      const isAgent = actor?.role === 'AGENT' || actor?.type === 'agent';

      // If Agent, don't filter by owner (pass undefined). If User, filter by owner (pass actorId).
      const filterActorId = isAgent ? undefined : actorId;
      const filterActorType = isAgent ? undefined : actorType;

      const result = await OrchestrationService.poll(
        lockId,
        Array.isArray(capabilities) ? capabilities : [capabilities],
        filterActorId,
        filterActorType,
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data) {
        return { success: true, data: [] };
      }

      return { success: true, data: [result.data] };
    } catch (error) {
      console.error('PollJobsOrchestratorAction Error:', error);
      return { success: false, error: 'orchestrator.action.error.poll_failed' };
    }
  }
}
