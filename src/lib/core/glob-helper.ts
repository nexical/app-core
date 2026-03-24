/**
 * Vite Glob Helpers (Server-Only)
 */
export class GlobHelper {
  /* v8 ignore start */
  static getCoreInits() {
    return import.meta.glob('/src/init.ts');
  }

  static getModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/server-init.ts']);
  }

  static getClientModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/client-init.ts']);
  }

  static getClientModuleInitsEager() {
    return import.meta.glob(
      [
        '/src/init.ts',
        '/src/client-init.ts',
        '/modules/*/src/init.ts',
        '/modules/*/src/client-init.ts',
      ],
      {
        eager: true,
      },
    );
  }

  static getMiddlewareModules() {
    return import.meta.glob('/modules/*/src/middleware.ts');
  }

  static getRegistryModules() {
    return import.meta.glob(['/src/registry/**/*.tsx', '/modules/*/src/registry/**/*.tsx']);
  }

  static getI18nCoreLocales() {
    return import.meta.glob('../../../locales/*.json', { eager: true });
  }

  static getI18nModuleLocales() {
    return import.meta.glob(['/modules/*/locales/**/*.json', '/modules/*/src/locales/**/*.json'], {
      eager: true,
    });
  }

  static getModuleConfigs() {
    return import.meta.glob('/modules/*/module.config.mjs', { eager: true });
  }

  static getApiModules() {
    return import.meta.glob(
      ['/src/pages/api/**/*.{ts,js}', '/modules/*/src/pages/api/**/*.{ts,js}'],
      {
        eager: true,
      },
    );
  }
  /* v8 ignore stop */
}
