/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

// We need to mock import.meta.env
// Vitest handles this, but we might need to resetModules to test different scenarios
const resetConfig = async () => {
    vi.resetModules();
    const { createConfig } = await import('@/lib/core/config');
    return createConfig;
};

describe('Core Config: createConfig', () => {
    const backupEnv = { ...process.env };
    const schema = z.object({
        TEST_KEY: z.string().default('default-value'),
        REQUIRED_KEY: z.string(),
    });

    beforeEach(() => {
        // Clear all globals to start fresh
        vi.unstubAllGlobals();
        vi.stubGlobal('process', { env: {} });
    });

    afterEach(() => {
        process.env = backupEnv;
        vi.unstubAllGlobals();
    });

    it('should use default values if nothing is provided', async () => {
        vi.stubGlobal('window', undefined);
        const createConfig = await resetConfig();
        const config = createConfig(z.object({
            KEY: z.string().default('default')
        }));
        expect(config.KEY).toBe('default');
    });

    it('should prefer hydrated config from window.__APP_CONFIG__', async () => {
        const mockConfig = { TEST_KEY: 'hydrated-value', REQUIRED_KEY: 'present' };
        vi.stubGlobal('window', {
            __APP_CONFIG__: mockConfig
        });

        const createConfig = await resetConfig();
        const config = createConfig(schema);

        expect(config.TEST_KEY).toBe('hydrated-value');
        expect(config.REQUIRED_KEY).toBe('present');
    });

    it('should use process.env as fallback in server environment', async () => {
        vi.stubGlobal('window', undefined);
        process.env.TEST_KEY = 'env-value';
        process.env.REQUIRED_KEY = 'required-value';

        const createConfig = await resetConfig();
        const config = createConfig(schema);
        expect(config.TEST_KEY).toBe('env-value');
        expect(config.REQUIRED_KEY).toBe('required-value');
    });

    it('should warn and return empty/invalid config if schema validation fails', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const createConfig = await resetConfig();
        const config = createConfig(z.object({
            STRICT_KEY: z.string()
        }));

        expect(consoleSpy).toHaveBeenCalledWith('Invalid configuration:', expect.anything());
        expect(config).toEqual({});
    });
});

describe('Core Config: publicConfig', () => {
    const backupEnv = { ...process.env };

    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.stubGlobal('process', { env: { PUBLIC_TEST_VAR: 'env-value' } });
    });

    afterEach(() => {
        process.env = backupEnv;
        vi.unstubAllGlobals();
    });

    it('should expose PUBLIC_ variables from process.env', async () => {
        vi.resetModules();
        const { publicConfig } = await import('@/lib/core/config');
        expect(publicConfig.PUBLIC_TEST_VAR).toBe('env-value');
    });

    it('should expose PUBLIC_ variables from internal defaults', async () => {
        vi.resetModules();
        const { publicConfig } = await import('@/lib/core/config');
        expect(publicConfig.PUBLIC_SITE_NAME).toBeDefined();
        expect(publicConfig.PUBLIC_SITE_NAME).toBe('My Application');
    });
});

describe('Core Config: coreSchema', () => {
    it('should correctly preprocess and transform boolean-like strings', async () => {
        const createConfig = await resetConfig();
        const schema = z.object({
            PUBLIC_DOCS_PUBLIC_ACCESS: z.preprocess((v) => (v === undefined || v === null) ? 'false' : String(v).toLowerCase(), z.enum(['true', 'false'])).default('false').transform((v) => v === 'true'),
        });

        // Test undefined -> false
        const conf1 = createConfig(schema);
        expect(conf1.PUBLIC_DOCS_PUBLIC_ACCESS).toBe(false);

        // Test 'true' -> true
        vi.stubGlobal('process', { env: { PUBLIC_DOCS_PUBLIC_ACCESS: 'true' } });
        vi.resetModules();
        const conf2 = createConfig(schema);
        expect(conf2.PUBLIC_DOCS_PUBLIC_ACCESS).toBe(true);

        // Test null (via stubbing)
        vi.stubGlobal('process', { env: { PUBLIC_DOCS_PUBLIC_ACCESS: null } });
        vi.resetModules();
        const conf3 = createConfig(schema);
        expect(conf3.PUBLIC_DOCS_PUBLIC_ACCESS).toBe(false);

        // Test lowercase transform
        vi.stubGlobal('process', { env: { PUBLIC_DOCS_PUBLIC_ACCESS: 'TRUE' } });
        vi.resetModules();
        const conf4 = createConfig(schema);
        expect(conf4.PUBLIC_DOCS_PUBLIC_ACCESS).toBe(true);
    });

    it('should correctly handle PUBLIC_DISABLE_API_DOCS', async () => {
        vi.resetModules();
        const { config } = await import('@/lib/core/config');
        expect(config.PUBLIC_DISABLE_API_DOCS).toBe(false); // Default
    });

    it('should correctly handle PUBLIC_DISABLE_API_DOCS set to true', async () => {
        vi.stubGlobal('process', { env: { PUBLIC_DISABLE_API_DOCS: 'TRUE' } });
        vi.resetModules();
        const { config } = await import('@/lib/core/config');
        expect(config.PUBLIC_DISABLE_API_DOCS).toBe(true);
    });
});

describe('Core Config: getProcessEnv', () => {
    it('should return undefined if process is not defined', async () => {
        vi.stubGlobal('process', undefined);
        vi.resetModules();
        const { getProcessEnv } = await import('@/lib/core/config');
        const val = getProcessEnv('ANY');
        expect(val).toBe(undefined);
    });

    it('should return value from process.env if defined', async () => {
        vi.stubGlobal('process', { env: { FOO: 'bar' } });
        vi.resetModules();
        const { getProcessEnv } = await import('@/lib/core/config');
        expect(getProcessEnv('FOO')).toBe('bar');
    });
});
