import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { Prisma, Agent, Job } from '@prisma/client';

// Re-defining interface if not exported from Prisma or types
export interface AgentJobType {
  id: string;
  type: string;
  payload: unknown;
  status: string;
  retryCount: number;
}

export class OrchestrationService {
  // --- Job Orchestration ---

  static async poll(
    agentId: string,
    capabilities: string[],
    actorId?: string,
    actorType?: string,
  ): Promise<ServiceResponse<AgentJobType | null>> {
    try {
      const jobData = await db.$transaction(async (tx) => {
        const where: Prisma.JobWhereInput = {
          status: 'PENDING',
          type: { in: capabilities },
          // Only pick up jobs that are ready for retry (or never had a retry scheduled)
          OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
        };

        if (actorId) where.actorId = actorId;
        if (actorType) where.actorType = actorType;

        Logger.info(
          `[OrchestrationService.poll] Polling for agent: ${agentId}, capabilities: ${capabilities}, actorId: ${actorId}, actorType: ${actorType}`,
        );

        const job = await tx.job.findFirst({
          where,
          orderBy: { createdAt: 'asc' },
        });

        if (!job) {
          const allPending = await tx.job.findMany({
            where: { status: 'PENDING' },
            select: { id: true, type: true, actorId: true, actorType: true },
          });
          Logger.info(`[OrchestrationService.poll] No job found. Pending jobs in DB:`, {
            jobs: allPending,
          });
          return null;
        }

        Logger.info(`[OrchestrationService.poll] Found job: ${job.id} (${job.type})`);

        const updated = await tx.job.update({
          where: { id: job.id },
          data: {
            status: 'RUNNING',
            lockedBy: agentId,
            lockedAt: new Date(),
            startedAt: new Date(),
          },
        });

        return {
          id: updated.id,
          type: updated.type,
          payload: updated.payload,
          status: updated.status,
          retryCount: updated.retryCount,
        };
      });

      // Heartbeat Optimization: If we found a job OR if we didn't, we know the agent is alive.
      // But we only have agentId.
      // Update heartbeat asynchronously to not block response
      if (agentId) {
        // Determine normalized ID (if it's a UUID style or just a name)
        // The AgentService expects a DB ID.
        // Depending on how `poll` calls function.
        // We will attempt to update `lastHeartbeat` where `id` = `agentId`.
        // Swallow errors if agent doesn't exist (it might be a raw script not registered)
        db.agent
          .update({
            where: { id: agentId },
            data: { lastHeartbeat: new Date(), status: 'ONLINE' },
          })
          .catch(() => {});
      }

      Logger.info('OrchestrationService.poll: Job locked', { jobId: jobData?.id, agentId });
      return { success: true, data: jobData };
    } catch (error) {
      Logger.error('OrchestrationService.poll Error:', error, { agentId });
      return { success: false, error: 'orchestrator.service.error.poll_failed' };
    }
  }

