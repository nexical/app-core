/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeModules } from '@/lib/modules/module-init';
import { GlobHelper } from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
  GlobHelper: {
    getCoreInits: vi.fn(),
    getModuleInits: vi.fn(),
  },
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
      core1: () => Promise.resolve({ init: coreInit }),
      core2: () => Promise.resolve(skippedInit),
      core3: { init: vi.fn() }, // Not a function rawMod
    } as unknown as Record<string, () => Promise<unknown>>);
    vi.mocked(GlobHelper.getModuleInits).mockReturnValue({
      mod1: () => Promise.resolve({ init: modInit }),
      mod2: { something: true }, // Not a function rawMod and no init
    } as unknown as Record<string, () => Promise<unknown>>);

    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await initializeModules();

    expect(coreInit).toHaveBeenCalled();
    expect(modInit).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Initialized 5 module(s)'));

    logSpy.mockRestore();
  });
});
