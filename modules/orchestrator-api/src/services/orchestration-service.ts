import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { Prisma, Agent } from '@prisma/client';

// Re-defining interface if not exported from Prisma or types
export interface AgentJobType {
  id: string;
  type: string;
  payload: unknown;
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
          Logger.info(`[OrchestrationService.poll] No job found. Pending jobs in DB:`, allPending);
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

      return { success: true, data: jobData };
    } catch (error) {
      Logger.error('OrchestrationService.poll Error:', error);
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
        const isOwner =
          job.actorId === actorId ||
          (actorType && job.actorType === actorType && job.actorId === actorId);
        const isLocker = job.lockedBy === actorId;

        if (!isOwner && !isLocker) {
          return { success: false, error: 'orchestrator.service.error.unauthorized' };
        }
      }

      const updatedJob = await db.job.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          result,
          completedAt: new Date(),
          progress: 100,
        },
      });

      await HookSystem.dispatch('job.completed', updatedJob);
      return { success: true, data: updatedJob };
    } catch (error) {
      Logger.error('OrchestrationService.complete Error:', error);
      return { success: false, error: 'orchestrator.service.error.complete_failed' };
    }
  }

  static async fail(
    id: string,
    error: unknown,
    actorId?: string,
    actorType?: string,
  ): Promise<ServiceResponse<Prisma.JobGetPayload<object>>> {
    try {
      // Security check
      if (actorId) {
        const job = await db.job.findUnique({ where: { id } });
        if (!job) return { success: false, error: 'orchestrator.service.error.not_found' };

        // Authorization: Owner or Locker
        const isOwner = job.actorId === actorId;
        const isLocker = job.lockedBy === actorId;

        if (!isOwner && !isLocker) {
          return { success: false, error: 'orchestrator.service.error.unauthorized' };
        }
      }

      await db.job.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: error as Prisma.InputJsonValue,
          completedAt: new Date(),
          progress: 0,
        },
      });
      const updated = await db.job.findUnique({ where: { id } });
      await HookSystem.dispatch('job.failed', { id, error });
      return { success: true, data: updated as unknown as Prisma.JobGetPayload<object> };
    } catch (error) {
      Logger.error('OrchestrationService.fail Error:', error);
      return { success: false, error: 'orchestrator.service.error.fail_failed' };
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
}
