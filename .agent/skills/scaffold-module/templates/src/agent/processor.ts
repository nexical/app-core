import { JobProcessor } from '@nexical/agent/src/core/processor.js';
import type { AgentJob, AgentContext, AgentResult } from '@nexical/agent/src/core/types.js';
import { z } from 'zod';

export const JobPayloadSchema = z.object({
  id: z.string(),
});

export class CustomProcessor extends JobProcessor<z.infer<typeof JobPayloadSchema>> {
  public jobType = 'feature.custom-task';
  public schema = JobPayloadSchema;

  /**
   * RULE: NEVER import 'db' in an Agent.
   * Use 'this.api' or imported Services for data access.
   */
  public async process(
    job: AgentJob<z.infer<typeof JobPayloadSchema>>,
    context: AgentContext,
  ): Promise<AgentResult | void> {
    const { payload } = job;
    const logger = context.logger || this.logger;

    logger.info(`Processing task for ID: ${payload.id}`);

    // Logic here...

    return {
      success: true,
      data: { processed: true },
    };
  }
}
