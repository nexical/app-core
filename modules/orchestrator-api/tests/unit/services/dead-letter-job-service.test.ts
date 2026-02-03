import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DeadLetterJobService } from '../../../src/services/dead-letter-job-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';
import type { DeadLetterJob, Prisma } from '@prisma/client';

vi.mock('@/lib/core/db', () => ({
  db: {
    $transaction: vi.fn(),
    deadLetterJob: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/core/logger', () => ({
  Logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
    filter: vi.fn((event, data) => Promise.resolve(data)),
  },
}));

describe('DeadLetterJobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list dead letter jobs', async () => {
      vi.mocked(db.$transaction).mockResolvedValue([[], 0]);
      await DeadLetterJobService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('deadLetterJob.beforeList', expect.anything());
    });

    it('should handle list errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a dead letter job', async () => {
      vi.mocked(db.deadLetterJob.findUnique).mockResolvedValue({
        id: '1',
      } as unknown as DeadLetterJob);
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(true);
    });

    it('should handle get errors', async () => {
      vi.mocked(db.deadLetterJob.findUnique).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should return not found', async () => {
      vi.mocked(db.deadLetterJob.findUnique).mockResolvedValue(null);
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a dead letter job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.deadLetterJob.create).mockResolvedValue({ id: '1' } as unknown as DeadLetterJob);
      const result = await DeadLetterJobService.create({
        type: 'test',
        error: 'boom',
      } as unknown as Prisma.DeadLetterJobCreateInput);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.created', expect.anything());
    });

    it('should handle create errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.create(
        {} as unknown as Prisma.DeadLetterJobCreateInput,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a dead letter job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.deadLetterJob.update).mockResolvedValue({ id: '1' } as unknown as DeadLetterJob);
      const result = await DeadLetterJobService.update('1', {
        status: 'RESOLVED',
      } as unknown as Prisma.DeadLetterJobUpdateInput);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.update(
        '1',
        {} as unknown as Prisma.DeadLetterJobUpdateInput,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a dead letter job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.deadLetterJob.delete).mockResolvedValue({ id: '1' } as unknown as DeadLetterJob);
      const result = await DeadLetterJobService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.delete('1');
      expect(result.success).toBe(false);
    });
  });
});
