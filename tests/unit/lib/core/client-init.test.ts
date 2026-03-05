/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobHelper } from '../../../../src/lib/core/glob-helper';

vi.mock('../../../../src/lib/core/glob-helper', () => ({
  GlobHelper: {
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getClientModuleInitsEager: vi.fn(() => ({})),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn(),
    getRegistryModules: vi.fn(),
  },
}));

describe('initializeClientModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should call init functions from globbed files', async () => {
    const mockModuleInit = vi.fn().mockResolvedValue(undefined);
    const mockModuleDefault = vi.fn().mockResolvedValue(undefined);

    vi.mocked(GlobHelper.getClientModuleInitsEager).mockReturnValue({
      '/modules/foo/src/init.ts': { init: mockModuleInit },
      '/modules/bar/src/client-init.ts': { default: mockModuleDefault },
    } as unknown as Record<string, unknown>);

    // Import inside test to ensure mocks are respected
    const { initializeClientModules } = await import('../../../../src/lib/core/client-init');

    await initializeClientModules();

    expect(mockModuleInit).toHaveBeenCalled();
    expect(mockModuleDefault).toHaveBeenCalled();
  });

  it('should handle errors in init functions gracefully', async () => {
    const mockErrorInit = vi.fn().mockRejectedValue(new Error('Fail'));

    vi.mocked(GlobHelper.getClientModuleInitsEager).mockReturnValue({
      '/modules/err/src/init.ts': { init: mockErrorInit },
    } as unknown as Record<string, unknown>);

    const { initializeClientModules } = await import('../../../../src/lib/core/client-init');

    await expect(initializeClientModules()).resolves.not.toThrow();
    expect(mockErrorInit).toHaveBeenCalled();
  });

  it('should handle modules with no exports gracefully', async () => {
    vi.mocked(GlobHelper.getClientModuleInitsEager).mockReturnValue({
      '/modules/empty/src/init.ts': {},
    } as unknown as Record<string, unknown>);

    const { initializeClientModules } = await import('../../../../src/lib/core/client-init');

    await initializeClientModules();
    // Reached line 34 F branch
  });
});
