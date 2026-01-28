/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeModules } from '@/lib/modules/module-init';
import * as GlobHelper from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
}));

describe('module-init', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize all core and module inits', async () => {
        const coreInit = vi.fn().mockResolvedValue(undefined);
        const modInit = vi.fn().mockResolvedValue(undefined);

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
            'core-1': { init: coreInit },
            'core-2': {} // No init function, should be skipped
        });

        vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
            'mod-1': { init: modInit }
        });

        await initializeModules();

        expect(coreInit).toHaveBeenCalled();
        expect(modInit).toHaveBeenCalled();
    });

    it('should handle initialization failures gracefully with allSettled', async () => {
        const failingInit = vi.fn().mockRejectedValue(new Error('Failed'));
        const successInit = vi.fn().mockResolvedValue(undefined);

        vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
            'fail': { init: failingInit }
        });

        vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
            'success': { init: successInit }
        });

        // Should not throw
        await expect(initializeModules()).resolves.not.toThrow();
        expect(failingInit).toHaveBeenCalled();
        expect(successInit).toHaveBeenCalled();
    });
});
