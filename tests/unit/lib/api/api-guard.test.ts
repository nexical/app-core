import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiGuard } from '@/lib/api/api-guard';
import { roleRegistry } from '@/lib/registries/role-registry';
import { createMockAstroContext } from '@tests/unit/helpers';

vi.mock('@/lib/registries/role-registry', () => ({
  roleRegistry: {
    get: vi.fn(),
  },
}));

describe('ApiGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if role is not found', async () => {
    vi.mocked(roleRegistry.get).mockReturnValue(undefined);
    const context = createMockAstroContext();

    await expect(ApiGuard.protect(context, 'MissingRole')).rejects.toThrow(/not found/);
  });

  it('should call policy.check if role is found', async () => {
    const mockPolicy = { check: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(roleRegistry.get).mockReturnValue(mockPolicy as any);
    const context = createMockAstroContext();
    const input = { id: 1 };
    const data = { owner: 'me' };

    await ApiGuard.protect(context, 'Admin', input, data);

    expect(mockPolicy.check).toHaveBeenCalledWith(context, input, data);
  });
});
