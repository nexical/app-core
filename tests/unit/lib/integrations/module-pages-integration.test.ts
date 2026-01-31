/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '../../../../src/lib/integrations/module-pages-integration';
import { ModuleDiscovery, type LoadedModule } from '../../../../src/lib/modules/module-discovery';
import type { AstroIntegration } from 'astro';
import fs from 'node:fs';

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
    const inst = integration() as AstroIntegration;
    const modulePath = '/modules/test-mod';

    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'test-mod', path: modulePath, config: {} } as LoadedModule,
    ]);

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockImplementation(
      (p: fs.PathLike) =>
        ({
          isDirectory: () => {
            const pathStr = p.toString();
            return !pathStr.endsWith('.astro') && !pathStr.endsWith('.ts');
          },
        }) as fs.Stats,
    );

    vi.mocked(fs.readdirSync).mockImplementation(((p: fs.PathLike) => {
      const pathStr = p.toString();
      if (pathStr.endsWith('src/pages'))
        return ['index.astro', 'sub', 'api.ts'] as unknown as string[];
      if (pathStr.endsWith('sub')) return ['page.astro'] as unknown as string[];
      return [] as unknown as string[];
    }) as unknown as typeof fs.readdirSync);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await hook({ injectRoute } as any);
    }

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
  });

  it('should skip if pages directory does not exist', async () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'foo', path: '/foo', config: {} } as LoadedModule,
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (hook as any)({ injectRoute });
    }

    expect(injectRoute).not.toHaveBeenCalled();
  });
});
