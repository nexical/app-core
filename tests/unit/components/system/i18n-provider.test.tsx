/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nProvider } from '@/components/system/I18nProvider';
import i18n from '@/lib/core/i18n-client';

// Mock dependencies
vi.mock('@/lib/core/i18n-client', () => ({
  default: {
    hasResourceBundle: vi.fn(),
    addResourceBundle: vi.fn(),
    changeLanguage: vi.fn(),
    language: 'en',
  },
}));

vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18next-provider">{children}</div>
  ),
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children wrapped in I18nextProvider', () => {
    render(
      <I18nProvider>
        <div data-testid="child">Child</div>
      </I18nProvider>,
    );

    expect(screen.getByTestId('i18next-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should hydrated translations when initial data is provided', () => {
    const initialStore = { key: 'value' };
    vi.mocked(i18n.hasResourceBundle).mockReturnValue(false);

    render(
      <I18nProvider initialLanguage="fr" initialStore={initialStore}>
        <div>Child</div>
      </I18nProvider>,
    );

    expect(i18n.hasResourceBundle).toHaveBeenCalledWith('fr', 'translation');
    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'fr',
      'translation',
      initialStore,
      true,
      true,
    );
    expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
  });

  it('should not add resource bundle if already present', () => {
    const initialStore = { key: 'value' };
    vi.mocked(i18n.hasResourceBundle).mockReturnValue(true);

    render(
      <I18nProvider initialLanguage="fr" initialStore={initialStore}>
        <div>Child</div>
      </I18nProvider>,
    );

    expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
  });
});
