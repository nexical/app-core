import { vi } from 'vitest';

export const GlobHelper = {
  getCoreInits: vi.fn(() => ({})),
  getModuleInits: vi.fn(() => ({})),
  getClientModuleInits: vi.fn(() => ({})),
  getClientModuleInitsEager: vi.fn(() => ({})),
  getMiddlewareModules: vi.fn(() => ({})),
  getRegistryModules: vi.fn(() => ({})),
  getI18nCoreLocales: vi.fn(() => ({})),
  getI18nModuleLocales: vi.fn(() => ({})),
  getModuleConfigs: vi.fn(() => ({})),
  getApiModules: vi.fn(() => ({})),
};
