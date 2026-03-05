/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '@/lib/integrations/module-email-theme-integration';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';
import type { AstroIntegration } from 'astro';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('@/lib/modules/module-discovery', () => ({
  ModuleDiscovery: {
    loadModules: vi.fn(),
  },
}));

describe('module-email-theme-integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate themes and write them to a file', async () => {
    const inst = integration() as AstroIntegration;

    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([
      {
        name: 'mod1',
        path: '/mod1',
        config: { theme: { primary: 'blue' } },
      } as unknown as Record<string, unknown>,
      {
        name: 'mod2',
        path: '/mod2',
        config: { theme: { secondary: 'red' } },
      } as unknown as Record<string, unknown>,
    ] as unknown as Awaited<ReturnType<typeof ModuleDiscovery.loadModules>>);

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      await (hook as (options: Record<string, unknown>) => Promise<void>)({});
    }

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('email-theme-config.ts'),
      expect.stringContaining('"primary": "blue"'),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('email-theme-config.ts'),
      expect.stringContaining('"secondary": "red"'),
    );
  });

  it('should create directory if it does not exist', async () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(ModuleDiscovery.loadModules).mockResolvedValue([]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      await (hook as (options: Record<string, unknown>) => Promise<void>)({});
    }

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
