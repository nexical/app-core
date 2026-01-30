/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('OfflineIndicator', () => {
  it('should show indicator when offline event fires', () => {
    render(<OfflineIndicator />);

    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
  });

  it('should hide indicator when online event fires', () => {
    render(<OfflineIndicator />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
  });

  it('should allow dismissal', () => {
    render(<OfflineIndicator />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const dismissBtn = screen.getByRole('button');
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
  });
});
