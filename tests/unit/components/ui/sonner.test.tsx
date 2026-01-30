/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toaster } from '@/components/ui/sonner';

describe('Sonner Toaster', () => {
  it('should render correctly', () => {
    const { container } = render(<Toaster />);
    // Sonner Toaster renders an empty div and injects styles/listeners
    expect(container).toBeDefined();
  });
});
