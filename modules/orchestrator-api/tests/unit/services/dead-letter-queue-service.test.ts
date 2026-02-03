import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeadLetterQueueService } from '../../../src/services/dead-letter-queue-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import type { DeadLetterJob, Job } from '@prisma/client';

vi.mock('@/lib/core/db', () => ({
  db: {
    deadLetterJob: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    job: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
  },
}));

describe('DeadLetterQueueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('archive', () => {
    const mockEntry = (overrides = {}) => ({
      id: 'dl1',
      originalJobId: 'j1',
      type: 'test',
      payload: { x: 1 },
      error: { message: 'fail' },
      failedAt: new Date(),
      retryCount: 3,
      reason: null,
      actorId: null,
      actorType: null,
      ...overrides,
    });

    it('should archive a failed job', async () => {
      const entry = {
        originalJobId: 'j1',
        type: 'test',
        payload: { x: 1 },
        error: { message: 'fail' },
        retryCount: 3,
      };

      vi.mocked(db.deadLetterJob.create).mockResolvedValue(
        mockEntry(entry) as unknown as DeadLetterJob,
      );

      const result = await DeadLetterQueueService.archive(entry);

      expect(result.success).toBe(true);
      expect(db.deadLetterJob.create).toHaveBeenCalled();
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadletter.archived', expect.any(Object));
    });

    it('should handle archive errors', async () => {
      vi.mocked(db.deadLetterJob.create).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.archive(
        {} as unknown as Parameters<typeof DeadLetterQueueService.archive>[0],
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('deadletter.service.error.archive_failed');
    });
  });

  describe('list', () => {
    it('should list entries', async () => {
      vi.mocked(db.deadLetterJob.findMany).mockResolvedValue([] as unknown as DeadLetterJob[]);
      const result = await DeadLetterQueueService.list();
      expect(result.success).toBe(true);
      expect(db.deadLetterJob.findMany).toHaveBeenCalled();
    });

    it('should filter by type', async () => {
      vi.mocked(db.deadLetterJob.findMany).mockResolvedValue([] as unknown as DeadLetterJob[]);
      await DeadLetterQueueService.list({ type: 'test' });
      expect(db.deadLetterJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'test' },
        }),
      );
    });

    it('should handle list errors', async () => {
      vi.mocked(db.deadLetterJob.findMany).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.list();
      expect(result.success).toBe(false);
    });
  });

  describe('retry', () => {
    it('should retry a job', async () => {
      const dlqEntry = { id: 'dl1', type: 'test', payload: { x: 1 }, actorId: 'u1' };
      vi.mocked(db.deadLetterJob.findUnique).mockResolvedValue(
        dlqEntry as unknown as DeadLetterJob,
      );
      vi.mocked(db.job.create).mockResolvedValue({ id: 'j2' } as unknown as Job);
      vi.mocked(db.deadLetterJob.delete).mockResolvedValue({} as unknown as DeadLetterJob);

      const result = await DeadLetterQueueService.retry('dl1');

      expect(result.success).toBe(true);
      expect(db.job.create).toHaveBeenCalled();
      expect(db.deadLetterJob.delete).toHaveBeenCalledWith({ where: { id: 'dl1' } });
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadletter.retried', expect.any(Object));
    });

    it('should return error if not found', async () => {
      vi.mocked(db.deadLetterJob.findUnique).mockResolvedValue(null);
      const result = await DeadLetterQueueService.retry('dl1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('deadletter.service.error.not_found');
    });

    it('should handle retry errors', async () => {
      vi.mocked(db.deadLetterJob.findUnique).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.retry('dl1');
      expect(result.success).toBe(false);
    });
  });

  describe('purge', () => {
    it('should purge old entries', async () => {
      vi.mocked(db.deadLetterJob.deleteMany).mockResolvedValue({ count: 5 } as unknown as {
        count: number;
      });
      const result = await DeadLetterQueueService.purge(10);
      expect(result.success).toBe(true);
      expect(result.data?.deleted).toBe(5);
      expect(db.deadLetterJob.deleteMany).toHaveBeenCalled();
    });

    it('should handle purge errors', async () => {
      vi.mocked(db.deadLetterJob.deleteMany).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.purge();
      expect(result.success).toBe(false);
    });
  });
});
