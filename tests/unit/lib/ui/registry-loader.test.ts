/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as GlobHelper from '@/lib/core/glob-helper';
import { getZoneComponents } from '@/lib/ui/registry-loader';

vi.mock('@/lib/core/glob-helper', () => ({
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn(),
    getRegistryModules: vi.fn()
}));

describe('registry-loader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should find and sort components in a specific zone', async () => {
        const mockComp1 = () => null;
        const mockComp2 = () => null;

        vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
            '/src/registry/header/10-logo.tsx': { default: mockComp1 },
            '/modules/user/src/registry/header/20-avatar.tsx': { default: mockComp2 },
            '/src/registry/footer/99-copyright.tsx': { default: () => null }
        });

        const components = await getZoneComponents('header');

        expect(components).toHaveLength(2);
        expect(components[0].name).toBe('logo');
        expect(components[0].order).toBe(10);
        expect(components[1].name).toBe('avatar');
    });

    it('should handle components without numeric prefix', async () => {
        vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
            '/src/registry/header/profile.tsx': { default: () => null, order: 5 }
        });

        const components = await getZoneComponents('header');
        expect(components[0].name).toBe('profile');
        expect(components[0].order).toBe(5);
    });

    it('should allow overriding name via export', async () => {
        vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
            '/src/registry/header/10-logo.tsx': { default: () => null, name: 'MainLogo' }
        });

        const components = await getZoneComponents('header');
        expect(components[0].name).toBe('MainLogo');
    });
});
