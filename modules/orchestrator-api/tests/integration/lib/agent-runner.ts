import { db } from '@/lib/core/db';
import crypto from 'node:crypto';
import type { AgentWorker, AgentJob, AgentContext } from '@modules/orchestrator-api/src/types';
import { NexicalClient } from '@nexical/sdk';

/**
 * AgentRunner: A utility to execute Agent Workers within an Integration Test environment.
 * It mimics the behavior of the real Agent process (fetching context, setting up API, logging).
 */
export class AgentRunner {
  /**
   * Executes a worker handler against a specific Job ID in the database.
   * Use this for Integration Tests where side-effects (DB updates, File I/O) matter.
   */
  static async run(
    worker: AgentWorker,
    jobId: string,
    options: {
      logger?: AgentContext['logger'];
      agentToken?: string;
      baseUrl?: string;
    } = {},
  ) {
    // 1. Fetch Job
    const jobData = await db.job.findUnique({ where: { id: jobId } });
    if (!jobData) throw new Error(`Job ${jobId} not found`);

    if (jobData.type !== worker.jobType) {
      console.warn(
        `[AgentRunner] Warning: Job type '${jobData.type}' does not match worker type '${worker.jobType}'`,
      );
    }

    // 2. Build Context
    const baseUrl = options.baseUrl || process.env.API_URL || 'http://localhost:4322';
    const secret = options.agentToken || process.env.AGENT_API_TOKEN || 'test-secret';

    // Emulate Agent Auth
    const api = new NexicalClient({
      baseUrl,
      authStrategy: {
        getHeaders: async () => ({ Authorization: `Bearer ${secret}` }),
      },
    });

    const context: AgentContext = {
      logger: options.logger || console,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api: api as any, // Cast to match the AgentContext type (which might be 'any' or 'NexicalClient')
    };

    const job: AgentJob = {
      id: jobData.id,
      type: jobData.type,
      payload: jobData.payload,
    };

    // 3. Run Handler
    // The handler usually returns void or result. The Agent Main loop handles logging result.
    // We return it here for assertion.
    try {
      return await worker.handler(job, context);
    } catch (error) {
      console.error(`[AgentRunner] Worker failed:`, error);
      throw error;
    }
  }

  /**
   * Executes a worker with a manual payload, bypassing the Database lookup.
   * Use this for Unit Tests of the worker logic.
   */
  static async invoke(
    worker: AgentWorker,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    contextOverrides: Partial<AgentContext> = {},
  ) {
    const job: AgentJob = {
      id: 'mock-job-' + crypto.randomUUID(),
      type: worker.jobType,
      payload,
    };

    // Mock API if not provided
    const context: AgentContext = {
      logger: console,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api: {} as any, // Mock API
      ...contextOverrides,
    };

    return worker.handler(job, context);
  }
}
