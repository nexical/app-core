/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '@/components/ui/popover';

describe('Popover', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverAnchor>Anchor</PopoverAnchor>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent className="custom-pop">Popover Content</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByText('Open Popover');
    fireEvent.click(trigger);

    expect(await screen.findByText('Popover Content')).toBeDefined();
    expect(document.querySelector('.custom-pop')).toBeDefined();
  });
});
