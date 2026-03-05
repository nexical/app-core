/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '@/components/system/ThemeProvider';

const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value"> {theme} </span>
      <button onClick={() => setTheme('dark')}> Set Dark </button>
      <button onClick={() => setTheme('light')}> Set Light </button>
      <button onClick={() => setTheme('system')}> Set System </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
    vi.restoreAllMocks();
  });

  it('should provide default theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-value').textContent?.trim()).toBe('light');
  });

  it('should update theme and localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>,
    );

    const darkBtn = screen.getByText('Set Dark');
    act(() => {
      darkBtn.click();
    });

    expect(screen.getByTestId('theme-value').textContent?.trim()).toBe('dark');
    expect(localStorage.getItem('test-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('app-theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-value').textContent?.trim()).toBe('dark');
  });

  it('should handle system theme (dark)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should handle system theme (light)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('should handle setTheme to system', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );

    const systemBtn = screen.getByText('Set System');
    act(() => {
      systemBtn.click();
    });

    expect(screen.getByTestId('theme-value').textContent?.trim()).toBe('system');
    expect(localStorage.getItem('app-theme')).toBe('system');
  });
});
