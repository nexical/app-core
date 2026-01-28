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

    it('should replace parameters in translations', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({
            greeting: 'Hello {{name}}!',
            nested: { key: 'Val' }
        });

        const t = await getTranslation('en');
        expect(t('greeting', { name: 'Alice' })).toBe('Hello Alice!');
        expect(t('nested.key')).toBe('Val');
        expect(t('missing')).toBe('missing');
    });

    it('should derive lang from cookie in getServerTranslation', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({
            btn: 'Click'
        });

        const request = new Request('http://localhost', {
            headers: { cookie: 'i18next=es' }
        });

        const t = await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith('es');
        expect(t('btn')).toBe('Click');
    });

    it('should fallback to default lang in getServerTranslation', async () => {
        vi.mocked(ModuleI18nIntegration.getMergedLocale).mockResolvedValue({});
        const request = new Request('http://localhost');
        await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith(expect.any(String));
    });
});
