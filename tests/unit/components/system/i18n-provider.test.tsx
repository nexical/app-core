/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nProvider } from '@/components/system/I18nProvider';
import i18n from '@/lib/core/i18n-client';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => (
    <div {...{ 'data-testid': 'i18next-provider' }}> {children} </div>
  ),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock i18n-client
vi.mock('@/lib/core/i18n-client', () => ({
  __esModule: true,
  default: {
    addResourceBundle: vi.fn(),
    changeLanguage: vi.fn(),
    language: 'en',
    t: (key: string) => key,
  },
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children and initialize i18next', () => {
    render(
      <I18nProvider>
        <div {...{ 'data-testid': 'child' }}> Hello </div>
      </I18nProvider>,
    );

    expect(screen.getByTestId('i18next-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should initialize with provided language and store', () => {
    const initialStore = { key: 'value' };
    render(
      <I18nProvider initialLanguage="fr" initialStore={initialStore}>
        <div>Hello </div>
      </I18nProvider>,
    );

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'fr',
      'translation',
      initialStore,
      true,
      true,
    );
    expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
  });

  it('should not call changeLanguage if already on the initialLanguage', () => {
    (i18n as unknown as { language: string }).language = 'de';
    render(
      <I18nProvider initialLanguage="de" initialStore={{}}>
        <div>Hello </div>
      </I18nProvider>,
    );

    expect(i18n.addResourceBundle).toHaveBeenCalled();
    expect(i18n.changeLanguage).not.toHaveBeenCalled();
  });
});
