/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { useTheme } from '@/components/system/ThemeProvider';
import { useTranslation } from 'react-i18next';

vi.mock('@/components/system/ThemeProvider', () => ({
  useTheme: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('ThemeSelector', () => {
  const setTheme = vi.fn();
  const t = vi.fn((key) => key);

  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'light', setTheme } as any);
    vi.mocked(useTranslation).mockReturnValue({ t } as any);
  });

  it('should render correctly', () => {
    render(<ThemeSelector />);
    expect(screen.getByTestId('theme-selector')).toBeDefined();
  });

  it('should toggle theme when clicked', () => {
    render(<ThemeSelector />);
    const button = screen.getByTestId('theme-selector');
    fireEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle from dark to light', () => {
    vi.mocked(useTheme).mockReturnValue({ theme: 'dark', setTheme } as any);
    render(<ThemeSelector />);
    const button = screen.getByTestId('theme-selector');
    fireEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
