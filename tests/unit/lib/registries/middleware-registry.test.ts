/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as GlobHelper from '@/lib/core/glob-helper';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';

vi.mock('@/lib/modules/module-discovery');
vi.mock('@/lib/core/glob-helper', () => ({
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn()
}));

describe('middleware-registry', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('should aggregate middleware based on sorted modules', async () => {
        const { getModuleMiddlewares } = await import('@/lib/registries/middleware-registry');
        const mockM1 = { default: { onRequest: vi.fn() } };
        const mockM2 = { default: { onRequest: vi.fn() } };

        vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
            { name: 'm2', path: '', config: {} },
            { name: 'm1', path: '', config: {} }
        ]);

        vi.mocked(GlobHelper.getMiddlewareModules).mockReturnValue({
            '/modules/m1/src/middleware.ts': mockM1,
            '/modules/m2/src/middleware.ts': mockM2
        });

        const middlewares = await getModuleMiddlewares();

        expect(middlewares).toHaveLength(2);
        expect(middlewares[0]).toBe(mockM2.default);
        expect(middlewares[1]).toBe(mockM1.default);
    });

    it('should skip middleware modules without a default export', async () => {
        const { getModuleMiddlewares } = await import('@/lib/registries/middleware-registry');
        vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
            { name: 'm1', path: '', config: {} }
        ]);
        vi.mocked(GlobHelper.getMiddlewareModules).mockReturnValue({
            '/modules/m1/src/middleware.ts': { someOtherExport: {} }
        });

        const middlewares = await getModuleMiddlewares();
        expect(middlewares).toHaveLength(0);
    });

    it('should use cached results on subsequent calls', async () => {
        const { getModuleMiddlewares } = await import('@/lib/registries/middleware-registry');
        vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([]);
        vi.mocked(GlobHelper.getMiddlewareModules).mockReturnValue({});

        await getModuleMiddlewares();
        await getModuleMiddlewares();

        expect(ModuleDiscovery.loadModules).toHaveBeenCalledTimes(1);
    });
});
