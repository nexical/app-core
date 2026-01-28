/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

describe('config creation and merging', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        // @ts-ignore
        delete window.__APP_CONFIG__;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should prioritize window.__APP_CONFIG__ in browser', async () => {
        // @ts-ignore
        window.__APP_CONFIG__ = { PUBLIC_TEST_VAR: 'window-value' };
        const { createConfig } = await import('@/lib/core/config');

        const schema = z.object({ PUBLIC_TEST_VAR: z.string() });
        const config = createConfig(schema);

        expect(config.PUBLIC_TEST_VAR).toBe('window-value');
    });

    it('should fallback to process.env if window config is missing', async () => {
        process.env.PUBLIC_TEST_VAR = 'env-value';
        const { createConfig } = await import('@/lib/core/config');

        const schema = z.object({ PUBLIC_TEST_VAR: z.string() });
        const config = createConfig(schema);

        expect(config.PUBLIC_TEST_VAR).toBe('env-value');
    });

    it('should handle invalid config with warnings', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const { createConfig } = await import('@/lib/core/config');

        const schema = z.object({ REQUIRED_VAR: z.string() });
        const config = createConfig(schema);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid configuration'), expect.anything());
        expect(config).toEqual({});
    });

    it('should discover PUBLIC_ keys for publicConfig', async () => {
        process.env.PUBLIC_RUNTIME_VAR = 'runtime-value';
        const { publicConfig } = await import('@/lib/core/config');

        expect(publicConfig.PUBLIC_RUNTIME_VAR).toBe('runtime-value');
        expect(publicConfig.PUBLIC_SITE_NAME).toBeDefined();
    });

    it('should handle getProcessEnv failure', async () => {
        // Mock process to be undefined or throw
        const originalProcess = global.process;
        // @ts-ignore
        global.process = undefined;

        const { getProcessEnv } = await import('@/lib/core/config');
        expect(getProcessEnv('ANY')).toBeUndefined();

        global.process = originalProcess;
    });
});
