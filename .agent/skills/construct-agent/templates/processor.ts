import { JobProcessor } from '@nexical/agent/src/core/processor.js';
import type { AgentJob, AgentContext, AgentResult } from '@nexical/agent/src/core/types.js';
import { HookSystem } from '@/lib/modules/hooks';
import { z } from 'zod';

// 1. Define Input Schema
const InputSchema = z.object({
  targetId: z.string(),
});
type Input = z.infer<typeof InputSchema>;

/**
 * NAMING CONVENTION: Class MUST end with 'Processor'.
 */
export class __Name__Processor extends JobProcessor<Input> {
  // 2. Define Job Type (Unique ID)
  public jobType = '__module__.__action__';

  // 3. Define Schema (Required for validation)
  public schema = InputSchema;

  /**
   * RULE OF AUTHORITY:
   * Background agents MUST NOT import 'db' directly.
   * Use context.api (SDK) or import a Service class.
   */
  public async process(job: AgentJob<Input>, context: AgentContext): Promise<AgentResult | void> {
    const { targetId } = job.payload;

    // 4. Logic
    context.logger.info(`Processing ${targetId}`);

    // Perform logic via Service (Authority)...
    // e.g., await ProjectService.sync(targetId);

    // MANDATORY: Dispatch event for state changes
    await HookSystem.dispatch('__module__.processed', { targetId });

    // Return result if needed (stored in job history)
    return {
      status: 'completed',
      metadata: {
        processedId: targetId,
      },
    };
  }
}
