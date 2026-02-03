import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobLogService } from '../../../src/services/job-log-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';

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
      (db.$transaction as unknown).mockResolvedValue([[], 0]);
      await JobLogService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('jobLog.beforeList', expect.anything());
    });

    it('should handle list errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobLogService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a job log', async () => {
      (db.jobLog.findUnique as unknown).mockResolvedValue({ id: '1' });
      const result = await JobLogService.get('1');
      expect(result.success).toBe(true);
    });

    it('should return not found', async () => {
      (db.jobLog.findUnique as unknown).mockResolvedValue(null);
      const result = await JobLogService.get('1');
      expect(result.success).toBe(false);
    });

    it('should handle get errors', async () => {
      (db.jobLog.findUnique as unknown).mockRejectedValue(new Error('error'));
      const result = await JobLogService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a job log', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.jobLog.create as unknown).mockResolvedValue({ id: '1' });
      const result = await JobLogService.create({
        jobId: 'j1',
        message: 'test',
        level: 'info',
      } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.created', expect.anything());
    });

    it('should handle create errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobLogService.create({} as unknown);
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a job log', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.jobLog.update as unknown).mockResolvedValue({ id: '1' });
      const result = await JobLogService.update('1', { message: 'updated' } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobLogService.update('1', {} as unknown);
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a job log', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      const result = await JobLogService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('jobLog.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await JobLogService.delete('1');
      expect(result.success).toBe(false);
    });
  });
});
