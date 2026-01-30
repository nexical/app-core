/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  it('should render correctly', () => {
    render(<Label>Username</Label>);
    const label = screen.getByText('Username');
    expect(label).toBeDefined();
    expect(label.getAttribute('data-slot')).toBe('label');
    expect(label.className).toContain('label-base');
  });

  it('should associate with an input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Label Text</Label>
        <input id="test-input" />
      </>,
    );
    const label = screen.getByText('Label Text');
    expect(label.getAttribute('for')).toBe('test-input');
  });
});
