/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '../../../../src/lib/integrations/module-pages-integration';
import { ModuleDiscovery } from '../../../../src/lib/modules/module-discovery';
import fs from 'node:fs';
import path from 'node:path';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

vi.mock('../../../../src/lib/modules/module-discovery', () => ({
  ModuleDiscovery: {
    loadModules: vi.fn(),
  },
}));

describe('module-pages-integration', () => {
  const injectRoute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should inject routes from module pages directory', async () => {
    const inst = integration();
    const modulePath = '/modules/test-mod';

    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'test-mod', path: modulePath, config: {} },
    ]);

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockImplementation(
      (p: any) =>
        ({
          isDirectory: () => !p.endsWith('.astro') && !p.endsWith('.ts'),
        }) as any,
    );

    vi.mocked(fs.readdirSync).mockImplementation((p: any) => {
      if (p.endsWith('src/pages')) return ['index.astro', 'sub', 'api.ts'] as any;
      if (p.endsWith('sub')) return ['page.astro'] as any;
      return [];
    });

    const hook = inst.hooks['astro:config:setup'] as any;
    await hook({ injectRoute });

    expect(injectRoute).toHaveBeenCalledWith({
      pattern: '/',
      entrypoint: expect.stringContaining('index.astro'),
    });
    expect(injectRoute).toHaveBeenCalledWith({
      pattern: '/sub/page',
      entrypoint: expect.stringContaining('page.astro'),
    });
    expect(injectRoute).toHaveBeenCalledWith({
      pattern: '/api',
      entrypoint: expect.stringContaining('api.ts'),
    });
    expect(injectRoute).not.toHaveBeenCalledWith({
      pattern: '/sub/readme',
      entrypoint: expect.stringContaining('readme.md'),
    });
  });

  it('should skip if pages directory does not exist', async () => {
    const inst = integration();
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'foo', path: '/foo', config: {} },
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'] as any;
    await hook({ injectRoute });

    expect(injectRoute).not.toHaveBeenCalled();
  });
});
