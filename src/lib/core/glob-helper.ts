/**
 * Vite Glob Helpers
 * 
 * Extracted into a separate file to allow easy mocking in unit tests.
 * import.meta.glob is a compile-time feature and hard to mock directly with vi.stubGlobal.
 */

export function getCoreInits() {
    return import.meta.glob('/src/init.ts', { eager: true });
}

export function getModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/server-init.ts'], { eager: true });
}

export function getClientModuleInits() {
    return import.meta.glob(['/modules/*/src/init.ts', '/modules/*/src/client-init.ts'], { eager: true });
}

export function getApiModules() {
    return import.meta.glob('../../../modules/*/src/pages/api/**/*.{ts,js}', { eager: true });
}

export function getMiddlewareModules() {
    return import.meta.glob('/modules/*/src/middleware.ts', { eager: true });
}

export function getRegistryModules() {
    return import.meta.glob(['/src/registry/**/*.tsx', '/modules/*/src/registry/**/*.tsx'], { eager: true });
}

export function getI18nCoreLocales() {
    return import.meta.glob('../../../locales/*.json', { eager: true });
}

export function getI18nModuleLocales() {
    return import.meta.glob('../../../modules/*/locales/*.json', { eager: true });
}

export function getModuleConfigs() {
    return import.meta.glob('../../../modules/*/module.config.mjs', { eager: true });
}
