import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CancelJobAction } from '../../../src/actions/cancel-job';
import { CompleteJobAction } from '../../../src/actions/complete-job';
import { FailJobAction } from '../../../src/actions/fail-job';
import { UpdateProgressJobAction } from '../../../src/actions/update-progress-job';
import { OrchestrationService } from '../../../src/services/orchestration-service';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { ServiceResponse } from '@/types/service';
import type { Job, Prisma } from '@prisma/client';

vi.mock('../../../src/services/orchestration-service', () => ({
  OrchestrationService: {
    cancel: vi.fn(),
    complete: vi.fn(),
    fail: vi.fn(),
    updateProgress: vi.fn(),
  },
}));

describe('Job Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CancelJobAction', () => {
    it('should cancel a job', async () => {
      const mockContext = createMockAstroContext({ locals: { actor: { id: 'u1' } } });
      vi.mocked(OrchestrationService.cancel).mockResolvedValue({
        success: true,
      } as unknown as ServiceResponse<Job>);
      const result = await CancelJobAction.run({ id: 'j1' }, mockContext);
      expect(result.success).toBe(true);
      expect(OrchestrationService.cancel).toHaveBeenCalledWith('j1', 'u1');
    });
  });

  describe('CompleteJobAction', () => {
    it('should complete a job', async () => {
      const mockContext = createMockAstroContext({ locals: { actor: { id: 'u1', type: 'user' } } });
      vi.mocked(OrchestrationService.complete).mockResolvedValue({
        success: true,
      } as unknown as ServiceResponse<Prisma.JobGetPayload<object>>);
      const result = await CompleteJobAction.run({ id: 'j1', result: {} }, mockContext);
      expect(result.success).toBe(true);
      expect(OrchestrationService.complete).toHaveBeenCalledWith('j1', {}, 'u1');
    });
  });

  describe('FailJobAction', () => {
    it('should fail a job', async () => {
      const mockContext = createMockAstroContext({ locals: { actor: { id: 'u1', type: 'user' } } });
      vi.mocked(OrchestrationService.fail).mockResolvedValue({
        success: true,
      } as unknown as ServiceResponse<Job>);
      const result = await FailJobAction.run({ id: 'j1', error: 'boom' }, mockContext);
      expect(result.success).toBe(true);
      expect(OrchestrationService.fail).toHaveBeenCalledWith('j1', 'boom', 'u1');
    });
  });

  describe('UpdateProgressJobAction', () => {
    it('should update progress', async () => {
      const mockContext = createMockAstroContext({ locals: { actor: { id: 'u1' } } });
      vi.mocked(OrchestrationService.updateProgress).mockResolvedValue({
        success: true,
      } as unknown as ServiceResponse<{ success: boolean }>);
      const result = await UpdateProgressJobAction.run({ id: 'j1', progress: 50 }, mockContext);
      expect(result.success).toBe(true);
      expect(OrchestrationService.updateProgress).toHaveBeenCalledWith('j1', 50, 'u1');
    });
  });
});
