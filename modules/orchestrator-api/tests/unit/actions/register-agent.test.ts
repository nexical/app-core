import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RegisterAgentAction } from '../../../src/actions/register-agent';
import { db } from '@/lib/core/db';
import { createMockAstroContext } from '@tests/unit/helpers';
import type { RegisterAgentDTO, Agent } from '../../../src/sdk/types';

vi.mock('@/lib/core/db', () => ({
  db: {
    agent: {
      upsert: vi.fn(),
    },
  },
}));

describe('RegisterAgentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register an agent using db.agent.upsert', async () => {
    const mockContext = createMockAstroContext();
    const inputProps = { hostname: 'host', capabilities: [] };
    const input = { id: 'a1', ...inputProps };
    const mockAgent = { id: 'a1', ...inputProps };
    vi.mocked(db.agent.upsert).mockResolvedValue(mockAgent as unknown as Agent);

    const result = await RegisterAgentAction.run(input as RegisterAgentDTO, mockContext);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAgent);
    expect(db.agent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'a1' },
      }),
    );
  });

  it('should handle errors', async () => {
    const mockContext = createMockAstroContext();
    vi.mocked(db.agent.upsert).mockRejectedValue(new Error('boom'));

    const result = await RegisterAgentAction.run({} as RegisterAgentDTO, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toBe('agent.service.error.registration_failed');
  });
});
