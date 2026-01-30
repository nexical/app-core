/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '../../../../src/lib/integrations/module-email-theme-integration';
import { ModuleDiscovery } from '../../../../src/lib/modules/module-discovery';
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
    const inst = integration();
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      { name: 'base', config: { theme: { primary: 'blue' } } } as any,
      { name: 'no-theme', config: {} } as any, // Branch 25: false
      { name: 'override', config: { theme: { primary: 'red', secondary: 'green' } } } as any,
    ]);

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const hook = inst.hooks['astro:config:setup'] as any;
    await hook({});

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
    const inst = integration();
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'] as any;
    await hook({});

    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
