/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';
import fs from 'node:fs';
import { createJiti } from 'jiti';

const { mockJiti } = vi.hoisted(() => ({
  mockJiti: {
    import: vi.fn(),
  },
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

vi.mock('jiti', () => ({
  createJiti: vi.fn().mockReturnValue(mockJiti),
}));

describe('ModuleDiscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJiti.import.mockReset();
  });

  it('should return empty list if modules directory does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const modules = await ModuleDiscovery.loadModules();
    expect(modules).toEqual([]);
  });

  it('should discover and sort modules correctly', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['mod-b' as any, 'mod-a' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockImplementation(async (path) => {
      if (path.includes('mod-b')) return { default: { type: 'core', order: 1 } };
      if (path.includes('mod-a')) return { default: { type: 'feature', order: 10 } };
      return {};
    });

    const modules = await ModuleDiscovery.loadModules();

    expect(modules).toHaveLength(2);
    expect(modules[0].name).toBe('mod-b'); // Core before feature
    expect(modules[1].name).toBe('mod-a');
  });

  it('should apply defaults if config is missing or fails to load', async () => {
    vi.mocked(fs.existsSync).mockImplementation(
      (path: any) => typeof path === 'string' && path.endsWith('modules'),
    ); // Only modules dir exists
    vi.mocked(fs.readdirSync).mockReturnValue(['no-config' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    const modules = await ModuleDiscovery.loadModules();
    expect(modules[0].config.type).toBe('feature');
    expect(modules[0].config.order).toBe(50);
  });

  it('should handle config load errors gracefully', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['bad-config' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockRejectedValue(new Error('Syntax Error'));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const modules = await ModuleDiscovery.loadModules();
    expect(modules).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('should skip non-directory files in the modules directory', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['not-a-dir' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

    const modules = await ModuleDiscovery.loadModules();
    expect(modules).toHaveLength(0);
  });

  it('should handle non-default config exports from module.config.mjs', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['named-export' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    // Case where config is the module object itself (no .default)
    mockJiti.import.mockResolvedValue({ type: 'integration', order: 5 });

    const modules = await ModuleDiscovery.loadModules();
    expect(modules[0].config.type).toBe('integration');
    expect(modules[0].config.order).toBe(5);
  });

  it('should fallback to default phase and order for unknown module types', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['unknown-type' as any, 'another-unknown' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockImplementation(async (path) => {
      if (path.includes('unknown-type')) return { default: { type: 'unknown' as any, order: 1 } };
      if (path.includes('another-unknown'))
        return { default: { type: 'unknown' as any, order: 2 } };
      return { default: {} };
    });

    const modules = await ModuleDiscovery.loadModules();
    expect(modules).toHaveLength(2);
    expect(modules[0].config.order).toBe(1);
    expect(modules[1].config.order).toBe(2);
  });

  it('should sort unknown phases to the default position (20)', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['mod-unknown' as any, 'mod-core' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockImplementation(async (path) => {
      if (path.includes('mod-unknown'))
        return { default: { type: 'something-else' as any, order: 1 } };
      if (path.includes('mod-core')) return { default: { type: 'core', order: 1 } };
      return { default: {} };
    });

    const modules = await ModuleDiscovery.loadModules();
    expect(modules[0].name).toBe('mod-core'); // Core (0) before unknown (20)
    expect(modules[1].name).toBe('mod-unknown');
  });

  it('should use default export from module.config.mjs if available', async () => {
    vi.mocked(fs.existsSync).mockImplementation(
      (p: any) => p.includes('modules') || p.includes('module.config.mjs'),
    );
    vi.mocked(fs.readdirSync).mockReturnValue(['default-export' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockResolvedValue({ default: { type: 'theme', order: 1 } });

    const modules = await ModuleDiscovery.loadModules();
    expect(modules[0].config.type).toBe('theme');
  });

  it('should fallback to empty object if import returns falsy', async () => {
    vi.mocked(fs.existsSync).mockImplementation(
      (p: any) => p.includes('modules') || p.includes('module.config.mjs'),
    );
    vi.mocked(fs.readdirSync).mockReturnValue(['falsy-export' as any]);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

    mockJiti.import.mockResolvedValue(null);

    const modules = await ModuleDiscovery.loadModules();
    expect(modules[0].config.type).toBe('feature'); // Default
  });
});
