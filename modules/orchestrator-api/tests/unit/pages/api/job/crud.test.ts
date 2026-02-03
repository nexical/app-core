import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as jobListGET } from '../../../../../src/pages/api/job/index';
import { GET as jobGetGET } from '../../../../../src/pages/api/job/[id]';
import { POST as pollPOST } from '../../../../../src/pages/api/orchestrator/poll';
import { POST as checkStalePOST } from '../../../../../src/pages/api/orchestrator/check-stale';
import { JobService } from '../../../../../src/services/job-service';
import { PollJobsOrchestratorAction } from '../../../../../src/actions/poll-jobs-orchestrator';
import { CheckStaleAgentsOrchestratorAction } from '../../../../../src/actions/check-stale-agents-orchestrator';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { APIContext } from 'astro';

vi.mock('../../../../../src/services/job-service');
vi.mock('../../../../../src/actions/poll-jobs-orchestrator');
vi.mock('../../../../../src/actions/check-stale-agents-orchestrator');
vi.mock('@/lib/api/api-guard');

describe('Job CRUD and Orchestrator Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiGuard.protect).mockResolvedValue(undefined);
  });

  describe('GET api/job', () => {
    it('should list jobs', async () => {
      const mockContext = createMockAstroContext({
        url: 'http://localhost/api/job?take=10',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job?take=10');
      vi.mocked(JobService.list).mockResolvedValue({ success: true, data: [] });
      await jobListGET(mockContext);
      expect(JobService.list).toHaveBeenCalled();
    });

    it('should handle list errors', async () => {
      const mockContext = createMockAstroContext({
        url: 'http://localhost/api/job',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job');
      vi.mocked(JobService.list).mockResolvedValue({ success: false, error: 'fail' });
      const response = await jobListGET(mockContext);
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe('GET api/job/[id]', () => {
    it('should get a job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      vi.mocked(JobService.get).mockResolvedValue({
        success: true,
        data: {},
      } as unknown as Awaited<ReturnType<typeof JobService.get>>);
      await jobGetGET(mockContext);
      expect(JobService.get).toHaveBeenCalled();
    });
  });

  describe('POST api/orchestrator/poll', () => {
    it('should poll for jobs', async () => {
      const mockContext = createMockAstroContext({
        url: 'http://localhost/api/orchestrator/poll',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/orchestrator/poll', {
        method: 'POST',
        body: JSON.stringify({ capabilities: [] }),
      });
      vi.mocked(PollJobsOrchestratorAction.run).mockResolvedValue({
        success: true,
        data: null,
      } as unknown as Awaited<ReturnType<typeof PollJobsOrchestratorAction.run>>);
      await pollPOST(mockContext);
      expect(PollJobsOrchestratorAction.run).toHaveBeenCalled();
    });
  });

  describe('POST api/orchestrator/check-stale', () => {
    it('should check stale agents', async () => {
      const mockContext = createMockAstroContext({
        url: 'http://localhost/api/orchestrator/check-stale',
        locals: { actor: { id: 'u1', role: 'admin' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/orchestrator/check-stale', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      vi.mocked(CheckStaleAgentsOrchestratorAction.run).mockResolvedValue({
        success: true,
      } as unknown as Awaited<ReturnType<typeof CheckStaleAgentsOrchestratorAction.run>>);
      await checkStalePOST(mockContext);
      expect(CheckStaleAgentsOrchestratorAction.run).toHaveBeenCalled();
    });
  });
});
