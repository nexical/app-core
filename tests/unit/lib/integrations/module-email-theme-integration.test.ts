/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '../../../../src/lib/integrations/module-email-theme-integration';
import { ModuleDiscovery, type LoadedModule } from '../../../../src/lib/modules/module-discovery';
import type { AstroIntegration } from 'astro';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('../../../../src/lib/modules/module-discovery', () => ({
  ModuleDiscovery: {
    loadModules: vi.fn(),
  },
}));

describe('module-email-theme-integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate themes and write config file', async () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'base', config: { theme: { primary: 'blue' } } } as unknown as LoadedModule,
      { name: 'no-theme', config: {} } as unknown as LoadedModule,
      {
        name: 'override',
        config: { theme: { primary: 'red', secondary: 'green' } },
      } as unknown as LoadedModule,
    ]);

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (hook as any)({});
    }

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('email-theme-config.ts'),
      expect.stringContaining('"primary": "red"'),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('email-theme-config.ts'),
      expect.stringContaining('"secondary": "green"'),
    );
  });

  it('should create output directory if it does not exist', async () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (hook as any)({});
    }

    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
