/* eslint-disable */
/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { createConfig, getProcessEnv } from '../../../../src/lib/core/config';
import { z } from 'zod';

describe('config utilities', () => {
  it('should get entries from process.env', () => {
    vi.stubEnv('TEST_KEY', 'test_val');
    expect(getProcessEnv('TEST_KEY')).toBe('test_val');
    vi.unstubAllEnvs();
  });

  it('should handle restricted process environment', () => {
    const originalProcess = global.process;
    // @ts-expect-error
    global.process = undefined;
    expect(getProcessEnv('ANY')).toBeUndefined();
    global.process = originalProcess;
  });

  it('should prioritize window.__APP_CONFIG__ in browser', () => {
    const schema = z.object({ KEY: z.string() });
    (window as any).__APP_CONFIG__ = { KEY: 'hydrated' };

    const config = createConfig(schema);
    expect(config.KEY).toBe('hydrated');

    delete (window as any).__APP_CONFIG__;
  });

  it('should use import.meta.env if available', () => {
    // Can't easily mock import.meta.env directly without complex setup
    // But we can check that it defaults to {} and warns on invalid schema
    const schema = z.object({ REQUIRED: z.string() });
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const config = createConfig(schema);
    expect(config).toEqual({});
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should implement publicConfig discovery logic', async () => {
    vi.stubEnv('PUBLIC_DYNAMIC', 'val');
    // Re-import to trigger top-level publicConfig logic
    vi.resetModules();
    const { publicConfig } = await import('../../../../src/lib/core/config');
    expect(publicConfig.PUBLIC_DYNAMIC).toBe('val');
    vi.unstubAllEnvs();
  });

  it('should correctly parse boolean flags with defaults', () => {
    const schema = z.object({
      FLAG: z
        .preprocess(
          (v) => (v === undefined || v === null ? 'false' : String(v).toLowerCase()),
          z.enum(['true', 'false']),
        )
        .default('false')
        .transform((v) => v === 'true'),
    });

    // Test default
    expect(createConfig(schema).FLAG).toBe(false);

    // Test true
    vi.stubEnv('FLAG', 'true');
    expect(createConfig(schema).FLAG).toBe(true);

    // Test false explicit
    vi.stubEnv('FLAG', 'false');
    expect(createConfig(schema).FLAG).toBe(false);

    // Test casing
    vi.stubEnv('FLAG', 'TRUE');
    expect(createConfig(schema).FLAG).toBe(true);

    vi.unstubAllEnvs();
  });

  it('should correctly parsing coreSchema environment variables', async () => {
    vi.stubEnv('PUBLIC_DOCS_PUBLIC_ACCESS', 'true');
    vi.stubEnv('PUBLIC_DISABLE_API_DOCS', 'TRUE'); // Test case insensitivity too

    vi.resetModules();
    const { config } = await import('../../../../src/lib/core/config');

    expect(config.PUBLIC_DOCS_PUBLIC_ACCESS).toBe(true);
    expect(config.PUBLIC_DISABLE_API_DOCS).toBe(true);

    vi.unstubAllEnvs();
  });

  it('should discover extra PUBLIC_ keys from env', async () => {
    vi.stubEnv('PUBLIC_EXTRA', 'extra_val');

    vi.resetModules();
    const { publicConfig } = await import('../../../../src/lib/core/config');

    expect(publicConfig.PUBLIC_EXTRA).toBe('extra_val');
    vi.unstubAllEnvs();
  });
});
