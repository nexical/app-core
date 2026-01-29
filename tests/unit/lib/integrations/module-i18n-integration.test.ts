/** @vitest-environment node */
import { describe, it, expect, vi } from 'vitest';
import { ModuleI18nIntegration } from '@/lib/integrations/module-i18n-integration';

describe('module-i18n-integration', () => {
    it('should sort modules by phase and order', () => {
        const modules = [
            { name: 'theme', config: { type: 'theme', order: 10 } },
            { name: 'feat1', config: { type: 'feature', order: 100 } },
            { name: 'feat2', config: { type: 'feature', order: 10 } },
            { name: 'core', config: { type: 'core', order: 1 } },
            { name: 'unknown', config: { type: 'unknown', order: 5 } },
        ] as any;

        const sorted = (ModuleI18nIntegration as any).sortModules(modules);

        expect(sorted[0].name).toBe('core');
        expect(sorted[1].name).toBe('unknown'); // phase 20 (feature fallback), order 5
        expect(sorted[2].name).toBe('feat2');   // phase 20, order 10
        expect(sorted[3].name).toBe('feat1');   // phase 20, order 100
        expect(sorted[4].name).toBe('theme');   // phase 40
    });

    it('should handle default values in sorting', () => {
        const modules = [
            { name: 'b', config: { type: 'feature' } }, // order defaults to 50
            { name: 'a', config: { type: 'feature', order: 10 } },
        ] as any;

        const sorted = (ModuleI18nIntegration as any).sortModules(modules);
        expect(sorted[0].name).toBe('a');
        expect(sorted[1].name).toBe('b');
    });
});
