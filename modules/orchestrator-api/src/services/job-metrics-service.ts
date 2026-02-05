import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { HookSystem } from '@/lib/modules/hooks';

/**
 * Job metrics snapshot for dashboard and monitoring.
 */
export interface JobMetrics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  avgCompletionTimeMs?: number;
  retryRate: number;
  successRate: number;
}

/**
 * Agent metrics snapshot for dashboard and monitoring.
 */
export interface AgentMetrics {
  total: number;
  online: number;
  offline: number;
  busy: number;
  jobsProcessedLast24h: number;
}

/**
 * Service for collecting and exposing job/agent metrics.
 * Can be polled by dashboards or used by monitoring hooks.
 */
export class JobMetricsService {
  /**
   * Get current job metrics snapshot.
   */
  static async getJobMetrics(): Promise<JobMetrics> {
    try {
      const [total, statusCounts, _avgData, retryData] = await Promise.all([
        db.job.count(),
        db.job.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        db.job.aggregate({
          where: {
            status: 'COMPLETED',
            startedAt: { not: null },
            completedAt: { not: null },
          },
          _avg: {
            progress: true,
          },
        }),
        db.job.count({
          where: {
            retryCount: { gt: 0 },
          },
        }),
      ]);

      const statusMap: Record<string, number> = {};
      for (const s of statusCounts) {
        statusMap[s.status] = s._count.id;
      }

      const pending = statusMap['PENDING'] || 0;
      const running = statusMap['RUNNING'] || 0;
      const completed = statusMap['COMPLETED'] || 0;
      const failed = statusMap['FAILED'] || 0;
      const cancelled = statusMap['CANCELLED'] || 0;

      // Calculate rates
      const finishedJobs = completed + failed;
      const successRate = finishedJobs > 0 ? completed / finishedJobs : 0;
      const retryRate = total > 0 ? retryData / total : 0;

      // Calculate avg completion time (need raw SQL or compute differently)
      // For simplicity, we'll estimate using recent completed jobs
      const avgCompletionTimeMs = undefined; // Would require date math in query

      return {
        total,
        pending,
        running,
        completed,
        failed,
        cancelled,
        avgCompletionTimeMs,
        retryRate,
        successRate,
      };
    } catch (error) {
      Logger.error('JobMetricsService.getJobMetrics Error:', error);
      throw error;
    }
  }

  /**
   * Get current agent metrics snapshot.
   */
  static async getAgentMetrics(): Promise<AgentMetrics> {
    try {
      const [total, statusCounts, jobsLast24h] = await Promise.all([
        db.agent.count(),
        db.agent.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        db.job.count({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const statusMap: Record<string, number> = {};
      for (const s of statusCounts) {
        statusMap[s.status] = s._count.id;
      }

      return {
        total,
        online: statusMap['ONLINE'] || 0,
        offline: statusMap['OFFLINE'] || 0,
        busy: statusMap['BUSY'] || 0,
        jobsProcessedLast24h: jobsLast24h,
      };
    } catch (error) {
      Logger.error('JobMetricsService.getAgentMetrics Error:', error);
      throw error;
    }
  }

  /**
   * Emit metrics to dashboard hooks for real-time updates.
   */
  static async emitMetrics(): Promise<void> {
    const [jobMetrics, agentMetrics] = await Promise.all([
      this.getJobMetrics(),
      this.getAgentMetrics(),
    ]);

    await HookSystem.dispatch('orchestrator.metrics', {
      jobs: jobMetrics,
      agents: agentMetrics,
      timestamp: new Date().toISOString(),
    });

    Logger.debug('JobMetricsService: Metrics emitted', {
      jobs: jobMetrics,
      agents: agentMetrics,
    });
  }
}
