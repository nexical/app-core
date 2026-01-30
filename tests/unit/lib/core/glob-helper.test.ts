/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock side-effect heavy modules
vi.mock('@/lib/api/api-docs', () => ({
  defineApi: vi.fn((handler) => handler),
  generateDocs: vi.fn(),
}));
vi.mock('@/lib/core/client-init', () => ({
  initializeClientModules: vi.fn(),
}));
vi.mock('@/lib/modules/module-init', () => ({
  initializeModules: vi.fn(),
}));

vi.mock('../../../../src/components/shell/app-shell-desktop', () => ({
  AppShellDesktop: () => null,
}));
vi.mock('../../../../src/components/shell/app-shell-mobile', () => ({
  AppShellMobile: () => null,
}));
vi.mock('../../../../src/components/shell/api-docs-shell', () => ({ ApiDocsShell: () => null }));

describe('glob-helper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return glob results for core inits', async () => {
    const { getCoreInits } = await import('../../../../src/lib/core/glob-helper');
    const inits = getCoreInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for module inits', async () => {
    const { getModuleInits } = await import('../../../../src/lib/core/glob-helper');
    const inits = getModuleInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for registry modules', async () => {
    const { getRegistryModules } = await import('../../../../src/lib/core/glob-helper');
    const modules = getRegistryModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for api modules', async () => {
    const { getApiModules } = await import('../../../../src/lib/core/glob-helper');
    const modules = getApiModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for client module inits', async () => {
    const { getClientModuleInits } = await import('../../../../src/lib/core/glob-helper');
    const inits = getClientModuleInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for middleware modules', async () => {
    const { getMiddlewareModules } = await import('../../../../src/lib/core/glob-helper');
    const modules = getMiddlewareModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for core locales', async () => {
    const { getI18nCoreLocales } = await import('../../../../src/lib/core/glob-helper');
    const locales = getI18nCoreLocales();
    expect(typeof locales).toBe('object');
  });

  it('should return glob results for module locales', async () => {
    const { getI18nModuleLocales } = await import('../../../../src/lib/core/glob-helper');
    const locales = getI18nModuleLocales();
    expect(typeof locales).toBe('object');
  });

  it('should return glob results for module configs', async () => {
    const { getModuleConfigs } = await import('../../../../src/lib/core/glob-helper');
    const configs = getModuleConfigs();
    expect(typeof configs).toBe('object');
  });

  it('should return glob results for module inits (server)', async () => {
    const { getModuleInits } = await import('../../../../src/lib/core/glob-helper');
    const inits = getModuleInits();
    expect(typeof inits).toBe('object');
  });
});
