/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmDeletionDialog } from '@/components/confirm-deletion-dialog';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

describe('ConfirmDeletionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('should not call onConfirm if clicked when not matched (safety check)', async () => {
    render(<ConfirmDeletionDialog {...defaultProps} open={true} />);
    const submitBtn = screen.getByTestId('confirm-deletion-submit');
    submitBtn.removeAttribute('disabled');
    fireEvent.click(submitBtn);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('should not submit on enter if name does not match', async () => {
    render(<ConfirmDeletionDialog {...defaultProps} open={true} />);
    const input = screen.getByTestId('confirm-deletion-input');
    fireEvent.change(input, { target: { value: 'Wrong Item' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('should handle cancel click and controlled state', async () => {
    const onOpenChange = vi.fn();
    render(<ConfirmDeletionDialog {...defaultProps} open={true} onOpenChange={onOpenChange} />);

    const cancelBtn = screen.getByText('core.common.cancel');
    fireEvent.click(cancelBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show error message on failed confirmation', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('Deletion failed'));
    render(<ConfirmDeletionDialog {...defaultProps} onConfirm={onConfirm} open={true} />);

    const input = screen.getByTestId('confirm-deletion-input');
    const submitBtn = screen.getByTestId('confirm-deletion-submit');

    fireEvent.change(input, { target: { value: 'My Item' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Deletion failed')).toBeInTheDocument();
  });

  it('should handle non-Error catch block', async () => {
    const onConfirm = vi.fn().mockRejectedValue('String error');
    render(<ConfirmDeletionDialog {...defaultProps} onConfirm={onConfirm} open={true} />);

    const input = screen.getByTestId('confirm-deletion-input');
    const submitBtn = screen.getByTestId('confirm-deletion-submit');

    fireEvent.change(input, { target: { value: 'My Item' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('String error')).toBeInTheDocument();
  });
});
