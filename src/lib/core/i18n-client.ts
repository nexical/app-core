import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Prevent multiple initializations in the same environment
if (!i18next.isInitialized) {
  const isBrowser = typeof window !== 'undefined';

  // Get data from window if available (injected by Layout.astro)
  const i18nData = isBrowser ? window.__I18N_DATA__ : undefined;

  i18next
    .use(initReactI18next)

    .init({
      lng: i18nData?.language || 'en',
      fallbackLng: 'en',
      ns: ['translation'],
      defaultNS: 'translation',
      resources: i18nData?.store
        ? {
            [i18nData.language]: {
              translation: i18nData.store,
            },
          }
        : undefined,
      interpolation: {
        escapeValue: false,
      },
      // React specific options
      react: {
        useSuspense: false, // Avoids suspense issues in SSR/Islands
      },
      // Debug only in dev
      debug: import.meta.env.DEV && isBrowser,
    });
}

export default i18next;
