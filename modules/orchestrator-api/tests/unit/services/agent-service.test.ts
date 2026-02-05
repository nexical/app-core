import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AgentService } from '../../../src/services/agent-service';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import type { Agent, Prisma } from '@prisma/client';

vi.mock('@/lib/core/db', () => ({
  db: {
    $transaction: vi.fn(),
    agent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
    filter: vi.fn((event, data) => Promise.resolve(data)),
  },
}));

describe('AgentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list agents with pagination', async () => {
      const mockAgents = [{ id: '1' }, { id: '2' }] as unknown as Agent[];
      vi.mocked(db.$transaction).mockResolvedValue([mockAgents, 10]);

      const result = await AgentService.list({ take: 2, skip: 0 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgents);
      expect(result.total).toBe(10);
      expect(HookSystem.filter).toHaveBeenCalledWith('agent.list', mockAgents);
    });

    it('should handle list errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('DB Error'));
      const result = await AgentService.list();
      expect(result.success).toBe(false);
      expect(result.error).toBe('agent.service.error.list_failed');
    });
  });

  describe('get', () => {
    it('should get an agent by ID', async () => {
      const mockAgent = { id: '1' } as unknown as Agent;
      vi.mocked(db.agent.findUnique).mockResolvedValue(mockAgent);

      const result = await AgentService.get('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgent);
      expect(HookSystem.filter).toHaveBeenCalledWith('agent.read', mockAgent, { actor: undefined });
    });

    it('should return not found if agent does not exist', async () => {
      vi.mocked(db.agent.findUnique).mockResolvedValue(null);
      const result = await AgentService.get('1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('agent.service.error.not_found');
    });

    it('should handle get errors', async () => {
      vi.mocked(db.agent.findUnique).mockRejectedValue(new Error('DB Error'));
      const result = await AgentService.get('1');
      expect(result.success).toBe(false);
    });
  });

  describe('create', () => {
    it('should create an agent', async () => {
      const input = { hostname: 'host' };
      const created = { id: '1', ...input } as unknown as Agent;
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.agent.create).mockResolvedValue(created);

      const result = await AgentService.create(input as unknown as Agent);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(created);
      expect(HookSystem.filter).toHaveBeenCalledWith('agent.beforeCreate', input);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('agent.created', expect.anything());
    });

    it('should handle create errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('DB Error'));
      const result = await AgentService.create({} as unknown as Agent);
      expect(result.success).toBe(false);
    });
  });

  describe('update', () => {
    it('should update an agent', async () => {
      const input = { hostname: 'new-host' };
      const updated = { id: '1', ...input } as unknown as Agent;
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.agent.update).mockResolvedValue(updated);

      const result = await AgentService.update('1', input as unknown as Partial<Agent>);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updated);
      expect(HookSystem.filter).toHaveBeenCalledWith('agent.beforeUpdate', input);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('agent.updated', expect.anything());
    });

    it('should handle update errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('DB Error'));
      const result = await AgentService.update('1', {} as unknown as Partial<Agent>);
      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete an agent', async () => {
      vi.mocked(db.$transaction).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          cb(db as unknown as Prisma.TransactionClient),
      );
      vi.mocked(db.agent.delete).mockResolvedValue({} as unknown as Agent);

      const result = await AgentService.delete('1');

      expect(result.success).toBe(true);
      expect(HookSystem.dispatch).toHaveBeenCalledWith('agent.deleted', { id: '1' });
    });

    it('should handle delete errors', async () => {
      vi.mocked(db.$transaction).mockRejectedValue(new Error('DB Error'));
      const result = await AgentService.delete('1');
      expect(result.success).toBe(false);
    });
  });
});
