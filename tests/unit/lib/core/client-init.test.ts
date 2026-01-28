/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeClientModules } from '@/lib/core/client-init';
import * as GlobHelper from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn(),
    getRegistryModules: vi.fn()
}));

describe('initializeClientModules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call init functions from globbed files', async () => {
        const mockCoreInit = vi.fn().mockResolvedValue(undefined);
        const mockModuleInit = vi.fn().mockResolvedValue(undefined);
        const mockModuleDefault = vi.fn().mockResolvedValue(undefined);

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
            '/src/init.ts': { init: mockCoreInit }
        });

        vi.mocked(GlobHelper.getClientModuleInits).mockReturnValue({
            '/modules/foo/src/init.ts': { init: mockModuleInit },
            '/modules/bar/src/client-init.ts': { default: mockModuleDefault }
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await initializeClientModules();

        expect(mockCoreInit).toHaveBeenCalled();
        expect(mockModuleInit).toHaveBeenCalled();
        expect(mockModuleDefault).toHaveBeenCalled();

        logSpy.mockRestore();
    });

    it('should handle errors in init functions gracefully', async () => {
        const mockErrorInit = vi.fn().mockRejectedValue(new Error('Fail'));

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({});
        vi.mocked(GlobHelper.getClientModuleInits).mockReturnValue({
            '/modules/err/src/init.ts': { init: mockErrorInit }
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await expect(initializeClientModules()).resolves.not.toThrow();
        expect(mockErrorInit).toHaveBeenCalled();

        logSpy.mockRestore();
    });
});
