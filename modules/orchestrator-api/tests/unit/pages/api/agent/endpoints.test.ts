import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIContext } from 'astro';
import { GET as jobMetricsGET } from '../../../../../src/pages/api/metrics/jobs';
import { GET as agentMetricsGET } from '../../../../../src/pages/api/metrics/agents';
import { POST as agentRegisterPOST } from '../../../../../src/pages/api/agent/register';
import { POST as heartbeatPOST } from '../../../../../src/pages/api/agent/[id]/heartbeat';
import { GetJobMetricsAction } from '../../../../../src/actions/get-job-metrics';
import { GetAgentMetricsAction } from '../../../../../src/actions/get-agent-metrics';
import { RegisterAgentAction } from '../../../../../src/actions/register-agent';
import { HeartbeatAgentAction } from '../../../../../src/actions/heartbeat-agent';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';

vi.mock('../../../../../src/actions/get-job-metrics');
vi.mock('../../../../../src/actions/get-agent-metrics');
vi.mock('../../../../../src/actions/register-agent');
vi.mock('../../../../../src/actions/heartbeat-agent');
vi.mock('@/lib/api/api-guard');

describe('Metrics and Agent Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiGuard.protect).mockResolvedValue(undefined);
  });

  describe('GET api/metrics/jobs', () => {
    it('should return job metrics', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      vi.mocked(GetJobMetricsAction.run).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as Awaited<ReturnType<typeof GetJobMetricsAction.run>>);
      const response = (await jobMetricsGET(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('GET api/metrics/agents', () => {
    it('should return agent metrics', async () => {
      const mockContext = createMockAstroContext({
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      vi.mocked(GetAgentMetricsAction.run).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as Awaited<ReturnType<typeof GetAgentMetricsAction.run>>);
      const response = (await agentMetricsGET(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST api/agent/register', () => {
    it('should register an agent', async () => {
      const mockContext = createMockAstroContext({
        url: 'http://localhost/api/agent/register',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/agent/register', {
        method: 'POST',
        body: JSON.stringify({ hostname: 'h1' }),
      });
      vi.mocked(RegisterAgentAction.run).mockResolvedValue({
        success: true,
      } as unknown as Awaited<ReturnType<typeof RegisterAgentAction.run>>);
      const response = (await agentRegisterPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST api/agent/[id]/heartbeat', () => {
    it('should update heartbeat', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'a1' },
        url: 'http://localhost/api/agent/a1/heartbeat',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/agent/a1/heartbeat', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      vi.mocked(HeartbeatAgentAction.run).mockResolvedValue({
        success: true,
      } as unknown as Awaited<ReturnType<typeof HeartbeatAgentAction.run>>);
      const response = (await heartbeatPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
