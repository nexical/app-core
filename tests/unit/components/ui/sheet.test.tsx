/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Sheet', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Sheet Title </SheetTitle>
            <SheetDescription> Sheet Description </SheetDescription>
          </SheetHeader>
          <div> Sheet Content </div>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByText('Open Sheet');
    fireEvent.click(trigger);

    expect(await screen.findByText('Sheet Title')).toBeDefined();
    expect(screen.getByText('Sheet Description')).toBeDefined();
    expect(screen.getByText('Sheet Content')).toBeDefined();

    const content = document.querySelector('[data-slot="sheet-content"]');
    expect(content).toHaveClass('sheet-content-left');
  });

  it('should render with footer, close button, and different sides', async () => {
    const { Sheet, SheetTrigger, SheetContent, SheetFooter, SheetClose } =
      await import('@/components/ui/sheet');

    const { rerender } = render(
      <Sheet>
        <SheetTrigger>Open </SheetTrigger>
        <SheetContent side="top">
          <SheetFooter>Footer Content </SheetFooter>
          <SheetClose> Close Action </SheetClose>
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByText('Open'));
    expect(await screen.findByText('Footer Content')).toBeInTheDocument();
    expect(screen.getByText('Close Action')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass('sheet-content-top');

    rerender(
      <Sheet>
        <SheetTrigger>Open </SheetTrigger>
        <SheetContent side="bottom">
          <div>Bottom </div>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass(
      'sheet-content-bottom',
    );

    rerender(
      <Sheet>
        <SheetTrigger>Open </SheetTrigger>
        <SheetContent side="right">
          <div>Right </div>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass(
      'sheet-content-right',
    );
  });
});
