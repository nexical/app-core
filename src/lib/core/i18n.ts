import { ModuleI18nIntegration } from '../integrations/module-i18n-integration';
import { config } from './config';

export type TranslationFunction = (key: string, params?: Record<string, string>) => string;

/**
 * Creates a translation function for a specific language.
 */
export async function getTranslation(lang?: string): Promise<TranslationFunction> {
  const targetLang = lang || config.PUBLIC_DEFAULT_LANGUAGE || 'en';
  const store = await ModuleI18nIntegration.getMergedLocale(targetLang);

  return function t(key: string, params?: Record<string, string>) {
    let text = key.split('.').reduce((o: any, i) => o?.[i], store) || key;

    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }
    return typeof text === 'string' ? text : key;
  };
}

/**
 * Gets a translation function for the server-side context.
 * Uses cookies to determine the language.
 */
export async function getServerTranslation(request: Request) {
  const cookies = request.headers.get('cookie') || '';
  // Simple cookie parsing
  const langCookie = cookies.split(';').find((c) => c.trim().startsWith('i18next='));
  const lang = langCookie
    ? langCookie.split('=')[1].trim()
    : config.PUBLIC_DEFAULT_LANGUAGE || 'en';

  return await getTranslation(lang);
}
