/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTranslation, getServerTranslation } from '@/lib/core/i18n';
import { ModuleI18nIntegration } from '@/lib/integrations/module-i18n-integration';

vi.mock('@/lib/integrations/module-i18n-integration', () => ({
    ModuleI18nIntegration: {
        getMergedLocale: vi.fn(),
    },
}));

describe('i18n', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should translate keys with parameters', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({
            greeting: 'Hello {{name}}!',
            nested: { key: 'Val' }
        });

        const t = await getTranslation('en');
        expect(t('greeting', { name: 'Alice' })).toBe('Hello Alice!');
        expect(t('nested.key')).toBe('Val');
        expect(t('missing')).toBe('missing');
    });

    it('should handle non-string translations gracefully', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({
            arr: [1, 2]
        });
        const t = await getTranslation('en');
        expect(t('arr')).toBe('arr');
    });

    it('should getServerTranslation from cookie', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({ hi: 'hola' });
        const request = new Request('http://localhost', {
            headers: { cookie: 'other=val; i18next=es' }
        });

        const t = await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith('es');
        expect(t('hi')).toBe('hola');
    });

    it('should fallback to default lang if no cookie', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({});
        const request = new Request('http://localhost');
        await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith('en');
    });
});
