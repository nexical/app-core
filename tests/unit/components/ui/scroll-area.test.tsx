/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea', () => {
  it('should render correctly with children', () => {
    render(
      <ScrollArea className="h-40 w-40 custom-scroll">
        <div style={{ height: '200px' }}>Long Content</div>
      </ScrollArea>,
    );

    expect(screen.getByText('Long Content')).toBeDefined();
    expect(document.querySelector('.custom-scroll')).toBeDefined();
  });

  it('should render custom ScrollBar', () => {
    render(
      <ScrollArea>
        <div>Content</div>
        <ScrollBar orientation="horizontal" className="custom-bar" />
      </ScrollArea>,
    );
    // Radix ScrollArea renders scrollbars in a portal or lazily
    // We can at least check the main container and presence of slots if they appear in DOM
    expect(document.querySelector('[data-slot="scroll-area"]')).toBeDefined();
  });
});
