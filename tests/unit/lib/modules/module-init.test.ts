/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeModules } from '@/lib/modules/module-init';
import * as GlobHelper from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn(),
    getRegistryModules: vi.fn()
}));

describe('initializeModules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call init functions from globbed files', async () => {
        const mockCoreInit = vi.fn().mockResolvedValue(undefined);
        const mockModuleInit = vi.fn().mockResolvedValue(undefined);

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
            '/src/init.ts': { init: mockCoreInit }
        });

        vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
            '/modules/foo/src/init.ts': { init: mockModuleInit }
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await initializeModules();

        expect(mockCoreInit).toHaveBeenCalled();
        expect(mockModuleInit).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Initialized 2 module(s)'));

        logSpy.mockRestore();
    });

    it('should handle errors in init functions gracefully', async () => {
        const mockErrorInit = vi.fn().mockRejectedValue(new Error('Fail'));

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({});
        vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
            '/modules/err/src/init.ts': { init: mockErrorInit }
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await expect(initializeModules()).resolves.not.toThrow();
        expect(mockErrorInit).toHaveBeenCalled();

        logSpy.mockRestore();
    });

    it('should ignore modules without an init function', async () => {
        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
            '/src/no-init.ts': { somethingElse: () => { } }
        });
        vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
            '/modules/foo/src/no-init.ts': {}
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        await initializeModules();
        // Should not throw and should log 2 modules even if they don't have init
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Initialized 2 module(s)'));

        logSpy.mockRestore();
    });
});
