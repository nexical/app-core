import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PollJobsOrchestratorAction } from '../../../src/actions/poll-jobs-orchestrator';
import { OrchestrationService } from '../../../src/services/orchestration-service';
import type { AgentJobType } from '../../../src/services/orchestration-service';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { ServiceResponse } from '@/types/service';
import type { PollJobsDTO } from '../../../src/sdk/types';

vi.mock('../../../src/services/orchestration-service', () => ({
  OrchestrationService: {
    poll: vi.fn(),
  },
}));

describe('PollJobsOrchestratorAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call OrchestrationService.poll with correct arguments', async () => {
    const mockContext = createMockAstroContext({
      locals: { actor: { id: 'agent-1', type: 'agent', role: 'AGENT' } },
    });
    const input = { capabilities: ['TEST'], agentId: 'agent-1' };
    vi.mocked(OrchestrationService.poll).mockResolvedValue({
      success: true,
      data: { id: 'j1' },
    } as unknown as ServiceResponse<AgentJobType | null>);

    const result = await PollJobsOrchestratorAction.run(input, mockContext);

    expect(result.success).toBe(true);
    expect(OrchestrationService.poll).toHaveBeenCalledWith(
      'agent-1',
      ['TEST'],
      undefined,
      undefined,
    );
  });

  it('should filter by actor if the actor is a user', async () => {
    const mockContext = createMockAstroContext({
      locals: { actor: { id: 'user-1', type: 'user' } },
    });
    const input = { capabilities: ['TEST'] };
    vi.mocked(OrchestrationService.poll).mockResolvedValue({
      success: true,
      data: null,
    } as unknown as ServiceResponse<AgentJobType | null>);

    await PollJobsOrchestratorAction.run(input as unknown as PollJobsDTO, mockContext);

    expect(OrchestrationService.poll).toHaveBeenCalledWith('user-1', ['TEST'], 'user-1', 'user');
  });

  it('should handle service errors', async () => {
    const mockContext = createMockAstroContext();
    vi.mocked(OrchestrationService.poll).mockResolvedValue({
      success: false,
      error: 'fail',
    } as unknown as ServiceResponse<AgentJobType | null>);

    const result = await PollJobsOrchestratorAction.run(
      { capabilities: [], agentId: 'a1' },
      mockContext,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('fail');
  });

  it('should handle unexpected errors', async () => {
    const mockContext = createMockAstroContext();
    vi.mocked(OrchestrationService.poll).mockRejectedValue(new Error('boom'));

    const result = await PollJobsOrchestratorAction.run(
      { capabilities: [], agentId: 'a1' },
      mockContext,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('orchestrator.action.error.poll_failed');
  });
});
