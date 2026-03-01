import React, { useEffect } from 'react';
import { I18nProvider } from './I18nProvider';

interface I18nData {
  language: string;
  store: Record<string, unknown>;
  availableLanguages: string[];
}

interface SystemWrapperProps {
  children: React.ReactNode;
  i18nData: I18nData;
}

type WindowWithLoader = Window & { __hideLoader?: () => void };

export function SystemWrapper({ children, i18nData }: SystemWrapperProps) {
  useEffect(() => {
    // Fallback: hide the loader shortly after SystemWrapper mounts.
    // MasterShell calls __hideLoader immediately on its own mount,
    // so this only fires meaningfully on pages without MasterShell (showShell=false).
    const timer = setTimeout(() => {
      const w = window as WindowWithLoader;
      if (typeof w.__hideLoader === 'function') {
        w.__hideLoader();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

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
