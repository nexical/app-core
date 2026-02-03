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

vi.mock('../../../../../src/actions/complete-job');
vi.mock('../../../../../src/actions/fail-job');
vi.mock('../../../../../src/actions/cancel-job');
vi.mock('../../../../../src/actions/update-progress-job');
vi.mock('@/lib/api/api-guard');

describe('Job RPC Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ApiGuard.protect as any).mockResolvedValue(true);
  });

  describe('POST job/[id]/complete', () => {
    it('should complete a job', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        url: 'http://localhost/api/job/j1/complete',
        locals: { actor: { id: 'u1' } },
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/complete', {
        method: 'POST',
        body: JSON.stringify({ result: { ok: true } }),
      });

      (CompleteJobAction.run as any).mockResolvedValue({ success: true, data: { id: 'j1' } });

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
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/complete', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      (CompleteJobAction.run as any).mockResolvedValue({ success: false, error: 'fail' });

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
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/fail', {
        method: 'POST',
        body: JSON.stringify({ error: 'boom' }),
      });

      (FailJobAction.run as any).mockResolvedValue({ success: true });

      const response = (await failPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/fail', {
        method: 'POST',
        body: JSON.stringify({ error: 'boom' }),
      });
      (FailJobAction.run as any).mockResolvedValue({ success: false, error: 'fail' });
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
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/cancel', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      (CancelJobAction.run as any).mockResolvedValue({ success: true });

      const response = (await cancelPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/cancel', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      (CancelJobAction.run as any).mockResolvedValue({ success: false, error: 'fail' });
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
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/progress', {
        method: 'POST',
        body: JSON.stringify({ progress: 50 }),
      });

      (UpdateProgressJobAction.run as any).mockResolvedValue({ success: true });

      const response = (await progressPOST(mockContext)) as Response;
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 400 on error', async () => {
      const mockContext = createMockAstroContext({
        params: { id: 'j1' },
        locals: { actor: { id: 'u1' } },
      });
      (mockContext as any).request = new Request('http://localhost/api/job/j1/progress', {
        method: 'POST',
        body: JSON.stringify({ progress: 50 }),
      });
      (UpdateProgressJobAction.run as any).mockResolvedValue({ success: false, error: 'fail' });
      const response = await progressPOST(mockContext);
      expect(response.status).toBe(400);
    });
  });
});
