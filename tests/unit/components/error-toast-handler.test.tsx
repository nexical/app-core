
/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorToastHandler } from '@/components/error-toast-handler';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ErrorToastHandler', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
            writable: true,
        });
        window.history.replaceState = vi.fn();
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
    });

    it('should show toast on unauthorized error', () => {
        window.location.search = '?error=unauthorized';
        render(<ErrorToastHandler />);

        expect(toast.error).toHaveBeenCalledWith('core.errors.unauthorized.title', {
            description: 'core.errors.unauthorized.description',
        });
        expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/');
    });

    it('should not show toast if error param is missing or different', () => {
        window.location.search = '?error=other';
        render(<ErrorToastHandler />);

        expect(toast.error).not.toHaveBeenCalled();
    });
});
