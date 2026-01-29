
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstallPrompt } from '@/components/pwa/install-prompt';

// Mock matchMedia
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // Deprecated
            removeListener: vi.fn(), // Deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
    sessionStorage.clear();
});

describe('InstallPrompt', () => {
    it('should show prompt on beforeinstallprompt event', () => {
        render(<InstallPrompt />);

        expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();

        const event = new Event('beforeinstallprompt');
        act(() => {
            window.dispatchEvent(event);
        });

        expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    });

    it('should not show if already installed (standalone mode)', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: true, // Installed
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        });

        render(<InstallPrompt />);

        const event = new Event('beforeinstallprompt');
        act(() => {
            window.dispatchEvent(event);
        });

        expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    });

    it('should handle install click', async () => {
        render(<InstallPrompt />);

        const promptMock = vi.fn();
        const userChoiceMock = Promise.resolve({ outcome: 'accepted' });

        const event: any = new Event('beforeinstallprompt');
        event.prompt = promptMock;
        event.userChoice = userChoiceMock;

        act(() => {
            window.dispatchEvent(event);
        });

        const installBtn = screen.getByTestId('install-btn');
        await act(async () => {
            fireEvent.click(installBtn);
        });

        expect(promptMock).toHaveBeenCalled();
        expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    });

    it('should handle dismiss', () => {
        render(<InstallPrompt />);

        act(() => {
            window.dispatchEvent(new Event('beforeinstallprompt'));
        });

        const dismissBtn = screen.getByText('Not now');
        fireEvent.click(dismissBtn);

        expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
        expect(sessionStorage.getItem('pwa-banner-dismissed')).toBe('true');
    });
});
