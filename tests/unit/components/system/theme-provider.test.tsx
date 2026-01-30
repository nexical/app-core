/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/components/system/ThemeProvider';

const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('should provide default theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
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

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
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
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });
});
