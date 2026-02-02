import {
  JobProcessor,
  type AgentJob,
  type AgentContext,
  type AgentResult,
} from '@nexical/agent/src/core/processor.js';
import { HookSystem } from '@/lib/modules/hooks';
// import { YourService } from '../services/your-service';
// import { YourPayloadSchema } from '@modules/your-module/sdk';

/**
 * TemplateProcessor
 * File MUST be named: kebab-case.ts (e.g., sync-project.ts)
 *
 * CRITICAL: Payloads MUST be defined in models.yaml (db: false, api: false)
 * and imported from the SDK. Inline schemas are FORBIDDEN.
 */
export class TemplateProcessor extends JobProcessor<any> {
  public jobType = 'module.job-name';

  // @ts-ignore - Handle Zod version mismatch
  public schema = any; // Replace 'any' with YourPayloadSchema from SDK

  public async process(job: AgentJob<any>, context: AgentContext): Promise<AgentResult | void> {
    const { payload } = job;
    const { logger } = context;

    // 1. Delegate to Service Layer
    // const res = await YourService.handle(payload);

    // 2. REQUIRED: All service/SDK calls return a ServiceResponse wrapper.
    // You MUST check success before accessing data.
    /*
    if (!res.success) {
      // Throwing triggers the queue's retry logic
      throw new Error(`Job failed: ${res.error?.message || 'Unknown error'}`);
    }

    const { data } = res;
    */

    // 3. Return AgentResult
    return {
      success: true,
      data: {
        /* result data */
      },
    };
  }
}
