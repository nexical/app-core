import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { createConfig } from '@/lib/core/config';

describe('config utility', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        // Clear window mock if any
        if (typeof window !== 'undefined') {
            delete (window as any).__APP_CONFIG__;
        }
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should create config from process.env', () => {
        process.env.TEST_VAR = 'hello';
        const schema = z.object({
            TEST_VAR: z.string()
        });
        const config = createConfig(schema);
        expect(config.TEST_VAR).toBe('hello');
    });

    it('should prioritize window.__APP_CONFIG__ over process.env', () => {
        process.env.TEST_VAR = 'env-value';

        // Mock global window
        global.window = {
            __APP_CONFIG__: {
                TEST_VAR: 'window-value'
            }
        } as any;

        const schema = z.object({
            TEST_VAR: z.string()
        });
        const config = createConfig(schema);
        expect(config.TEST_VAR).toBe('window-value');

        // Cleanup global window
        delete (global as any).window;
    });

    it('should use default values from zod schema', () => {
        const schema = z.object({
            DEFAULT_VAR: z.string().default('default-value')
        });
        const config = createConfig(schema);
        expect(config.DEFAULT_VAR).toBe('default-value');
    });

    it('should handle invalid config gracefully (logs warning and returns empty or default)', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const schema = z.object({
            REQUIRED_VAR: z.string()
        });

        // No REQUIRED_VAR in env
        const config = createConfig(schema);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid configuration:'), expect.anything());
        expect(config.REQUIRED_VAR).toBeUndefined();

        consoleSpy.mockRestore();
    });

    it('should handle boolean transformation in preprocess', () => {
        process.env.BOOL_VAR = 'true';
        const schema = z.object({
            BOOL_VAR: z.preprocess((v) => String(v).toLowerCase() === 'true', z.boolean())
        });
        const config = createConfig(schema);
        expect(config.BOOL_VAR).toBe(true);

        process.env.BOOL_VAR = 'false';
        const config2 = createConfig(schema);
        expect(config2.BOOL_VAR).toBe(false);
    });
});
