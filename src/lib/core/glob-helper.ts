/**
 * Vite Glob Helpers
 *
 * Extracted into a separate file to allow easy mocking in unit tests.
 * import.meta.glob is a compile-time feature and hard to mock directly with vi.stubGlobal.
 *
 * MANDATORY: Infrastructure utilities MUST be implemented as static classes.
 */
export class GlobHelper {
  static getCoreInits() {
    return import.meta.glob('/src/init.ts', { eager: true });
  }

  static getModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/server-init.ts'], {
      eager: true,
    });
  }

  static getClientModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/client-init.ts'], {
      eager: true,
    });
  }

  static getApiModules() {
    return import.meta.glob('../../../modules/*/src/pages/api/**/*.{ts,js}', { eager: true });
  }

  static getMiddlewareModules() {
    return import.meta.glob('/modules/*/src/middleware.ts', { eager: true });
  }

  static getRegistryModules() {
    return import.meta.glob(['/src/registry/**/*.tsx', '/modules/*/src/registry/**/*.tsx'], {
      eager: true,
    });
  }

  static getI18nCoreLocales() {
    return import.meta.glob('../../../locales/*.json', { eager: true });
  }

  static getI18nModuleLocales() {
    return import.meta.glob('../../../modules/*/locales/*.json', { eager: true });
  }

  static getModuleConfigs() {
    return import.meta.glob('../../../modules/*/module.config.mjs', { eager: true });
  }
}
