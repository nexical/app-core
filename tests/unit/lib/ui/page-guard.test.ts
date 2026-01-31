import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageGuard } from '../../../../src/lib/ui/page-guard';
import { roleRegistry } from '../../../../src/lib/registries/role-registry';
import { createMockAstroContext } from '../../helpers';
import type { Mock } from 'vitest';

vi.mock('../../../../src/lib/registries/role-registry', () => ({
  roleRegistry: {
    get: vi.fn(),
  },
}));

describe('PageGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow navigation if check passes', async () => {
    const context = createMockAstroContext();
    const role = {
      check: vi.fn().mockResolvedValue(undefined),
    };

    const result = await PageGuard.protect(context, role);
    expect(result).toBeUndefined();
    expect(role.check).toHaveBeenCalledWith(context, {}, undefined);
  });

  it('should look up role by name in registry', async () => {
    const context = createMockAstroContext();
    const role = {
      check: vi.fn().mockResolvedValue(undefined),
    };
    (roleRegistry.get as Mock).mockReturnValue(role);

    await PageGuard.protect(context, 'Admin');
    expect(roleRegistry.get).toHaveBeenCalledWith('Admin');
    expect(role.check).toHaveBeenCalled();
  });

  it('should throw error if role name not found', async () => {
    const context = createMockAstroContext();
    (roleRegistry.get as Mock).mockReturnValue(undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(PageGuard.protect(context, 'Unknown')).rejects.toThrow(
      "Role policy 'Unknown' not found",
    );
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle custom redirect if check fails', async () => {
    const context = createMockAstroContext();
    const response = new Response('Redirect', { status: 302 });
    const role = {
      check: vi.fn().mockRejectedValue(new Error('Auth failed')),
      redirect: vi.fn().mockResolvedValue(response),
    };

    const result = await PageGuard.protect(context, role);
    expect(result).toBe(response);
  });

  it('should default to /login if "Unauthorized" error occurs', async () => {
    const context = createMockAstroContext();
    const role = {
      check: vi.fn().mockRejectedValue(new Error('Unauthorized access')),
    };

    await PageGuard.protect(context, role);
    expect(context.redirect).toHaveBeenCalledWith('/login');
  });

  it('should default to /?error=forbidden for other errors', async () => {
    const context = createMockAstroContext();
    const role = {
      check: vi.fn().mockRejectedValue(new Error('Some other error')),
    };

    await PageGuard.protect(context, role);
    expect(context.redirect).toHaveBeenCalledWith('/?error=forbidden');
  });
});
