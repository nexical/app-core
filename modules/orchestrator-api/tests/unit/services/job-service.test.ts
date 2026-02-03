import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobService } from '../../../src/services/job-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';

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
      (db.$transaction as unknown).mockResolvedValue([[], 0]);
      await JobService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('job.beforeList', expect.anything());
      expect(db.$transaction).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a job', async () => {
      (db.job.findUnique as unknown).mockResolvedValue({ id: '1' });
      const result = await JobService.get('1');
      expect(result.success).toBe(true);
      expect(HookSystem.filter).toHaveBeenCalledWith('job.read', expect.anything());
    });

    it('should return not found', async () => {
      (db.job.findUnique as unknown).mockResolvedValue(null);
      const result = await JobService.get('1');
      expect(result.success).toBe(false);
    });

    it('should handle get errors', async () => {
      (db.job.findUnique as unknown).mockRejectedValue(new Error('error'));
      const result = await JobService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.job.create as unknown).mockResolvedValue({ id: '1' });
      const result = await JobService.create({ type: 'test', payload: {} } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.created', expect.anything());
    });

    it('should handle create errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobService.create({} as unknown);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.job.update as unknown).mockResolvedValue({ id: '1' });
      const result = await JobService.update('1', { status: 'COMPLETED' } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobService.update('1', {} as unknown);
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should handle update with authenticated actor', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.job.update as unknown).mockResolvedValue({ id: '1' });
      const actor = { id: 'u1' };
      await JobService.update('1', { status: 'COMPLETED' } as unknown, actor as unknown);
      expect(db.job.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      const result = await JobService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('job.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobService.delete('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
