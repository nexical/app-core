/* eslint-disable */
import { defu } from 'defu';
import type { ModulePhase } from '../modules/module-discovery';
import { getI18nCoreLocales, getI18nModuleLocales, getModuleConfigs } from '../core/glob-helper';

const PHASE_ORDER: Record<ModulePhase, number> = {
  core: 0,
  provider: 10,
  feature: 20,
  integration: 30,
  theme: 40,
};

interface RuntimeModule {
  name: string;
  config: any;
}

export class ModuleI18nIntegration {
  /**
   * Gets available languages by scanning core locales and module locales.
   * Returns a set of unique language codes (e.g., 'en', 'es').
   */
  static async getAvailableLanguages(): Promise<string[]> {
    const languages = new Set<string>();

    // Uses import.meta.glob via helper to ensure files are bundled in build
    const coreLocales = getI18nCoreLocales();
    Object.keys(coreLocales).forEach((path) => {
      const match = path.match(/\/locales\/(.+)\.json$/);
      if (match) {
        languages.add(match[1]);
      }
    });

    // 2. Scan Module Locales
    const moduleLocales = getI18nModuleLocales();
    Object.keys(moduleLocales).forEach((path) => {
      // path example: ../../modules/user/locales/en.json
      const match = path.match(/\/modules\/[^\/]+\/locales\/(.+)\.json$/);
      if (match) {
        languages.add(match[1]);
      }
    });

    return Array.from(languages);
  }

  /**
   * returns the merged locale object for a specific language.
   * Merge Order: Core < Module 1 < Module 2 ...
   */
  static async getMergedLocale(lang: string): Promise<Record<string, any>> {
    const localeObjects: Record<string, any>[] = [];

    // 1. Load Core Locale (Base)
    const coreLocales = getI18nCoreLocales();
    // Find the specific language file
    const coreKey = Object.keys(coreLocales).find((k) => k.endsWith(`/locales/${lang}.json`));

    if (coreKey && coreLocales[coreKey]) {
      const mod = coreLocales[coreKey] as any;
      localeObjects.push(mod.default || mod);
    }

    // 2. Load Module Locales (Overrides)
    // We must respect the module load order (Phase/Order)
    const modules = this.getRuntimeModules();
    const moduleLocales = getI18nModuleLocales();

    for (const module of modules) {
      // Find the locale file for this module
      // We use endsWith to match the path regardless of relative prefix
      const moduleKey = Object.keys(moduleLocales).find((k) =>
        k.includes(`/modules/${module.name}/locales/${lang}.json`),
      );

      if (moduleKey && moduleLocales[moduleKey]) {
        const mod = moduleLocales[moduleKey] as any;
        localeObjects.push(mod.default || mod);
      }
    }

    // Merge all strategies: defu(last, secondToLast, ..., first)
    // We want the LAST module to be the most powerful override, so we reverse the array for defu
    return defu({}, ...localeObjects.reverse());
  }

  /**
   * Loads and sorts modules using import.meta.glob to avoid fs usage,
   * ensuring it works in bundled environments (SSR, Prod) where sources are missing.
   */
  private static getRuntimeModules(): RuntimeModule[] {
    const moduleConfigs = getModuleConfigs();
    const modules: RuntimeModule[] = [];

    for (const [path, mod] of Object.entries(moduleConfigs)) {
      // path example: ../../modules/user/module.config.mjs
      const match = path.match(/\/modules\/([^\/]+)\/module\.config\.mjs$/);
      if (!match) continue;

      const name = match[1];
      const config = (mod as any).default || mod || {};

      // Apply Defaults
      if (!config.type) config.type = 'feature';
      if (config.order === undefined) config.order = 50;

      modules.push({ name, config });
    }

    return this.sortModules(modules);
  }

  private static sortModules(modules: RuntimeModule[]): RuntimeModule[] {
    return modules.sort((a, b) => {
      const phaseA = PHASE_ORDER[a.config.type as ModulePhase] ?? 20;
      const phaseB = PHASE_ORDER[b.config.type as ModulePhase] ?? 20;

      if (phaseA !== phaseB) {
        return phaseA - phaseB;
      }

      return (a.config.order ?? 50) - (b.config.order ?? 50);
    });
  }
}
