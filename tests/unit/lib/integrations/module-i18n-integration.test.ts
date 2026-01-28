/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModuleI18nIntegration } from '@/lib/integrations/module-i18n-integration';

describe('ModuleI18nIntegration', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should handle sorting modules by phase and order', () => {
        const modules = [
            { name: 'theme', config: { type: 'theme', order: 10 } },
            { name: 'core', config: { type: 'core', order: 50 } },
            { name: 'feature', config: { type: 'feature', order: 1 } },
        ];

        // Access private sortModules via any cast
        const sorted = (ModuleI18nIntegration as any).sortModules(modules);

        expect(sorted[0].name).toBe('core');
        expect(sorted[1].name).toBe('feature');
        expect(sorted[2].name).toBe('theme');
    });

    it('should return unique languages from glob paths', async () => {
        // We can test the logic by mocking the glob results if we can reach it.
        // Since we can't easily mock import.meta.glob inside the class from outside,
        // we'll at least verify the methods run without error.
        const langs = await ModuleI18nIntegration.getAvailableLanguages();
        expect(Array.isArray(langs)).toBe(true);
    });

    it('should handle missing locales gracefully', async () => {
        const locale = await ModuleI18nIntegration.getMergedLocale('non-existent');
        expect(locale).toEqual({});
    });
});
