import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as completePOST } from '../../../../../src/pages/api/job/[id]/complete';
import { POST as failPOST } from '../../../../../src/pages/api/job/[id]/fail';
import { POST as cancelPOST } from '../../../../../src/pages/api/job/[id]/cancel';
import { POST as progressPOST } from '../../../../../src/pages/api/job/[id]/progress';
import { CompleteJobAction } from '../../../../../src/actions/complete-job';
import { FailJobAction } from '../../../../../src/actions/fail-job';
import { CancelJobAction } from '../../../../../src/actions/cancel-job';
import { UpdateProgressJobAction } from '../../../../../src/actions/update-progress-job';
import { ApiGuard } from '@/lib/api/api-guard';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { APIContext } from 'astro';

vi.mock('../../../../../src/actions/complete-job');
vi.mock('../../../../../src/actions/fail-job');
vi.mock('../../../../../src/actions/cancel-job');
vi.mock('../../../../../src/actions/update-progress-job');
vi.mock('@/lib/api/api-guard');

describe('Job RPC Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiGuard.protect).mockResolvedValue(undefined);
  });

  describe('POST job/[id]/complete', () => {
    it('should complete a job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/complete',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/complete', {
        method: 'POST',
        body: JSON.stringify({ result: { ok: true } }),
      });

      vi.mocked(CompleteJobAction.run).mockResolvedValue({
        success: true,
        data: { id: 'j1' },
      } as unknown as Awaited<ReturnType<typeof CompleteJobAction.run>>);

      const response = (await completePOST(mockContext)) as Response;
      const data = await response.json();
      if (data.error === 'Unauthorized') {
        throw new Error('UNAUTHORIZED LOCALS: ' + JSON.stringify(mockContext.locals));
      }
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/complete',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/complete', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      vi.mocked(CompleteJobAction.run).mockResolvedValue({
        success: false,
        error: 'fail',
      } as Awaited<ReturnType<typeof CompleteJobAction.run>>);

      const response = await completePOST(mockContext);
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
    });
  });

  describe('POST job/[id]/fail', () => {
    it('should fail a job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/fail',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/fail', {
        method: 'POST',
        body: JSON.stringify({ error: 'boom' }),
      });

      vi.mocked(FailJobAction.run).mockResolvedValue({ success: true } as Awaited<
        ReturnType<typeof FailJobAction.run>
      >);

      const response = (await failPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/fail', {
        method: 'POST',
        body: JSON.stringify({ error: 'boom' }),
      });
      vi.mocked(FailJobAction.run).mockResolvedValue({ success: false, error: 'fail' } as Awaited<
        ReturnType<typeof FailJobAction.run>
      >);
      const response = await failPOST(mockContext);
      expect(response.status).toBe(400);
    });
  });

  describe('POST job/[id]/cancel', () => {
    it('should cancel a job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/cancel',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/cancel', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      vi.mocked(CancelJobAction.run).mockResolvedValue({ success: true } as Awaited<
        ReturnType<typeof CancelJobAction.run>
      >);

      const response = (await cancelPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/cancel', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      vi.mocked(CancelJobAction.run).mockResolvedValue({ success: false, error: 'fail' } as Awaited<
        ReturnType<typeof CancelJobAction.run>
      >);
      const response = await cancelPOST(mockContext);
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH job/[id]/progress', () => {
    it('should update progress', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/progress',
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/progress', {
        method: 'POST',
        body: JSON.stringify({ progress: 50 }),
      });

      vi.mocked(UpdateProgressJobAction.run).mockResolvedValue({ success: true } as Awaited<
        ReturnType<typeof UpdateProgressJobAction.run>
      >);

      const response = (await progressPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      }) as unknown as APIContext;
      mockContext.request = new Request('http://localhost/api/job/j1/progress', {
        method: 'POST',
        body: JSON.stringify({ progress: 50 }),
      });
      vi.mocked(UpdateProgressJobAction.run).mockResolvedValue({
        success: false,
        error: 'fail',
      } as Awaited<ReturnType<typeof UpdateProgressJobAction.run>>);
      const response = await progressPOST(mockContext);
      expect(response.status).toBe(400);
    });
  });
});
