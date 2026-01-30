import { z } from 'zod';
import { JobProcessor, type AgentJob, type AgentContext, type AgentResult } from '@nexical/agent';
import { EntityOpsService } from '../services/entity-ops-service';

/**
 * AGENT JOB PROCESSOR TEMPLATE
 *
 * LOCATION: modules/{name}/src/agent/
 *
 * STRICT RULES:
 * 1. NEVER import 'db' or 'prisma' here. Use Services or context.api.
 * 2. MUST define a 'public static jobType' string. (NOT an instance property).
 * 3. MUST define a Zod 'schema' for job data validation.
 * 4. Use 'context.api' for cross-module data access.
 * 5. Access payload via 'job.payload'.
 */
export class EntitySyncProcessor extends JobProcessor<{ entityId: string }> {
  /**
   * MANDATORY: Unique identifier for the job type.
   * MUST be static.
   */
  public static jobType = 'entity.sync';

  /**
   * MANDATORY: Zod schema for the job payload.
   * Ensures the processor is safe from malformed queue data.
   */
  public schema = z.object({
    entityId: z.string().uuid(),
  });

  /**
   * Core processing logic.
   */
  public async process(
    job: AgentJob<{ entityId: string }>,
    context: AgentContext,
  ): Promise<AgentResult | void> {
    // CRITICAL: Use job.payload, not job.data
    const { entityId } = job.payload;

    // Use context.logger for job-specific logging
    context.logger.info(`Starting sync for entity: ${entityId}`);

    // Agents act as a system actor
    const systemActor = { id: 'system', role: 'system' } as any;

    // 1. Data Retrieval (via Service)
    // We call the service method which accepts an actor.
    const entityResult = await EntityOpsService.getById(entityId, systemActor);

    if (!entityResult.success || !entityResult.data) {
      throw new Error(`Entity ${entityId} not found for sync.`);
    }

    // 2. Cross-Module Logic (via Federated SDK/context.api)
    // Note: We use context.api to respect modular boundaries.
    const otherData = await context.api.otherModule.getData.query({ id: entityId });

    if (!otherData.success) {
      return {
        success: false,
        error: `Failed to fetch data from other module: ${otherData.error}`,
      };
    }

    // 3. Update (via Service)
    const updateResult = await EntityOpsService.update(
      entityId,
      { syncedAt: new Date() },
      systemActor,
    );

    return {
      success: updateResult.success,
      data: updateResult.data,
    };
  }
}
