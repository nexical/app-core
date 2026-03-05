import integration from '@/lib/integrations/module-styles-integration';
import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import { describe, it, expect, vi, type Mock } from 'vitest';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  const mockPath = {
    ...actual,
    resolve: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
    join: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
  };
  return {
    ...mockPath,
    default: mockPath,
  };
});

describe('module-styles-integration', () => {
  it('should inject core and module styles', async () => {
    const inst = integration() as AstroIntegration;

    // Mock core styles exists
    vi.mocked(fs.existsSync).mockImplementation((p: string | Buffer | URL) => {
      const ps = p.toString();
      if (ps.endsWith('src/styles/styles.css')) return true;
      if (ps.endsWith('modules')) return true;
      if (ps.includes('test-mod/styles.css')) return true;
      return false;
    });

    vi.mocked(fs.readdirSync).mockReturnValue(['test-mod'] as unknown as fs.Dirent[]);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      const injectScript = vi.fn();
      await (hook as unknown as (options: { injectScript: Mock }) => Promise<void>)({
        injectScript,
      });

      expect(injectScript).toHaveBeenCalledTimes(2);
      expect(injectScript).toHaveBeenCalledWith(
        'page',
        expect.stringContaining('src/styles/styles.css'),
      );
      expect(injectScript).toHaveBeenCalledWith(
        'page',
        expect.stringContaining('test-mod/styles.css'),
      );
    }
  });

  it('should skip if modules directory not found', async () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      const injectScript = vi.fn();
      await (hook as unknown as (options: { injectScript: Mock }) => Promise<void>)({
        injectScript,
      });
      expect(injectScript).not.toHaveBeenCalled();
    }
  });
});
