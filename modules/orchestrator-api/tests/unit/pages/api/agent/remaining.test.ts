import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIContext } from 'astro';
import { GET as agentListGET } from '../../../../../src/pages/api/agent/index';
import { GET as agentGetGET } from '../../../../../src/pages/api/agent/[id]';
import { GET as orchMetricsGET } from '../../../../../src/pages/api/orchestrator/metrics';
import { AgentService } from '../../../../../src/services/agent-service';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';

vi.mock('../../../../../src/services/agent-service');
vi.mock('@/lib/api/api-guard');

describe('Remaining Agent and Orch Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiGuard.protect).mockResolvedValue(undefined);
  });

  describe('Agents', () => {
    it('should list agents', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      vi.mocked(AgentService.list).mockResolvedValue({
        success: true,
        data: [],
      } as unknown as Awaited<ReturnType<typeof AgentService.list>>);
      await agentListGET(mockContext);
      expect(AgentService.list).toHaveBeenCalled();
    });

    it('should get an agent', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'a1' },
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      vi.mocked(AgentService.get).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as Awaited<ReturnType<typeof AgentService.get>>);
      await agentGetGET(mockContext);
      expect(AgentService.get).toHaveBeenCalledWith('a1', expect.any(Object), {
        id: 'u1',
        role: 'admin',
      });
    });
  });

  describe('Orchestrator Metrics', () => {
    it('should return metrics', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      const response = await orchMetricsGET(mockContext);
      expect(response).toBeDefined();
    });
  });
});
