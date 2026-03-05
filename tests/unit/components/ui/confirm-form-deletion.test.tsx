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
    expect(screen.getByText(/Delete Test Item/)).toBeDefined();
  });

  it('should enable delete button only when matched', () => {
    const onConfirm = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onConfirm={onConfirm} />);
    const input = screen.getByPlaceholderText('Type TEST-123 to confirm');
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });

    fireEvent.change(input, { target: { value: 'TEST-123' } });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should hit the safety branch if clicked when NOT matched', () => {
    const onConfirm = vi.fn();
    render(<ConfirmFormDeletion {...defaultProps} onConfirm={onConfirm} />);
    const deleteBtn = screen.getByRole('button', { name: 'Delete' });

    // Safety check: force call the handler even if JSDOM would ignore it
    // We remove 'disabled' to ensure fireEvent actually triggers the onClick handler
    deleteBtn.removeAttribute('disabled');

    fireEvent.click(deleteBtn);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should clear input when cancel is clicked', () => {
    render(<ConfirmFormDeletion {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type TEST-123 to confirm');

    fireEvent.change(input, { target: { value: 'TEST' } });
    expect(input).toHaveValue('TEST');

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(input).toHaveValue('');
  });
});
