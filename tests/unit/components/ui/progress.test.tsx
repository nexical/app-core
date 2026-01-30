/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from '@/components/ui/progress';

describe('Progress', () => {
  it('should render correctly with value', () => {
    render(<Progress value={50} data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeDefined();

    const bar = progress.firstChild as HTMLElement;
    expect(bar.style.transform).toBe('translateX(-50%)');
  });

  it('should handle missing value (defaults to 0)', () => {
    render(<Progress data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    const bar = progress.firstChild as HTMLElement;
    expect(bar.style.transform).toBe('translateX(-100%)');
  });
});
