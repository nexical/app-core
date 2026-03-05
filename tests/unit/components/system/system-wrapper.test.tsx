import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { SystemWrapper } from '@/components/system/SystemWrapper';

// Mock I18nProvider using absolute path alias
vi.mock('@/components/system/I18nProvider', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div id="i18n-provider-mock"> {children} </div>
  ),
}));

describe('SystemWrapper', () => {
  const i18nData = {
    language: 'en',
    store: {},
    availableLanguages: ['en'],
  };

  it('should render its children and I18nProvider', () => {
    render(
      <SystemWrapper i18nData={i18nData}>
        <div {...{ 'data-testid': 'child' }}> Test Content </div>
      </SystemWrapper>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(document.getElementById('i18n-provider-mock')).toBeInTheDocument();
  });

  it('should hide loader via __hideLoader after timeout', async () => {
    vi.useFakeTimers();
    const hideLoader = vi.fn();
    (window as unknown as { __hideLoader: unknown }).__hideLoader = hideLoader;

    render(
      <SystemWrapper i18nData={i18nData}>
        <div>Content </div>
      </SystemWrapper>,
    );

    expect(hideLoader).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(hideLoader).toHaveBeenCalled();

    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>).__hideLoader;
  });

  it('should not throw if __hideLoader is not a function', () => {
    vi.useFakeTimers();
    (window as unknown as { __hideLoader: unknown }).__hideLoader = 'not-a-function';

    render(
      <SystemWrapper i18nData={i18nData}>
        <div>Content </div>
      </SystemWrapper>,
    );

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(150);
      });
    }).not.toThrow();

    vi.useRealTimers();
    delete (window as unknown as { __hideLoader?: unknown }).__hideLoader;
  });
});
