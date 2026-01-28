import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTranslation, getServerTranslation } from '@/lib/core/i18n';
import { ModuleI18nIntegration } from '@/lib/integrations/module-i18n-integration';

vi.mock('@/lib/integrations/module-i18n-integration', () => ({
    ModuleI18nIntegration: {
        getMergedLocale: vi.fn()
    }
}));

describe('i18n utility', () => {
    const mockLocale = {
        common: {
            welcome: 'Welcome {{name}}',
            nested: {
                key: 'Value'
            }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (ModuleI18nIntegration.getMergedLocale as any).mockResolvedValue(mockLocale);
    });

    it('should translate correctly using nested keys', async () => {
        const t = await getTranslation('en');
        expect(t('common.nested.key')).toBe('Value');
    });

    it('should substitute parameters correctly', async () => {
        const t = await getTranslation('en');
        expect(t('common.welcome', { name: 'Adrian' })).toBe('Welcome Adrian');
    });

    it('should return the key if translation is missing', async () => {
        const t = await getTranslation('en');
        expect(t('missing.key')).toBe('missing.key');
    });

    it('should determine language from cookies in getServerTranslation', async () => {
        const request = new Request('http://localhost:4321', {
            headers: {
                'cookie': 'i18next=fr; other=value'
            }
        });

        await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith('fr');
    });

    it('should fallback to default language if cookie is missing', async () => {
        const request = new Request('http://localhost:4321');
        await getServerTranslation(request);
        expect(ModuleI18nIntegration.getMergedLocale).toHaveBeenCalledWith('en');
    });
});
