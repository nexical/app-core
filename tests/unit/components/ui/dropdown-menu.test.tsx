/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

describe('DropdownMenu', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="1" onValueChange={() => {}}>
            <DropdownMenuRadioItem value="1">Radio 1</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>Sub Content</DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByText('Open Menu');
    // Radix UI open sequence for JSDOM
    fireEvent.pointerDown(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(trigger, { pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/Label/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Item 1/i)).toBeInTheDocument();
  });

  it('should render shortcuts and inset props correctly', async () => {
    render(
      <DropdownMenu open={true}>
        <DropdownMenuContent>
          <DropdownMenuItem inset>
            Save <DropdownMenuShortcut>CMD-S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuLabel inset>Settings</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Use specific regex for the shortcut to avoid collision with 'Settings' or 'Save'
    expect(screen.getByText(/CMD-S/)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toHaveClass('dropdown-inset');
    expect(screen.getByText(/Settings/i)).toHaveClass('dropdown-inset');
    expect(screen.getByText(/More/i)).toHaveClass('dropdown-inset');
  });
});
