import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted for variables used in factory
const mocks = vi.hoisted(() => ({
    globFn: vi.fn(),
    hasMagicFn: vi.fn(),
    pathExistsMock: vi.fn(),
    statMock: vi.fn()
}));

// Attach property
(mocks.globFn as any).hasMagic = mocks.hasMagicFn;

vi.mock('glob', () => ({
    glob: mocks.globFn
}));

vi.mock('fs-extra', () => ({
    default: {
        pathExists: (...args: any[]) => mocks.pathExistsMock(...args),
        stat: (...args: any[]) => mocks.statMock(...args)
    }
}));

import { ModuleLocator } from '@nexical/generator/lib/module-locator';

describe('ModuleLocator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Ensure property exists after reset/clear (though clear doesn't remove props)
        (mocks.globFn as any).hasMagic = mocks.hasMagicFn;
    });

    it('should return direct match for non-glob pattern if exists', async () => {
        const pattern = 'chat-api';
        mocks.hasMagicFn.mockReturnValue(false);
        mocks.pathExistsMock.mockResolvedValue(true);
        mocks.statMock.mockResolvedValue({ isDirectory: () => true });

        const result = await ModuleLocator.expand(pattern);
        expect(result).toEqual(['chat-api']);
    });

    it('should expand glob pattern', async () => {
        const pattern = '*-api';
        mocks.hasMagicFn.mockReturnValue(true);
        mocks.globFn.mockResolvedValue(['user-api', 'chat-api']);
        mocks.statMock.mockResolvedValue({ isDirectory: () => true });

        const result = await ModuleLocator.expand(pattern);
        expect(result).toEqual(['user-api', 'chat-api']);
    });
});
