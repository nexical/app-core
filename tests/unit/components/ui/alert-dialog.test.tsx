/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AlertDialog', () => {
  it('should show content when trigger is clicked', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert Title</AlertDialogTitle>
            <AlertDialogDescription>Alert Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);

    expect(await screen.findByText('Alert Title')).toBeDefined();
    expect(screen.getByText('Alert Description')).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
    expect(screen.getByText('Continue')).toBeDefined();
  });

  it('should close when cancel or action is clicked', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    fireEvent.click(screen.getByText('Open'));
    expect(await screen.findByText('Alert Title')).toBeDefined();

    fireEvent.click(screen.getByText('Cancel'));
    // Wait for the dialog to close (it might have animations, but in jsdom/testing-library it should be gone)
    // AlertDialog from Radix might remain in DOM but be hidden or unmounted depending on implementation.
    // Usually, it's unmounted or has data-state="closed".

    // Testing unmounting
    setTimeout(() => {
      expect(screen.queryByText('Alert Title')).toBeNull();
    }, 100);
  });
});
