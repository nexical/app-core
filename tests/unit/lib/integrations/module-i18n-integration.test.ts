/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleI18nIntegration } from '../../../../src/lib/integrations/module-i18n-integration';
import type { LoadedModule } from '../../../../src/lib/modules/module-discovery';
import {
  getI18nCoreLocales,
  getI18nModuleLocales,
  getModuleConfigs,
} from '../../../../src/lib/core/glob-helper';

vi.mock('../../../../src/lib/core/glob-helper', () => ({
  getI18nCoreLocales: vi.fn(),
  getI18nModuleLocales: vi.fn(),
  getModuleConfigs: vi.fn(),
}));

describe('module-i18n-integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get available languages from glob imports', async () => {
    vi.mocked(getI18nCoreLocales).mockReturnValue({
      '../../../locales/en.json': {},
      '../../../locales/es.json': {},
    });
    vi.mocked(getI18nModuleLocales).mockReturnValue({
      '../../../modules/user/locales/en.json': {},
      '../../../modules/blog/locales/fr.json': {},
    });

    const langs = await ModuleI18nIntegration.getAvailableLanguages();
    expect(langs).toContain('en');
    expect(langs).toContain('es');
    expect(langs).toContain('fr');
  });

  it('should merge locales correctly', async () => {
    const coreLocale = { hi: 'hello' };
    const userLocale = { hi: 'ciao', bye: 'addio' };

    vi.mocked(getI18nCoreLocales).mockReturnValue({
      '../../../locales/en.json': { default: coreLocale },
    });
    vi.mocked(getModuleConfigs).mockReturnValue({
      '../../../modules/user/module.config.mjs': { default: { name: 'user', type: 'feature' } },
    });
    vi.mocked(getI18nModuleLocales).mockReturnValue({
      '../../../modules/user/locales/en.json': { default: userLocale },
    });

    const merged = await ModuleI18nIntegration.getMergedLocale('en');
    expect(merged.hi).toBe('ciao'); // Module override
    expect(merged.bye).toBe('addio');
  });

  it('should handle missing core locale in merge', async () => {
    vi.mocked(getI18nCoreLocales).mockReturnValue({});
    vi.mocked(getModuleConfigs).mockReturnValue({
      '../../../modules/user/module.config.mjs': { default: { name: 'user' } },
    });
    vi.mocked(getI18nModuleLocales).mockReturnValue({
      '../../../modules/user/locales/en.json': { hi: 'ciao' },
    });

    const merged = await ModuleI18nIntegration.getMergedLocale('en');
    expect(merged.hi).toBe('ciao');
  });

  it('should handle runtime modules scanning with edge cases', () => {
    vi.mocked(getModuleConfigs).mockReturnValue({
      '../../../modules/alpha/module.config.mjs': { default: { type: 'core', order: 1 } },
      '../../../modules/beta/module.config.mjs': { order: 10 }, // default feature
      '../../../modules/gamma/module.config.mjs': { default: { type: 'unknown' } }, // unknown phase
      '../../../modules/delta/module.config.mjs': {}, // empty config, direct export
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modules = (ModuleI18nIntegration as any).getRuntimeModules() as LoadedModule[];
    expect(modules.find((m) => m.name === 'gamma')?.config.type).toBe('unknown');
    expect(modules.find((m) => m.name === 'delta')?.config.type).toBe('feature');
    expect(modules.find((m) => m.name === 'delta')?.config.order).toBe(50);

    // Verify sorting logic for unknown phase and missing order
    expect(modules[0].name).toBe('alpha'); // core (0)
    expect(modules[1].name).toBe('beta'); // feature (20), order 10
    expect(modules[2].name).toBe('gamma'); // unknown (phase 20), order 50
    expect(modules[3].name).toBe('delta'); // feature (20), order 50
  });

  it('should handle different module config export styles', () => {
    vi.mocked(getModuleConfigs).mockReturnValue({
      '../../../modules/alpha/module.config.mjs': { name: 'alpha' }, // direct export
      '../../../modules/beta/module.config.mjs': { default: null }, // fallback to empty
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modules = (ModuleI18nIntegration as any).getRuntimeModules() as LoadedModule[];
    expect(modules.length).toBe(2);
  });

  it('should handle non-matching glob paths gracefully', async () => {
    vi.mocked(getI18nCoreLocales).mockReturnValue({
      'invalid-path': {},
    });
    vi.mocked(getI18nModuleLocales).mockReturnValue({}); // Ensure no bleed from previous tests

    const langs = await ModuleI18nIntegration.getAvailableLanguages();
    expect(langs).toEqual([]);
  });

  it('should handle empty glob results for locales merge', async () => {
    vi.mocked(getI18nCoreLocales).mockReturnValue({});
    vi.mocked(getModuleConfigs).mockReturnValue({});

    const merged = await ModuleI18nIntegration.getMergedLocale('en');
    expect(merged).toEqual({});
  });

  it('should sort modules by phase and order', () => {
    const modules = [
      { name: 'theme', config: { type: 'theme', order: 10 } },
      { name: 'feat1', config: { type: 'feature', order: 100 } },
      { name: 'feat2', config: { type: 'feature', order: 10 } },
      { name: 'core', config: { type: 'core', order: 1 } },
      { name: 'unknown', config: { type: 'unknown', order: 5 } },
    ] as unknown as LoadedModule[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = (ModuleI18nIntegration as any).sortModules(modules) as LoadedModule[];

    expect(sorted[0].name).toBe('core');
    expect(sorted[1].name).toBe('unknown'); // phase 20 (feature fallback), order 5
    expect(sorted[2].name).toBe('feat2'); // phase 20, order 10
    expect(sorted[3].name).toBe('feat1'); // phase 20, order 100
    expect(sorted[4].name).toBe('theme'); // phase 40
  });

  it('should handle default values in sorting', () => {
    const modules = [
      { name: 'b', config: { type: 'feature' } }, // order defaults to 50
      { name: 'a', config: { type: 'feature', order: 10 } },
    ] as unknown as LoadedModule[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = (ModuleI18nIntegration as any).sortModules(modules) as LoadedModule[];
    expect(sorted[0].name).toBe('a');
    expect(sorted[1].name).toBe('b');
  });
});
