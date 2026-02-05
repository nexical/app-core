import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobService } from '../../../src/services/job-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';
import type { Job, Prisma } from '@prisma/client';

vi.mock('@/lib/core/db', () => ({
  db: {
    $transaction: vi.fn(),
    job: {
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

describe('JobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list jobs', async () => {
      vi.mocked(db.$transaction).mockResolvedValue([[], 0]);
      await JobService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('job.beforeList', expect.anything());
      expect(db.$transaction).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a job', async () => {
      vi.mocked(db.job.findUnique).mockResolvedValue({ id: '1' } as unknown as Job);
      const result = await JobService.get('1');
      expect(result.success).toBe(true);
      expect(HookSystem.filter).toHaveBeenCalledWith('job.read', expect.anything(), {
        actor: undefined,
      });
    });

    it('should return not found', async () => {
      vi.mocked(db.job.findUnique).mockResolvedValue(null);
      const result = await JobService.get('1');
      expect(result.success).toBe(false);
    });

    it('should handle get errors', async () => {
      vi.mocked(db.job.findUnique).mockRejectedValue(new Error('error'));
      const result = await JobService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.job.create).mockResolvedValue({ id: '1' } as unknown as Job);
      const createData: Prisma.JobCreateInput = { type: 'test', payload: {} };
      const result = await JobService.create(createData);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.created', expect.anything());
    });

    it('should handle create errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobService.create({} as unknown as Prisma.JobCreateInput);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.job.update).mockResolvedValue({ id: '1' } as unknown as Job);
      const updateData: Prisma.JobUpdateInput = { status: 'COMPLETED' };
      const result = await JobService.update('1', updateData);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobService.update('1', {} as unknown as Prisma.JobUpdateInput);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should handle update with authenticated actor', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.job.update).mockResolvedValue({ id: '1' } as unknown as Job);
      const actor = { id: 'u1' };
      const updateData: Prisma.JobUpdateInput = { status: 'COMPLETED' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await JobService.update('1', updateData, undefined, actor as unknown as any);
      expect(db.job.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a job', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      const result = await JobService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('error'));
      const result = await JobService.delete('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
