/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock side-effect heavy modules
vi.mock(' @/lib/api/api-docs', () => ({
  defineApi: vi.fn((handler) => handler),
  generateDocs: vi.fn(),
}));
vi.mock(' @/lib/core/client-init', () => ({
  initializeClientModules: vi.fn(),
}));
vi.mock(' @/lib/modules/module-init', () => ({
  initializeModules: vi.fn(),
}));

vi.mock('../../../../src/components/shell/app-shell-desktop', () => ({
  AppShellDesktop: () => null,
}));
vi.mock('../../../../src/components/shell/app-shell-mobile', () => ({
  AppShellMobile: () => null,
}));
vi.mock('../../../../src/components/shell/api-docs-shell', () => ({ ApiDocsShell: () => null }));

describe('GlobHelper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return glob results for core inits', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const inits = GlobHelper.getCoreInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for module inits', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const inits = GlobHelper.getModuleInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for registry modules', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const modules = GlobHelper.getRegistryModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for api modules', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const modules = GlobHelper.getApiModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for client module inits', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const inits = GlobHelper.getClientModuleInits();
    expect(typeof inits).toBe('object');
  });

  it('should return glob results for middleware modules', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const modules = GlobHelper.getMiddlewareModules();
    expect(typeof modules).toBe('object');
  });

  it('should return glob results for core locales', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const locales = GlobHelper.getI18nCoreLocales();
    expect(typeof locales).toBe('object');
  });

  it('should return glob results for module locales', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const locales = GlobHelper.getI18nModuleLocales();
    expect(typeof locales).toBe('object');
  });

  it('should return glob results for module configs', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const configs = GlobHelper.getModuleConfigs();
    expect(typeof configs).toBe('object');
  });

  it('should return glob results for module inits (server)', async () => {
    const { GlobHelper } = await import('../../../../src/lib/core/glob-helper');
    const inits = GlobHelper.getModuleInits();
    expect(typeof inits).toBe('object');
  });
});
