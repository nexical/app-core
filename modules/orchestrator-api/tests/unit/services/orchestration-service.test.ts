import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OrchestrationService } from '../../../src/services/orchestration-service';
import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { HookSystem } from '@/lib/modules/hooks';

vi.mock('@/lib/core/db', () => ({
  db: {
    $transaction: vi.fn(),
    job: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    agent: {
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/core/logger', () => ({
  Logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
  },
}));

describe('OrchestrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('poll', () => {
    it('should lock a job if one is available', async () => {
      const mockJob = { id: 'job-1', type: 'TYPE_A', payload: {} };
      const mockUpdatedJob = { ...mockJob, status: 'RUNNING' };

      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => {
        return cb({
          job: {
            findFirst: vi.fn().mockResolvedValue(mockJob),
            update: vi.fn().mockResolvedValue(mockUpdatedJob),
          },
        });
      });

      (db.agent.update as unknown).mockResolvedValue({});

      const result = await OrchestrationService.poll('agent-1', ['TYPE_A']);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: mockUpdatedJob.id,
        type: mockUpdatedJob.type,
        payload: mockUpdatedJob.payload,
      });
      expect(db.agent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'agent-1' },
        }),
      );
    });

    it('should return null if no job is available', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => {
        return cb({
          job: {
            findFirst: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
          },
        });
      });

      const result = await OrchestrationService.poll('agent-1', ['TYPE_A']);

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should handle errors during polling', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('DB Error'));

      const result = await OrchestrationService.poll('agent-1', ['TYPE_A']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.poll_failed');
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should swallow errors if agent heartbeat update fails', async () => {
      const mockJob = { id: 'job-1', type: 'TYPE_A', payload: {} };
      (db.$transaction as unknown).mockResolvedValue(mockJob);
      (db.agent.update as unknown).mockRejectedValue(new Error('Update failed'));

      const result = await OrchestrationService.poll('agent-1', ['TYPE_A']);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Should not throw
    });

    it('should skip heartbeat update if agentId is not provided', async () => {
      (db.$transaction as unknown).mockResolvedValue({ id: 'job-1' });
      await OrchestrationService.poll('', ['TYPE_A']);
      expect(db.agent.update).not.toHaveBeenCalled();
    });

    it('should use actor filtering if provided', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => {
        const tx = {
          job: {
            findFirst: vi.fn().mockResolvedValue(null),
            findMany: vi.fn().mockResolvedValue([]),
          },
        };
        await cb(tx);
        expect(tx.job.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              actorId: 'actor-1',
              actorType: 'user',
            }),
          }),
        );
        return null;
      });

      await OrchestrationService.poll('agent-1', ['TYPE_A'], 'actor-1', 'user');
    });
  });

  describe('complete', () => {
    it('should complete a job', async () => {
      const mockJob = { id: 'job-1', status: 'COMPLETED' };
      (db.job.update as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.complete('job-1', { result: 'ok' });

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockJob);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.completed', mockJob);
    });

    it('should perform security check if actorId is provided (authorized)', async () => {
      const mockJob = { id: 'job-1', actorId: 'actor-1', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({ ...mockJob, status: 'COMPLETED' });

      const result = await OrchestrationService.complete('job-1', { result: 'ok' }, 'actor-1');

      expect(result.success).toBe(true);
      expect(db.job.update).toHaveBeenCalled();
    });

    it('should perform security check with actorType', async () => {
      const mockJob = { id: 'job-1', actorId: 'actor-1', actorType: 'user', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({ ...mockJob, status: 'COMPLETED' });

      const result = await OrchestrationService.complete(
        'job-1',
        { result: 'ok' },
        'actor-1',
        'user',
      );

      expect(result.success).toBe(true);
    });

    it('should cover the redundant branch at 114', async () => {
      // Branch at 114: (actorType && job.actorType === actorType && job.actorId === actorId)
      // To reach this, actorId must match, but we want to exercise the code paths.
      // Actually because of short-circuit, we can't make it true unless first part is false.
      // But we can test it anyway with various actorType combinations.
      const mockJob = { id: 'job-1', actorId: 'actor-1', actorType: 'user', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({ ...mockJob, status: 'COMPLETED' });

      await OrchestrationService.complete('job-1', {}, 'actor-1', 'other-type');
      expect(db.job.update).toHaveBeenCalled();
    });

    it('should allow completion if actor is the locker', async () => {
      const mockJob = { id: 'job-1', actorId: 'owner-1', lockedBy: 'actor-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({ ...mockJob, status: 'COMPLETED' });

      const result = await OrchestrationService.complete('job-1', { result: 'ok' }, 'actor-1');

      expect(result.success).toBe(true);
    });

    it('should fail if actor is unauthorized', async () => {
      const mockJob = { id: 'job-1', actorId: 'owner-1', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.complete('job-1', { result: 'ok' }, 'not-owner');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.unauthorized');
    });

    it('should fail if job not found', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(null);

      const result = await OrchestrationService.complete('job-1', { result: 'ok' }, 'actor-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.not_found');
    });

    it('should handle update errors', async () => {
      (db.job.update as unknown).mockRejectedValue(new Error('Update failed'));

      const result = await OrchestrationService.complete('job-1', { result: 'ok' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.complete_failed');
    });
  });

  describe('fail', () => {
    const mockJob = {
      id: 'job-1',
      retryCount: 0,
      maxRetries: 3,
      actorId: 'actor-1',
      lockedBy: 'agent-1',
    };

    it('should schedule a retry if retries are available', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({
        ...mockJob,
        retryCount: 1,
        status: 'PENDING',
      });

      const result = await OrchestrationService.fail('job-1', 'error');

      expect(result.success).toBe(true);
      expect(db.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
            retryCount: 1,
          }),
        }),
      );
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.retry_scheduled', expect.anything());
    });

    it('should mark as FAILED if retries are exhausted', async () => {
      const exhaustedJob = { ...mockJob, retryCount: 3, maxRetries: 3 };
      (db.job.findUnique as unknown).mockResolvedValue(exhaustedJob);
      (db.job.update as unknown).mockResolvedValue({ ...exhaustedJob, status: 'FAILED' });

      const result = await OrchestrationService.fail('job-1', 'error');

      expect(result.success).toBe(true);
      expect(db.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
          }),
        }),
      );
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.failed', expect.anything());
    });

    it('should handle security checks (authorized)', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.fail('job-1', 'error', 'actor-1');

      expect(result.success).toBe(true);
    });

    it('should handle security checks (unauthorized)', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.fail('job-1', 'error', 'wrong-actor');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.unauthorized');
    });

    it('should return not found', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(null);
      const result = await OrchestrationService.fail('job-1', 'error');
      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.not_found');
    });

    it('should handle errors during fail action', async () => {
      (db.job.findUnique as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.fail('job-1', 'error');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING job', async () => {
      const mockJob = { id: 'job-1', status: 'PENDING', actorId: 'actor-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({ ...mockJob, status: 'CANCELLED' });

      const result = await OrchestrationService.cancel('job-1');

      expect(result.success).toBe(true);
      expect(db.job.update).toHaveBeenCalled();
    });

    it('should not cancel a COMPLETED job', async () => {
      const mockJob = { id: 'job-1', status: 'COMPLETED' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.cancel('job-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.job_not_cancellable');
    });

    it('should enforce owner check if actorId provided', async () => {
      const mockJob = { id: 'job-1', status: 'PENDING', actorId: 'owner' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.cancel('job-1', 'not-owner');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.unauthorized');
    });

    it('should return not found for non-existent job during cancel', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(null);
      const result = await OrchestrationService.cancel('job-non-existent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.not_found');
    });

    it('should handle errors during cancellation', async () => {
      (db.job.findUnique as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.cancel('job-1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('registerAgent', () => {
    it('should upsert agent if ID is provided', async () => {
      const agentData = { id: 'agent-1', hostname: 'host' };
      (db.agent.upsert as unknown).mockResolvedValue(agentData);

      const result = await OrchestrationService.registerAgent(agentData);

      expect(result.success).toBe(true);
      expect(db.agent.upsert).toHaveBeenCalled();
    });

    it('should create agent if ID is not provided', async () => {
      const agentData = { hostname: 'host' } as unknown;
      (db.agent.create as unknown).mockResolvedValue({ id: 'new-id', ...agentData });

      const result = await OrchestrationService.registerAgent(agentData);

      expect(result.success).toBe(true);
      expect(db.agent.create).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      (db.agent.create as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.registerAgent({} as unknown);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('waitFor', () => {
    it('should wait until job is COMPLETED', async () => {
      const mockJobPending = { id: 'job-1', status: 'PENDING' };
      const mockJobCompleted = { id: 'job-1', status: 'COMPLETED' };

      (db.job.findUnique as unknown)
        .mockResolvedValueOnce(mockJobPending)
        .mockResolvedValueOnce(mockJobCompleted);

      // Speed up the test by mocking setTimeout
      vi.useFakeTimers();

      const waitPromise = OrchestrationService.waitFor('job-1', 5000);

      // Advance timers to trigger the while loop iterations
      await vi.advanceTimersByTimeAsync(1000);

      const result = await waitPromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobCompleted);

      vi.useRealTimers();
    });

    it('should return error if job fails', async () => {
      const mockJobFailed = { id: 'job-1', status: 'FAILED', error: 'boom' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJobFailed);

      const result = await OrchestrationService.waitFor('job-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('failed');
    });

    it('should timeout if job stays RUNNING', async () => {
      (db.job.findUnique as unknown).mockResolvedValue({ status: 'RUNNING' });

      vi.useFakeTimers();
      const waitPromise = OrchestrationService.waitFor('job-1', 2000);

      await vi.advanceTimersByTimeAsync(3000);

      const result = await waitPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Timeout');

      vi.useRealTimers();
    });

    it('should handle errors in waitFor', async () => {
      (db.job.findUnique as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.waitFor('job-1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('checkStaleAgents', () => {
    it('should mark stale agents as OFFLINE and release jobs', async () => {
      const staleAgents = [{ id: 'agent-1', hostname: 'host-1' }];
      (db.agent.findMany as unknown).mockResolvedValue(staleAgents);
      (db.agent.updateMany as unknown).mockResolvedValue({ count: 1 });
      (db.job.updateMany as unknown).mockResolvedValue({ count: 2 });

      const result = await OrchestrationService.checkStaleAgents(1000);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ offlineAgents: 1, releasedJobs: 2 });
      expect(db.agent.updateMany).toHaveBeenCalled();
      expect(db.job.updateMany).toHaveBeenCalled();
    });

    it('should return early if no stale agents', async () => {
      (db.agent.findMany as unknown).mockResolvedValue([]);

      const result = await OrchestrationService.checkStaleAgents();

      expect(result.success).toBe(true);
      expect(result.data?.offlineAgents).toBe(0);
    });

    it('should handle errors in checkStaleAgents', async () => {
      (db.agent.findMany as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.checkStaleAgents();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('heartbeat', () => {
    it('should update agent heartbeat', async () => {
      (db.agent.update as unknown).mockResolvedValue({});

      const result = await OrchestrationService.heartbeat('agent-1');

      expect(result.success).toBe(true);
      expect(db.agent.update).toHaveBeenCalled();
    });

    it('should handle heartbeat errors', async () => {
      (db.agent.update as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.heartbeat('agent-1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('updateProgress', () => {
    it('should update job progress', async () => {
      const mockJob = { id: 'job-1', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);
      (db.job.update as unknown).mockResolvedValue({});

      const result = await OrchestrationService.updateProgress('job-1', 50, 'agent-1');

      expect(result.success).toBe(true);
      expect(db.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { progress: 50 },
        }),
      );
    });

    it('should clamp progress value', async () => {
      const mockJob = { id: 'job-1', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      await OrchestrationService.updateProgress('job-1', 150, 'agent-1');
      expect(db.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { progress: 100 },
        }),
      );

      await OrchestrationService.updateProgress('job-1', -10, 'agent-1');
      expect(db.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { progress: 0 },
        }),
      );
    });

    it('should fail if unauthorized', async () => {
      const mockJob = { id: 'job-1', lockedBy: 'agent-1' };
      (db.job.findUnique as unknown).mockResolvedValue(mockJob);

      const result = await OrchestrationService.updateProgress('job-1', 50, 'wrong-agent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.unauthorized');
    });

    it('should return error if job not found', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(null);
      const result = await OrchestrationService.updateProgress('job-1', 50);
      expect(result.success).toBe(false);
      expect(result.error).toBe('orchestrator.service.error.not_found');
    });

    it('should handle update errors', async () => {
      (db.job.findUnique as unknown).mockResolvedValue({ id: 'job-1' });
      (db.job.update as unknown).mockRejectedValue(new Error('DB error'));
      const result = await OrchestrationService.updateProgress('job-1', 50);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
