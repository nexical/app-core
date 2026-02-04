import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobLogService } from '../../../src/services/job-log-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';
import type { JobLog, Prisma } from '@prisma/client';

vi.mock('@/lib/core/db', () => ({
  db: {
    $transaction: vi.fn(),
    jobLog: {
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

describe('JobLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list job logs', async () => {
      vi.mocked(db.$transaction).mockResolvedValue([[], 0]);
      await JobLogService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('jobLog.beforeList', expect.anything());
    });

    it('should handle list errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobLogService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a job log', async () => {
      vi.mocked(db.jobLog.findUnique).mockResolvedValue({ id: '1' } as unknown as JobLog);
      const result = await JobLogService.get('1');
      expect(result.success).toBe(true);
    });

    it('should return not found', async () => {
      vi.mocked(db.jobLog.findUnique).mockResolvedValue(null);
      const result = await JobLogService.get('1');
      expect(result.success).toBe(false);
    });

    it('should handle get errors', async () => {
      vi.mocked(db.jobLog.findUnique).mockRejectedValue(new Error('error'));
      const result = await JobLogService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a job log', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.jobLog.create).mockResolvedValue({ id: '1' } as unknown as JobLog);
      const result = await JobLogService.create({
        jobId: 'j1',
        message: 'test',
        level: 'info',
      } as unknown as Prisma.JobLogCreateInput);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.created', expect.anything());
    });

    it('should handle create errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobLogService.create({} as unknown as Prisma.JobLogCreateInput);
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a job log', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.jobLog.update).mockResolvedValue({ id: '1' } as unknown as JobLog);
      const result = await JobLogService.update('1', {
        message: 'updated',
      } as unknown as Prisma.JobLogUpdateInput);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobLogService.update('1', {} as unknown as Prisma.JobLogUpdateInput);
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a job log', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.jobLog.delete).mockResolvedValue({ id: '1' } as unknown as JobLog);
      const result = await JobLogService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobLogService.delete('1');
      expect(result.success).toBe(false);
    });
  });
});
