/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeModules } from '@/lib/modules/module-init';
import * as GlobHelper from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
  getCoreInits: vi.fn(),
  getModuleInits: vi.fn(),
}));

describe('module-init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute init() for core and module inits', async () => {
    const coreInit = vi.fn().mockResolvedValue(undefined);
    const modInit = vi.fn().mockResolvedValue(undefined);
    const skippedInit = { notAFunction: true };

    vi.mocked(GlobHelper.getCoreInits).mockReturnValue({
      core1: { init: coreInit },
      core2: skippedInit,
    });
    vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
      mod1: { init: modInit },
    });

    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await initializeModules();

    expect(coreInit).toHaveBeenCalled();
    expect(modInit).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Initialized 3 module(s)'));

    logSpy.mockRestore();
  });
});
