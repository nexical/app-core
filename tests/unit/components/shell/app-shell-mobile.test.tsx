/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppShellMobile } from '@/components/shell/app-shell-mobile';
import * as RegistryLoader from '@/lib/ui/registry-loader';
import { useShellStore } from '@/lib/ui/shell-store';

// Mock dependencies
vi.mock('@/lib/ui/registry-loader', () => ({
    getZoneComponents: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/ui/shell-store', () => ({
    useShellStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/core/config', () => ({
    config: { PUBLIC_SITE_NAME: 'Nexical Mobile' },
}));

// Mock components
vi.mock('@/components/ui/sheet', () => {
    return {
        Sheet: ({ children, open, onOpenChange }: any) => {
            // Trigger onOpenChange when simulated "closing"
            return (
                <div data-testid="mock-sheet" data-open={open}>
                    {children}
                    <button onClick={() => onOpenChange?.(false)}>Close</button>
                </div>
            );
        },
        SheetContent: ({ children }: any) => <div>{children}</div>,
        SheetTrigger: ({ children }: any) => <div>{children}</div>,
    };
});

const MockComponent = ({ name }: { name: string }) => <div data-testid={`mock-${name}`}>{name}</div>;

describe('AppShellMobile', () => {
    const mockStore = {
        detailPanelId: null,
        setDetailPanel: vi.fn(),
        panelProps: {},
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useShellStore).mockReturnValue(mockStore as any);
        vi.mocked(RegistryLoader.getZoneComponents).mockImplementation(async (zone: string) => {
            if (zone === 'nav-main') return [{ name: 'nav-item', order: 1, component: () => <MockComponent name="nav" /> }];
            if (zone === 'mobile-bottom') return [{ name: 'bottom-item', order: 1, component: () => <MockComponent name="bottom" /> }];
            if (zone === 'details-panel') return [{ name: 'details-item', order: 1, component: () => <MockComponent name="details" /> }];
            return [];
        });
    });

    it('should handle details panel state and closing', async () => {
        const setDetailPanel = vi.fn();
        vi.mocked(useShellStore).mockReturnValue({
            ...mockStore,
            detailPanelId: 'details-item',
            setDetailPanel
        } as any);

        await act(async () => {
            render(<AppShellMobile>Content</AppShellMobile>);
        });

        expect(await screen.findByText('Details')).toBeDefined();

        // Find "Close" button within the simulated details sheet
        const closeBtns = screen.getAllByText('Close');
        await act(async () => {
            closeBtns[1].click();
        });

        expect(setDetailPanel).toHaveBeenCalledWith(null);
    });

    it('should render null if active details panel not found', async () => {
        vi.mocked(useShellStore).mockReturnValue({
            ...mockStore,
            detailPanelId: 'missing-panel',
        } as any);

        await act(async () => {
            render(<AppShellMobile>Content</AppShellMobile>);
        });

        expect(screen.queryByTestId('mock-details')).toBeNull();
    });

    it('should open mobile menu', async () => {
        await act(async () => {
            render(<AppShellMobile>Content</AppShellMobile>);
        });

        const menuBtn = screen.getByTestId('shell-mobile-menu-btn');
        await act(async () => {
            menuBtn.click();
        });

        expect(await screen.findByTestId('mock-nav')).toBeDefined();
    });
});
