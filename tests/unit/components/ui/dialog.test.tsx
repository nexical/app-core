/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Dialog', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Main Content</div>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);

    expect(await screen.findByText('Dialog Title')).toBeDefined();
    expect(screen.getByText('Dialog Description')).toBeDefined();
    expect(screen.getByText('Main Content')).toBeDefined();
  });
});
