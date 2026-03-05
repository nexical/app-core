import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleI18nIntegration } from '@/lib/integrations/module-i18n-integration';
import { GlobHelper } from '@/lib/core/glob-helper';

vi.mock('@/lib/core/glob-helper', () => ({
  GlobHelper: {
    getI18nCoreLocales: vi.fn(),
    getI18nModuleLocales: vi.fn(),
    getModuleConfigs: vi.fn(),
  },
}));

describe('ModuleI18nIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableLanguages', () => {
    it('should scan core and module locales', async () => {
      vi.mocked(GlobHelper.getI18nCoreLocales).mockReturnValue({
        '/locales/en.json': {},
        '/locales/es.json': {},
      });
      vi.mocked(GlobHelper.getI18nModuleLocales).mockReturnValue({
        '/modules/user/locales/fr.json': {},
        '/modules/blog/src/locales/generated/de.json': {},
      });

      const langs = await ModuleI18nIntegration.getAvailableLanguages();
      expect(langs).toContain('en');
      expect(langs).toContain('es');
      expect(langs).toContain('fr');
      expect(langs).toContain('de');
      expect(langs).toHaveLength(4);
    });

    it('should ignore invalid paths', async () => {
      vi.mocked(GlobHelper.getI18nCoreLocales).mockReturnValue({ '/other/en.txt': {} });
      vi.mocked(GlobHelper.getI18nModuleLocales).mockReturnValue({
        '/modules/user/locales/en.json': {}, // Matches
        '/modules/user/other/en.json': {}, // No /locales/ - doesn't match
      });
      const langs = await ModuleI18nIntegration.getAvailableLanguages();
      expect(langs).toHaveLength(1);
    });
  });

  describe('getMergedLocale', () => {
    it('should merge core and modules in correct order', async () => {
      // Mock Core
      vi.mocked(GlobHelper.getI18nCoreLocales).mockReturnValue({
        '/locales/en.json': { title: 'Core', desc: 'Core' },
      });

      // Mock Module Configs (to get order)
      vi.mocked(GlobHelper.getModuleConfigs).mockReturnValue({
        '/modules/mod1/module.config.mjs': { default: { type: 'feature', order: 10 } },
        '/modules/mod2/module.config.mjs': { default: { type: 'provider', order: 1 } },
      });

      // Mock Module Locales
      vi.mocked(GlobHelper.getI18nModuleLocales).mockReturnValue({
        '/modules/mod1/locales/en.json': { title: 'Mod1' },
        '/modules/mod2/locales/en.json': { desc: 'Mod2' },
      });

      const merged = await ModuleI18nIntegration.getMergedLocale('en');

      // Sort order: Core (0) < Provider (mod2: 10+1=11? no, phase order)
      // PHASE_ORDER: core:0, provider:10, feature:20
      // So Core < Mod2 < Mod1
      expect(merged).toEqual({
        title: 'Mod1', // Mod1 (feature) overrides Core
        desc: 'Mod2', // Mod2 (provider) overrides Core
      });
    });

    it('should handle modules without locale files', async () => {
      vi.mocked(GlobHelper.getI18nCoreLocales).mockReturnValue({});
      vi.mocked(GlobHelper.getModuleConfigs).mockReturnValue({
        '/modules/mod1/module.config.mjs': { default: { type: 'feature' } },
      });
      vi.mocked(GlobHelper.getI18nModuleLocales).mockReturnValue({});

      const merged = await ModuleI18nIntegration.getMergedLocale('en');
      expect(merged).toEqual({});
    });
  });

  describe('getRuntimeModules and sorting', () => {
    it('should correctly sort modules by phase and order', () => {
      vi.mocked(GlobHelper.getModuleConfigs).mockReturnValue({
        '/modules/feature2/module.config.mjs': { default: { type: 'feature', order: 100 } },
        '/modules/provider1/module.config.mjs': { default: { type: 'provider', order: 1 } },
        '/modules/feature1/module.config.mjs': { default: { type: 'feature', order: 50 } },
        '/modules/core1/module.config.mjs': { default: { type: 'core' } },
        '/modules/theme1/module.config.mjs': { default: { type: 'theme' } },
        '/invalid/path/config.mjs': {},
      } as unknown as Record<string, unknown>);

      // @ts-expect-error - accessing private for coverage
      const sorted = ModuleI18nIntegration.getRuntimeModules();
      expect(sorted[0].name).toBe('core1');
      expect(sorted[1].name).toBe('provider1');
      expect(sorted[2].name).toBe('feature1');
      expect(sorted[3].name).toBe('feature2');
      expect(sorted[4].name).toBe('theme1');
    });

    it('should use default values for missing config properties', () => {
      vi.mocked(GlobHelper.getModuleConfigs).mockReturnValue({
        '/modules/mod/module.config.mjs': {}, // empty config
      } as unknown as Record<string, unknown>);

      // @ts-expect-error - testing fallback for incomplete config object
      const modules = ModuleI18nIntegration.getRuntimeModules();
      expect(modules[0].config.type).toBe('feature');
      expect(modules[0].config.order).toBe(50);
    });
  });
});
