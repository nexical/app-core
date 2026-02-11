/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmFormDeletion } from '@/components/ui/confirm-form-deletion';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ConfirmFormDeletion', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    resourceName: 'Test Item',
    resourceIdentifier: 'TEST-123',
    onConfirm: vi.fn(),
  };

  it('should render correctly when open', () => {
    render(<ConfirmFormDeletion {...defaultProps} />);
    expect(screen.getByText('Delete Test Item?')).toBeDefined();
    expect(screen.getAllByText(/TEST-123/)[0]).toBeDefined();
    expect(screen.getByPlaceholderText('Type TEST-123 to confirm')).toBeDefined();
  });

  it('should enable delete button only when identifier is correctly typed', () => {
    const onConfirm = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText('Type TEST-123 to confirm');
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(deleteButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'WRONG' } });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'TEST-123' } });
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should enable delete button when "DELETE" is typed', () => {
    const onConfirm = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText('Type TEST-123 to confirm');
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should handle cancel click', () => {
    const onOpenChange = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onOpenChange={onOpenChange} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const input = screen.getByPlaceholderText('Type TEST-123 to confirm') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'some value' } });
    fireEvent.click(cancelButton);
    expect(input.value).toBe('');
  });

  it('should not call onConfirm if clicked when not matched (safety check)', () => {
    const onConfirm = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' }) as HTMLButtonElement;
    // JSDOM ignores clicks on disabled buttons. We remove the attribute to force the handler to run.
    deleteButton.removeAttribute('disabled');
    fireEvent.click(deleteButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