  static async complete(
    id: string,
    result: unknown,
    actorId?: string,
    actorType?: string,
  ): Promise<ServiceResponse<Prisma.JobGetPayload<object>>> {
    try {
      // Security check
      if (actorId) {
        const job = await db.job.findUnique({ where: { id } });
        if (!job) return { success: false, error: 'orchestrator.service.error.not_found' };

        // Authorization: Owner or Locker
        // Allow completion if actor OWNS the job OR if actor LOCKED the job (Agent logic)
        const isOwner = job.actorId === actorId;
        const isLocker = job.lockedBy === actorId;

        if (!isOwner && !isLocker) {
          return { success: false, error: 'orchestrator.service.error.unauthorized' };
        }
      }

      const updatedJob = await db.job.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          result: result as Prisma.InputJsonValue,
          completedAt: new Date(),
          progress: 100,
        },
      });

      Logger.info('OrchestrationService.complete: Job completed', { jobId: id, actorId });
      await HookSystem.dispatch('job.completed', updatedJob);
      return { success: true, data: updatedJob };
    } catch (error) {
      Logger.error('OrchestrationService.complete Error:', error, { jobId: id });
      return { success: false, error: 'orchestrator.service.error.complete_failed' };
    }
  }

  static async fail(
    id: string,
    error: unknown,
    actorId?: string,
    actorType?: string,
  ): Promise<ServiceResponse<Job>> {
    try {
      // Fetch job first for authorization and retry logic
      const job = await db.job.findUnique({ where: { id } });
      if (!job) return { success: false, error: 'orchestrator.service.error.not_found' };

      // Security check
      if (actorId) {
        const isOwner = job.actorId === actorId;
        const isLocker = job.lockedBy === actorId;

        if (!isOwner && !isLocker) {
          return { success: false, error: 'orchestrator.service.error.unauthorized' };
        }
      }

      const newRetryCount = job.retryCount + 1;
      const canRetry = newRetryCount <= job.maxRetries;

      if (canRetry) {
        // Schedule retry with exponential backoff: 2^retryCount * baseDelay (1000ms)
        const baseDelayMs = 1000;
        const delayMs = Math.pow(2, job.retryCount) * baseDelayMs;
        const nextRetryAt = new Date(Date.now() + delayMs);

        Logger.info(
          `[OrchestrationService.fail] Scheduling retry ${newRetryCount}/${job.maxRetries} for job ${id} at ${nextRetryAt.toISOString()}`,
        );

        const updated = await db.job.update({
          where: { id },
          data: {
            status: 'PENDING', // Reset to PENDING for retry
            retryCount: newRetryCount,
            nextRetryAt,
            lockedBy: null, // Release lock
            lockedAt: null,
            error: error as Prisma.InputJsonValue, // Store last error
          },
        });

        await HookSystem.dispatch('job.retry_scheduled', {
          job: updated,
          retryCount: newRetryCount,
          nextRetryAt,
        });
        return { success: true, data: updated };
      }

      // Permanent failure - exhausted retries
      Logger.warn(
        `[OrchestrationService.fail] Job ${id} failed permanently after ${job.retryCount} retries`,
      );

      const updated = await db.job.update({
        where: { id },
        data: {
          status: 'FAILED',
          retryCount: newRetryCount,
          error: error as Prisma.InputJsonValue,
          completedAt: new Date(),
          progress: 0,
        },
      });

      Logger.info('OrchestrationService.fail: Job failed permanently', { jobId: id });
      await HookSystem.dispatch('job.failed', { id, error, finalFailure: true });
      return { success: true, data: updated };
    } catch (error) {
      Logger.error('OrchestrationService.fail Error:', error, { jobId: id });
      return { success: false, error: 'orchestrator.service.error.fail_failed' };
    }
  }

  /**
   * Cancel a job. Only the owner can cancel.
   */
  static async cancel(id: string, actorId?: string): Promise<ServiceResponse<Job>> {
    try {
      const job = await db.job.findUnique({ where: { id } });
      if (!job) return { success: false, error: 'orchestrator.service.error.not_found' };

      // Only PENDING or RUNNING jobs can be cancelled
      if (job.status !== 'PENDING' && job.status !== 'RUNNING') {
        return { success: false, error: 'orchestrator.service.error.job_not_cancellable' };
      }

      // Authorization: Only owner can cancel
      if (actorId && job.actorId !== actorId) {
        return { success: false, error: 'orchestrator.service.error.unauthorized' };
      }

      const updated = await db.job.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
          lockedBy: null,
          lockedAt: null,
        },
      });

      Logger.info(`[OrchestrationService.cancel] Job ${id} cancelled`);
      await HookSystem.dispatch('job.cancelled', { id });

      return { success: true, data: updated };
    } catch (error) {
      Logger.error('OrchestrationService.cancel Error:', error);
      return { success: false, error: 'orchestrator.service.error.cancel_failed' };
    }
  }

  // --- Agent Management ---

  static async registerAgent(data: Prisma.AgentCreateInput): Promise<ServiceResponse<Agent>> {
    try {
      let agent;
      // If ID is provided, try to upsert
      if (data.id) {
        agent = await db.agent.upsert({
          where: { id: data.id },
          create: data,
          update: {
            ...data,
            lastHeartbeat: new Date(),
            status: 'ONLINE',
          },
        });
      } else {
        // Otherwise create new
        agent = await db.agent.create({ data });
      }

      await HookSystem.dispatch('agent.registered', agent);
      return { success: true, data: agent };
    } catch (error) {
      Logger.error('OrchestrationService.registerAgent Error:', error);
      return { success: false, error: 'orchestrator.service.error.register_agent_failed' };
    }
  }

  // CLI/Script utility to wait for a job
  static async waitFor(
    jobId: string,
    timeoutMs = 30000,
  ): Promise<ServiceResponse<Prisma.JobGetPayload<object>>> {
    try {
      const start = Date.now();

      while (Date.now() - start < timeoutMs) {
        const job = await db.job.findUnique({ where: { id: jobId } });

        if (job?.status === 'COMPLETED') return { success: true, data: job };
        if (job?.status === 'FAILED')
          return { success: false, error: `Job ${jobId} failed: ${JSON.stringify(job.error)}` };

        // Wait 1s
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return { success: false, error: `Timeout waiting for job ${jobId}` };
    } catch (error) {
      Logger.error('OrchestrationService.waitFor Error:', error);
      return { success: false, error: 'orchestrator.service.error.wait_failed' };
    }
  }

  // --- Health Monitoring ---

  /**
   * Check for agents that haven't sent a heartbeat within the timeout period.
   * Marks them as OFFLINE and optionally releases their locked jobs.
   * @param timeoutMs - The heartbeat timeout in milliseconds (default: 60000 = 1 minute)
   */
  static async checkStaleAgents(
    timeoutMs = 60000,
  ): Promise<ServiceResponse<{ offlineAgents: number; releasedJobs: number }>> {
    try {
      const cutoffTime = new Date(Date.now() - timeoutMs);

      // Find agents with stale heartbeats
      const staleAgents = await db.agent.findMany({
        where: {
          status: 'ONLINE',
          lastHeartbeat: { lt: cutoffTime },
        },
        select: { id: true, hostname: true },
      });

      if (staleAgents.length === 0) {
        return { success: true, data: { offlineAgents: 0, releasedJobs: 0 } };
      }

      const staleAgentIds = staleAgents.map((a) => a.id);
      Logger.warn(
        `[OrchestrationService.checkStaleAgents] Marking ${staleAgents.length} agents as OFFLINE: ${staleAgents.map((a) => a.hostname).join(', ')}`,
      );

      // Mark agents as OFFLINE
      await db.agent.updateMany({
        where: { id: { in: staleAgentIds } },
        data: { status: 'OFFLINE' },
      });

      // Release jobs locked by stale agents (reset to PENDING)
      const releasedJobs = await db.job.updateMany({
        where: {
          lockedBy: { in: staleAgentIds },
          status: 'RUNNING',
        },
        data: {
          status: 'PENDING',
          lockedBy: null,
          lockedAt: null,
        },
      });

      Logger.info(
        `[OrchestrationService.checkStaleAgents] Released ${releasedJobs.count} jobs from offline agents`,
      );

      await HookSystem.dispatch('agents.stale_check', {
        offlineAgents: staleAgents.length,
        releasedJobs: releasedJobs.count,
      });

      return {
        success: true,
        data: { offlineAgents: staleAgents.length, releasedJobs: releasedJobs.count },
      };
    } catch (error) {
      Logger.error('OrchestrationService.checkStaleAgents Error:', error);
      return { success: false, error: 'orchestrator.service.error.check_stale_agents_failed' };
    }
  }

  /**
   * Heartbeat endpoint - updates agent's lastHeartbeat timestamp.
   */
  static async heartbeat(agentId: string): Promise<ServiceResponse<{ success: boolean }>> {
    try {
      await db.agent.update({
        where: { id: agentId },
        data: { lastHeartbeat: new Date(), status: 'ONLINE' },
      });
      return { success: true, data: { success: true } };
    } catch (error) {
      Logger.error('OrchestrationService.heartbeat Error:', error);
      return { success: false, error: 'orchestrator.service.error.heartbeat_failed' };
    }
  }

  // --- Progress Updates ---

  /**
   * Update the progress of a running job.
   * @param id - The job ID
   * @param progress - Progress percentage (0-100)
   * @param actorId - Optional actor ID for authorization
   */
  static async updateProgress(
    id: string,
    progress: number,
    actorId?: string,
  ): Promise<ServiceResponse<{ success: boolean }>> {
    try {
      const job = await db.job.findUnique({ where: { id } });
      if (!job) return { success: false, error: 'orchestrator.service.error.not_found' };

      // Authorization: Only the locker can update progress
      if (actorId && job.lockedBy !== actorId) {
        return { success: false, error: 'orchestrator.service.error.unauthorized' };
      }

      // Validate progress value
      const clampedProgress = Math.max(0, Math.min(100, Math.floor(progress)));

      await db.job.update({
        where: { id },
        data: { progress: clampedProgress },
      });

      Logger.info(`[OrchestrationService.updateProgress] Job ${id} progress: ${clampedProgress}%`);

      await HookSystem.dispatch('job.progress', { id, progress: clampedProgress });

      return { success: true, data: { success: true } };
    } catch (error) {
      Logger.error('OrchestrationService.updateProgress Error:', error);
      return { success: false, error: 'orchestrator.service.error.update_progress_failed' };
    }
  }
}
