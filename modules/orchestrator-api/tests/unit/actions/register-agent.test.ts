import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RegisterAgentAction } from '../../../src/actions/register-agent';
import { db } from '@/lib/core/db';
import { createMockAstroContext } from '@tests/unit/helpers';

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
    (db.agent.upsert as unknown).mockResolvedValue(mockAgent);

    const result = await RegisterAgentAction.run(input as unknown, mockContext);

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
    (db.agent.upsert as unknown).mockRejectedValue(new Error('boom'));

    const result = await RegisterAgentAction.run({} as unknown, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toBe('agent.service.error.registration_failed');
  });
});
