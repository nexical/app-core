/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock side-effect heavy modules
vi.mock('@/lib/api/api-docs', () => ({
    defineApi: vi.fn((handler) => handler),
    generateDocs: vi.fn(),
}));
vi.mock('@/lib/core/client-init', () => ({
    initializeClientModules: vi.fn(),
}));
vi.mock('@/lib/modules/module-init', () => ({
    initializeModules: vi.fn(),
}));

describe('glob-helper', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return glob results for core inits', async () => {
        const { getCoreInits } = await import('@/lib/core/glob-helper');
        const inits = getCoreInits();
        expect(typeof inits).toBe('object');
    });

    it('should return glob results for module inits', async () => {
        const { getModuleInits } = await import('@/lib/core/glob-helper');
        const inits = getModuleInits();
        expect(typeof inits).toBe('object');
    });

    it('should return glob results for registry modules', async () => {
        const { getRegistryModules } = await import('@/lib/core/glob-helper');
        const modules = getRegistryModules();
        expect(typeof modules).toBe('object');
    });

    it('should return glob results for api modules', async () => {
        const { getApiModules } = await import('@/lib/core/glob-helper');
        const modules = getApiModules();
        expect(typeof modules).toBe('object');
    });
});
