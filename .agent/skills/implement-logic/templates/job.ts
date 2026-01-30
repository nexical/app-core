import { JobProcessor } from '@nexical/agent/src/core/processor.js';
import type { AgentJob, AgentContext, AgentResult } from '@nexical/agent/src/core/types.js';
import { __Entity__OpsService } from '../services/__entity__-ops-service';

/**
 * JobProcessor Template
 *
 * Location: src/agent/
 * Naming: {kebab-case}.ts
 *
 * Rules:
 * 1. Extend JobProcessor<T> with a SPECIFIC DTO type.
 * 2. PAYLOADS MUST BE DEFINED IN models.yaml (db: false, api: false).
 * 3. Import schema and type from the generated SDK (../sdk/types).
 * 4. Inline Zod schemas are STRICTLY FORBIDDEN in agent files.
 * 5. NEVER import 'db'. Use Services or this.api (Federated SDK).
 */

// Import the specific DTO and Schema from the module's SDK
import { __JobPayload__Schema, type __JobPayload__DTO } from '../sdk/types';

export class __JobName__Processor extends JobProcessor<__JobPayload__DTO> {
  public readonly jobType = '__module__.__job_name__';
  public readonly schema = __JobPayload__Schema;

  async process(
    job: AgentJob<__JobPayload__DTO>,
    context: AgentContext,
  ): Promise<AgentResult | void> {
    const { payload } = job;
    const logger = context.logger || this.logger;

    logger.info(`Processing job ${job.id} for entity ${payload.id}`);

    // 1. Logic Delegation
    // Pass payload fields to the domain service.
    // Agents run in a system context, pass null or a system actor if the service requires it.
    const res = await __Entity__OpsService.processOperation(payload.id);

    if (!res.success) {
      throw new Error(`Job failed: ${res.error}`);
    }

    return {
      success: true,
      data: { id: payload.id },
    };
  }
}
