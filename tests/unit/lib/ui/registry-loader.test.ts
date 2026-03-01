/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobHelper } from '../../../../src/lib/core/glob-helper';
import { getZoneComponents } from '../../../../src/lib/ui/registry-loader';

vi.mock('../../../../src/lib/core/glob-helper', () => ({
  GlobHelper: {
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
    getClientModuleInits: vi.fn(),
    getApiModules: vi.fn().mockReturnValue({}),
    getMiddlewareModules: vi.fn(),
    getRegistryModules: vi.fn(),
  },
}));

describe('registry-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find and sort components in a specific zone', async () => {
    const mockComp1 = () => null;
    const mockComp2 = () => null;

    vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
      '/src/registry/header/10-logo.tsx': () => Promise.resolve({ default: mockComp1 }),
      '/modules/user/src/registry/header/20-avatar.tsx': () =>
        Promise.resolve({ default: mockComp2 }),
      '/src/registry/footer/99-copyright.tsx': () => Promise.resolve({ default: () => null }),
    } as any);

    const components = await getZoneComponents('header');

    expect(components).toHaveLength(2);
    expect(components[0].name).toBe('logo');
    expect(components[0].order).toBe(10);
    expect(components[1].name).toBe('avatar');
  });

  it('should handle components without numeric prefix', async () => {
    vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
      '/src/registry/header/profile.tsx': () => Promise.resolve({ default: () => null, order: 5 }),
    } as any);

    const components = await getZoneComponents('header');
    expect(components[0].name).toBe('profile');
    expect(components[0].order).toBe(5);
  });

  it('should allow overriding name via export', async () => {
    vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
      '/src/registry/header/10-logo.tsx': () =>
        Promise.resolve({ default: () => null, name: 'MainLogo' }),
    } as any);

    const components = await getZoneComponents('header');
    expect(components[0].name).toBe('MainLogo');
  });

  it('should skip modules without default export', async () => {
    vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
      '/src/registry/header/invalid.tsx': () => Promise.resolve({ someOtherExport: 'foo' }),
    } as any);

    const components = await getZoneComponents('header');
    expect(components).toHaveLength(0);
  });

  it('should handle complex filename part extraction', async () => {
    vi.mocked(GlobHelper.getRegistryModules).mockReturnValue({
      '/src/registry/header/10-multi-part-name.tsx': () => Promise.resolve({ default: () => null }),
    } as any);

    const components = await getZoneComponents('header');
    expect(components[0].name).toBe('multi-part-name');
    expect(components[0].order).toBe(10);
  });
});
