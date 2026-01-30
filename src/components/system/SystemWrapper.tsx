import React from 'react';
import { I18nProvider } from './I18nProvider';

interface I18nData {
  language: string;
  store: Record<string, any>;
  availableLanguages: string[];
}

interface SystemWrapperProps {
  children: React.ReactNode;
  i18nData: I18nData;
}

export function SystemWrapper({ children, i18nData }: SystemWrapperProps) {
  return (
    <I18nProvider
      initialLanguage={i18nData.language}
      initialStore={i18nData.store}
      availableLanguages={i18nData.availableLanguages}
    >
      {children}
    </I18nProvider>
  );
}
