import { JobProcessor } from '@nexical/agent/src/core/processor.js';
import type { AgentJob, AgentContext, AgentResult } from '@nexical/agent/src/core/types.js';
import { db } from '@/lib/core/db';
import { __JobPayload__Schema, type __JobPayload__DTO } from '../sdk/types';

/**
 * JobProcessor Template
 *
 * Location: src/agent/
 *
 * Rules:
 * 1. Extend JobProcessor<T> with a SPECIFIC DTO type.
 * 2. PAYLOADS MUST BE DEFINED IN models.yaml (db: false, api: false).
 * 3. Direct 'db' access is permitted (Universal Access).
 * 4. Logic delegation to Services is still recommended for reusable logic.
 */

export class __JobName__Processor extends JobProcessor<__JobPayload__DTO> {
  public readonly jobType = '__module__.__job_name__';
  public readonly schema = __JobPayload__Schema;

  async process(
    job: AgentJob<__JobPayload__DTO>,
    context: AgentContext,
  ): Promise<AgentResult | void> {
    const { payload } = job;
    const logger = context.logger || this.logger;

    logger.info(`Processing job ${job.id}`);

    // Direct DB access example
    await db.__entity__.update({
      where: { id: payload.id },
      data: { status: 'PROCESSED' },
    });

    return {
      success: true,
      data: { id: payload.id },
    };
  }
}
