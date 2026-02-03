import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { HookSystem } from '@/lib/modules/hooks';
import type { ServiceResponse } from '@/types/service';

/**
 * Dead-letter queue entry for a permanently failed job.
 */
export interface DeadLetterEntry {
  id: string;
  originalJobId: string;
  type: string;
  payload: unknown;
  error: unknown;
  failedAt: Date;
  retryCount: number;
  reason?: string;
  actorId?: string;
  actorType?: string;
}

/**
 * Service for managing the dead-letter queue.
 * Permanently failed jobs are archived here for later analysis or manual retry.
 */
export class DeadLetterQueueService {
  /**
   * Archive a failed job to the dead-letter queue.
   */
  static async archive(entry: {
    originalJobId: string;
    type: string;
    payload: unknown;
    error: unknown;
    retryCount: number;
    reason?: string;
    actorId?: string;
    actorType?: string;
  }): Promise<ServiceResponse<DeadLetterEntry>> {
    try {
      const dlqEntry = await db.deadLetterJob.create({
        data: {
          originalJobId: entry.originalJobId,
          type: entry.type,
          payload: entry.payload as object,
          error: entry.error as object,
          retryCount: entry.retryCount,
          reason: entry.reason,
          actorId: entry.actorId,
          actorType: entry.actorType,
        },
      });

      Logger.info('DeadLetterQueueService.archive: Job archived', {
        originalJobId: entry.originalJobId,
        type: entry.type,
        reason: entry.reason,
      });

      await HookSystem.dispatch('deadletter.archived', {
        id: dlqEntry.id,
        originalJobId: entry.originalJobId,
        type: entry.type,
      });

      return { success: true, data: dlqEntry as DeadLetterEntry };
    } catch (error) {
      Logger.error('DeadLetterQueueService.archive Error:', error);
      return { success: false, error: 'deadletter.service.error.archive_failed' };
    }
  }

  /**
   * List dead-letter queue entries.
   */
  static async list(params?: {
    take?: number;
    skip?: number;
    type?: string;
  }): Promise<ServiceResponse<DeadLetterEntry[]>> {
    try {
      const { take = 50, skip = 0, type } = params || {};
      const where = type ? { type } : {};

      const entries = await db.deadLetterJob.findMany({
        where,
        take,
        skip,
        orderBy: { failedAt: 'desc' },
      });

      return { success: true, data: entries as DeadLetterEntry[] };
    } catch (error) {
      Logger.error('DeadLetterQueueService.list Error:', error);
      return { success: false, error: 'deadletter.service.error.list_failed' };
    }
  }

  /**
   * Retry a dead-letter job by creating a new job from it.
   */
  static async retry(id: string): Promise<ServiceResponse<{ newJobId: string }>> {
    try {
      const dlqEntry = await db.deadLetterJob.findUnique({ where: { id } });
      if (!dlqEntry) {
        return { success: false, error: 'deadletter.service.error.not_found' };
      }

      // Create new job from dead-letter entry
      const newJob = await db.job.create({
        data: {
          type: dlqEntry.type,
          payload: dlqEntry.payload ?? {},
          actorId: dlqEntry.actorId,
          actorType: dlqEntry.actorType,
          status: 'PENDING',
          retryCount: 0,
          maxRetries: 3,
        },
      });

      // Remove from dead-letter queue
      await db.deadLetterJob.delete({ where: { id } });

      Logger.info('DeadLetterQueueService.retry: Job retried', {
        dlqId: id,
        newJobId: newJob.id,
        type: dlqEntry.type,
      });

      await HookSystem.dispatch('deadletter.retried', {
        dlqId: id,
        newJobId: newJob.id,
      });

      return { success: true, data: { newJobId: newJob.id } };
    } catch (error) {
      Logger.error('DeadLetterQueueService.retry Error:', error);
      return { success: false, error: 'deadletter.service.error.retry_failed' };
    }
  }

  /**
   * Purge old entries from the dead-letter queue.
   */
  static async purge(olderThanDays: number = 30): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const result = await db.deadLetterJob.deleteMany({
        where: { failedAt: { lt: cutoff } },
      });

      Logger.info('DeadLetterQueueService.purge: Old entries deleted', {
        deleted: result.count,
        olderThanDays,
      });

      return { success: true, data: { deleted: result.count } };
    } catch (error) {
      Logger.error('DeadLetterQueueService.purge Error:', error);
      return { success: false, error: 'deadletter.service.error.purge_failed' };
    }
  }
}
