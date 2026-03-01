import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/core/i18n-client';

declare global {
  interface Window {
    __I18N_DATA__?: {
      language: string;
      store: Record<string, unknown>;
      availableLanguages: string[];
    };
  }
}

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
  initialStore?: Record<string, unknown>;
  availableLanguages?: string[];
}

export function I18nProvider({ children, initialLanguage, initialStore }: I18nProviderProps) {
  // Always apply the server-injected store so fresh locale keys are available.
  // Using deep=true, overwrite=true ensures any new keys added since last load are picked up.
  if (initialLanguage && initialStore) {
    i18n.addResourceBundle(initialLanguage, 'translation', initialStore, true, true);
    if (i18n.language !== initialLanguage) {
      i18n.changeLanguage(initialLanguage);
    }
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
