import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeadLetterQueueService } from '../../../src/services/dead-letter-queue-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';

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
    it('should archive a failed job', async () => {
      const entry = {
        originalJobId: 'j1',
        type: 'test',
        payload: { x: 1 },
        error: { message: 'fail' },
        retryCount: 3,
      };

      (db.deadLetterJob.create as unknown).mockResolvedValue({ id: 'dl1', ...entry });

      const result = await DeadLetterQueueService.archive(entry);

      expect(result.success).toBe(true);
      expect(db.deadLetterJob.create).toHaveBeenCalled();
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadletter.archived', expect.any(Object));
    });

    it('should handle archive errors', async () => {
      (db.deadLetterJob.create as unknown).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.archive({} as unknown);
      expect(result.success).toBe(false);
      expect(result.error).toBe('deadletter.service.error.archive_failed');
    });
  });

  describe('list', () => {
    it('should list entries', async () => {
      (db.deadLetterJob.findMany as unknown).mockResolvedValue([]);
      const result = await DeadLetterQueueService.list();
      expect(result.success).toBe(true);
      expect(db.deadLetterJob.findMany).toHaveBeenCalled();
    });

    it('should filter by type', async () => {
      (db.deadLetterJob.findMany as unknown).mockResolvedValue([]);
      await DeadLetterQueueService.list({ type: 'test' });
      expect(db.deadLetterJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'test' },
        }),
      );
    });

    it('should handle list errors', async () => {
      (db.deadLetterJob.findMany as unknown).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.list();
      expect(result.success).toBe(false);
    });
  });

  describe('retry', () => {
    it('should retry a job', async () => {
      const dlqEntry = { id: 'dl1', type: 'test', payload: { x: 1 }, actorId: 'u1' };
      (db.deadLetterJob.findUnique as unknown).mockResolvedValue(dlqEntry);
      (db.job.create as unknown).mockResolvedValue({ id: 'j2' });
      (db.deadLetterJob.delete as unknown).mockResolvedValue({});

      const result = await DeadLetterQueueService.retry('dl1');

      expect(result.success).toBe(true);
      expect(db.job.create).toHaveBeenCalled();
      expect(db.deadLetterJob.delete).toHaveBeenCalledWith({ where: { id: 'dl1' } });
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadletter.retried', expect.any(Object));
    });

    it('should return error if not found', async () => {
      (db.deadLetterJob.findUnique as unknown).mockResolvedValue(null);
      const result = await DeadLetterQueueService.retry('dl1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('deadletter.service.error.not_found');
    });

    it('should handle retry errors', async () => {
      (db.deadLetterJob.findUnique as unknown).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.retry('dl1');
      expect(result.success).toBe(false);
    });
  });

  describe('purge', () => {
    it('should purge old entries', async () => {
      (db.deadLetterJob.deleteMany as unknown).mockResolvedValue({ count: 5 });
      const result = await DeadLetterQueueService.purge(10);
      expect(result.success).toBe(true);
      expect(result.data?.deleted).toBe(5);
      expect(db.deadLetterJob.deleteMany).toHaveBeenCalled();
    });

    it('should handle purge errors', async () => {
      (db.deadLetterJob.deleteMany as unknown).mockRejectedValue(new Error('DB Error'));
      const result = await DeadLetterQueueService.purge();
      expect(result.success).toBe(false);
    });
  });
});
