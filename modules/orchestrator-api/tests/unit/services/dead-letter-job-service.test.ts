import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DeadLetterJobService } from '../../../src/services/dead-letter-job-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';

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
      (db.$transaction as unknown).mockResolvedValue([[], 0]);
      await DeadLetterJobService.list();
      expect(HookSystem.filter).toHaveBeenCalledWith('deadLetterJob.beforeList', expect.anything());
    });

    it('should handle list errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.list();
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a dead letter job', async () => {
      (db.deadLetterJob.findUnique as unknown).mockResolvedValue({ id: '1' });
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(true);
    });

    it('should handle get errors', async () => {
      (db.deadLetterJob.findUnique as unknown).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(false);
      expect(Logger.error).toHaveBeenCalled();
    });

    it('should return not found', async () => {
      (db.deadLetterJob.findUnique as unknown).mockResolvedValue(null);
      const result = await DeadLetterJobService.get('1');
      expect(result.success).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a dead letter job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.deadLetterJob.create as unknown).mockResolvedValue({ id: '1' });
      const result = await DeadLetterJobService.create({ type: 'test', error: 'boom' } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.created', expect.anything());
    });

    it('should handle create errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.create({} as unknown);
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a dead letter job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      (db.deadLetterJob.update as unknown).mockResolvedValue({ id: '1' });
      const result = await DeadLetterJobService.update('1', { status: 'RESOLVED' } as unknown);
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.update('1', {} as unknown);
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a dead letter job', async () => {
      (db.$transaction as unknown).mockImplementation(async (cb: unknown) => cb(db));
      const result = await DeadLetterJobService.delete('1');
      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('deadLetterJob.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      (db.$transaction as unknown).mockRejectedValue(new Error('error'));
      const result = await DeadLetterJobService.delete('1');
      expect(result.success).toBe(false);
    });
  });
});
