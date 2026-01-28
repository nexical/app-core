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
