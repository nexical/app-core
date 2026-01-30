/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SystemWrapper } from '@/components/system/SystemWrapper';

// Mock I18nProvider to isolate test
vi.mock('@/components/system/I18nProvider', () => ({
  I18nProvider: ({ children, initialLanguage }: any) => (
    <div data-testid="i18n-provider" data-lang={initialLanguage}>
      {children}
    </div>
  ),
}));

describe('SystemWrapper', () => {
  it('should pass i18n data to I18nProvider', () => {
    const i18nData = {
      language: 'es',
      store: { hello: 'hola' },
      availableLanguages: ['en', 'es'],
    };

    render(
      <SystemWrapper i18nData={i18nData}>
        <div data-testid="child">Child</div>
      </SystemWrapper>,
    );

    const provider = screen.getByTestId('i18n-provider');
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute('data-lang', 'es');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
