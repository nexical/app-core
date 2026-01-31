/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import integration from '../../../../src/lib/integrations/module-styles-integration';
import type { AstroIntegration } from 'astro';
import fs from 'node:fs';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  },
}));

describe('module-styles-integration', () => {
  const injectScript = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should inject Core and Module CSS', () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
      const pathStr = p.toString();
      if (pathStr.endsWith('src/styles/styles.css')) return true;
      if (pathStr.endsWith('modules/mod1/styles.css')) return true;
      if (pathStr.endsWith('modules')) return true;
      return false;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fs.readdirSync).mockReturnValue(['mod1', 'mod2'] as any);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hook({ injectScript } as any);
    }

    expect(injectScript).toHaveBeenCalledWith(
      'page',
      expect.stringContaining('src/styles/styles.css'),
    );
    expect(injectScript).toHaveBeenCalledWith(
      'page',
      expect.stringContaining('modules/mod1/styles.css'),
    );
    expect(injectScript).not.toHaveBeenCalledWith(
      'page',
      expect.stringContaining('modules/mod2/styles.css'),
    );
  });

  it('should handle missing modules directory', () => {
    const inst = integration() as AstroIntegration;
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const hook = inst.hooks['astro:config:setup'];
    if (hook) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hook as any)({ injectScript });
    }

    expect(injectScript).not.toHaveBeenCalled();
  });
});
