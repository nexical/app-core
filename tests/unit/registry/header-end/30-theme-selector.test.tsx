/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import HeaderThemeSelector from '../../../../src/registry/header-end/30-theme-selector';

// Mock the ThemeSelector component
vi.mock('@/components/ui/theme-selector', () => ({
  ThemeSelector: () => <div data-testid="mock-theme-selector">Theme Selector</div>,
}));

describe('HeaderThemeSelector Registry Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the theme selector in a flex container', () => {
    render(<HeaderThemeSelector />);

    const container = screen.getByTestId('mock-theme-selector').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(screen.getByTestId('mock-theme-selector')).toBeDefined();
  });
});
