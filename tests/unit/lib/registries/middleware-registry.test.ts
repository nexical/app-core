/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobHelper } from '@/lib/core/glob-helper';
import { ModuleDiscovery, type LoadedModule } from '@/lib/modules/module-discovery';

vi.mock('@/lib/core/glob-helper', () => ({
  GlobHelper: {
    getMiddlewareModules: vi.fn(),
  },
}));

vi.mock('@/lib/modules/module-discovery', () => ({
  ModuleDiscovery: {
    loadModules: vi.fn(),
  },
}));

describe('middleware-registry', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should aggregate and cache middlewares from modules', async () => {
    const mockModule = { default: { onRequest: vi.fn() } };
    vi.mocked(GlobHelper.getMiddlewareModules).mockReturnValue({
      '/modules/test-mod/src/middleware.ts': mockModule,
    });
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'test-mod' } as Partial<LoadedModule> as LoadedModule,
    ]);

    const { getModuleMiddlewares } = await import('@/lib/registries/middleware-registry');

    // 1. Initial load
    const result1 = await getModuleMiddlewares();
    expect(result1).toHaveLength(1);
    expect(result1[0]).toBe(mockModule.default);

    // 2. Cache hit (discovery shouldn't be called again)
    const result2 = await getModuleMiddlewares();
    expect(result2).toBe(result1);
    expect(ModuleDiscovery.loadModules).toHaveBeenCalledTimes(1);
  });

  it('should skip modules without middleware implementation', async () => {
    vi.mocked(GlobHelper.getMiddlewareModules).mockReturnValue({});
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'test-mod' } as Partial<LoadedModule> as LoadedModule,
    ]);

    const { getModuleMiddlewares } = await import('@/lib/registries/middleware-registry');
    const result = await getModuleMiddlewares();
    expect(result).toHaveLength(0);
  });
});
