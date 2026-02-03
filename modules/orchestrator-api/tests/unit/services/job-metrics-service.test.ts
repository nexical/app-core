import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobMetricsService } from '../../../src/services/job-metrics-service';
import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { HookSystem } from '@/lib/modules/hooks';
// Removed unused Agent, Job imports
import type { JobMetrics, AgentMetrics } from '../../../src/services/job-metrics-service';

vi.mock('@/lib/core/db', () => ({
  db: {
    job: {
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    agent: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock('@/lib/core/logger', () => ({
  Logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
  },
}));

describe('JobMetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getJobMetrics', () => {
    it('should calculate job metrics correctly', async () => {
      vi.mocked(db.job.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10); // retryData

      vi.mocked(db.job.groupBy).mockResolvedValue([
        { status: 'PENDING', _count: { id: 20 } },
        { status: 'RUNNING', _count: { id: 10 } },
        { status: 'COMPLETED', _count: { id: 50 } },
        { status: 'FAILED', _count: { id: 15 } },
        { status: 'CANCELLED', _count: { id: 5 } },
      ] as unknown as Awaited<ReturnType<typeof db.job.groupBy>>);

      vi.mocked(db.job.aggregate).mockResolvedValue({
        _avg: { progress: 85 },
      } as unknown as Awaited<ReturnType<typeof db.job.aggregate>>);

      const metrics = await JobMetricsService.getJobMetrics();

      expect(metrics.total).toBe(100);
      expect(metrics.pending).toBe(20);
      expect(metrics.running).toBe(10);
      expect(metrics.completed).toBe(50);
      expect(metrics.failed).toBe(15);
      expect(metrics.cancelled).toBe(5);
      expect(metrics.successRate).toBe(50 / (50 + 15));
      expect(metrics.retryRate).toBe(10 / 100);
    });

    it('should handle zero jobs', async () => {
      vi.mocked(db.job.count).mockResolvedValue(0);
      vi.mocked(db.job.groupBy).mockResolvedValue(
        [] as unknown as Awaited<ReturnType<typeof db.job.groupBy>>,
      );
      vi.mocked(db.job.aggregate).mockResolvedValue({
        _avg: { progress: null },
      } as unknown as Awaited<ReturnType<typeof db.job.aggregate>>);

      const metrics = await JobMetricsService.getJobMetrics();

      expect(metrics.total).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.retryRate).toBe(0);
    });

    it('should throw and log on errors', async () => {
      const error = new Error('DB error');
      vi.mocked(db.job.count).mockRejectedValue(error);

      await expect(JobMetricsService.getJobMetrics()).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('JobMetricsService.getJobMetrics Error:', error);
    });
  });

  describe('getAgentMetrics', () => {
    it('should calculate agent metrics correctly', async () => {
      vi.mocked(db.agent.count).mockResolvedValue(10);
      vi.mocked(db.agent.groupBy).mockResolvedValue([
        { status: 'ONLINE', _count: { id: 5 } },
        { status: 'OFFLINE', _count: { id: 3 } },
        { status: 'BUSY', _count: { id: 2 } },
      ] as unknown as Awaited<ReturnType<typeof db.agent.groupBy>>);
      vi.mocked(db.job.count).mockResolvedValue(50); // jobsProcessedLast24h

      const metrics = await JobMetricsService.getAgentMetrics();

      expect(metrics.total).toBe(10);
      expect(metrics.online).toBe(5);
      expect(metrics.offline).toBe(3);
      expect(metrics.busy).toBe(2);
      expect(metrics.jobsProcessedLast24h).toBe(50);
    });

    it('should handle missing statuses', async () => {
      vi.mocked(db.agent.count).mockResolvedValue(10);
      vi.mocked(db.agent.groupBy).mockResolvedValue([
        { status: 'ONLINE', _count: { id: 5 } },
      ] as unknown as Awaited<ReturnType<typeof db.agent.groupBy>>);
      vi.mocked(db.job.count).mockResolvedValue(50);

      const metrics = await JobMetricsService.getAgentMetrics();

      expect(metrics.total).toBe(10);
      expect(metrics.online).toBe(5);
      expect(metrics.offline).toBe(0);
      expect(metrics.busy).toBe(0);
    });

    it('should throw and log on errors', async () => {
      const error = new Error('DB error');
      vi.mocked(db.agent.count).mockRejectedValue(error);

      await expect(JobMetricsService.getAgentMetrics()).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith('JobMetricsService.getAgentMetrics Error:', error);
    });
  });

  describe('emitMetrics', () => {
    it('should collect and dispatch metrics', async () => {
      vi.spyOn(JobMetricsService, 'getJobMetrics').mockResolvedValue({
        total: 10,
      } as unknown as JobMetrics);
      vi.spyOn(JobMetricsService, 'getAgentMetrics').mockResolvedValue({
        total: 5,
      } as unknown as AgentMetrics);

      await JobMetricsService.emitMetrics();

      expect(HookSystem.dispatch).toHaveBeenCalledWith(
        'orchestrator.metrics',
        expect.objectContaining({
          jobs: { total: 10 },
          agents: { total: 5 },
        }),
      );
      expect(Logger.debug).toHaveBeenCalled();
    });
  });
});
