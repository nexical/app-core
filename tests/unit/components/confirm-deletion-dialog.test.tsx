/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDeletionDialog } from '@/components/confirm-deletion-dialog';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

describe('ConfirmDeletionDialog', () => {
  const defaultProps = {
    itemName: 'My Item',
    itemType: 'Project',
    onConfirm: vi.fn(),
  };

  it('should render trigger if provided', () => {
    render(<ConfirmDeletionDialog {...defaultProps} trigger={<button>Delete</button>} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should open dialog and handle confirmation flow', async () => {
    render(<ConfirmDeletionDialog {...defaultProps} trigger={<button>Delete Trigger</button>} />);

    fireEvent.click(screen.getByText('Delete Trigger'));

    // Dialog content appears in portal
    const input = await screen.findByTestId('confirm-deletion-input');
    const submitBtn = screen.getByTestId('confirm-deletion-submit');

    expect(submitBtn).toBeDisabled();

    // Type incorrect name
    fireEvent.change(input, { target: { value: 'Wrong Name' } });
    expect(submitBtn).toBeDisabled();

    // Type correct name
    fireEvent.change(input, { target: { value: 'My Item' } });
    expect(submitBtn).not.toBeDisabled();

    // Submit
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
  });

  it('should handle enter key submission', async () => {
    render(<ConfirmDeletionDialog {...defaultProps} open={true} />);

    const input = screen.getByTestId('confirm-deletion-input');

    fireEvent.change(input, { target: { value: 'My Item' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });
});
