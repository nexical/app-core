/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppShellDesktop } from '@/components/shell/app-shell-desktop';
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
    config: { PUBLIC_SITE_NAME: 'Nexical' },
}));

const MockComponent = ({ name, title }: { name: string, title?: string }) => <div data-testid={`mock-${name}`}>{title || name}</div>;

describe('AppShellDesktop', () => {
    const mockStore = {
        detailPanelId: null,
        setDetailPanel: vi.fn(),
        panelProps: {},
        sidebarWidth: 300,
        setSidebarWidth: vi.fn(),
        detailsPanelWidth: 400,
        setDetailsPanelWidth: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useShellStore).mockReturnValue(mockStore as any);
        vi.mocked(RegistryLoader.getZoneComponents).mockImplementation(async (zone: string) => {
            if (zone === 'nav-main') return [{ name: 'nav-item', order: 1, component: () => <MockComponent name="nav" /> }];
            if (zone === 'header-end') return [
                { name: 'header-item-1', order: 1, component: () => <MockComponent name="header-1" /> },
            ];
            if (zone === 'details-panel') return [{ name: 'details-item', order: 1, component: (props: any) => <div data-testid="active-details">{props.title}</div> }];
            return [];
        });
    });

    it('should cleanup event listeners on unmount while resizing', async () => {
        const { unmount } = render(<AppShellDesktop>Content</AppShellDesktop>);
        const handle = screen.getByTitle('Drag to resize sidebar');

        await act(async () => {
            fireEvent.mouseDown(handle);
        });

        const removeSpy = vi.spyOn(document, 'removeEventListener');
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });

    it('should handle logo click to home', async () => {
        const originalLocation = window.location;
        const mockLocation = { ...originalLocation, href: '' };
        // @ts-ignore
        delete (window as any).location;
        (window as any).location = mockLocation;

        render(<AppShellDesktop>Content</AppShellDesktop>);
        const logoHeader = screen.getByTitle('Home');
        fireEvent.click(logoHeader);
        expect((window as any).location.href).toBe('/');

        (window as any).location = originalLocation;
    });

    it('should handle details panel resizing', async () => {
        const setDetailsPanelWidth = vi.fn();
        vi.mocked(useShellStore).mockReturnValue({
            ...mockStore,
            detailPanelId: 'details-item',
            setDetailsPanelWidth
        } as any);

        render(<AppShellDesktop>Content</AppShellDesktop>);
        const handle = await screen.findByTitle('Drag to resize detail panel');

        await act(async () => {
            fireEvent.mouseDown(handle);
        });

        await act(async () => {
            fireEvent.mouseMove(document, { clientX: 1000 });
        });
        expect(setDetailsPanelWidth).toHaveBeenCalled();

        await act(async () => {
            fireEvent.mouseUp(document);
        });
    });

    it('should handle sidebar resizing with constraints', async () => {
        const setSidebarWidth = vi.fn();
        vi.mocked(useShellStore).mockReturnValue({
            ...mockStore,
            setSidebarWidth
        } as any);

        render(<AppShellDesktop>Content</AppShellDesktop>);
        const handle = screen.getByTitle('Drag to resize sidebar');

        const originalWidth = window.innerWidth;
        (window as any).innerWidth = 1200;

        await act(async () => {
            fireEvent.mouseDown(handle);
        });

        await act(async () => {
            fireEvent.mouseMove(document, { clientX: 400 });
        });

        expect(setSidebarWidth).toHaveBeenCalled();

        await act(async () => {
            fireEvent.mouseUp(document);
        });

        (window as any).innerWidth = originalWidth;
    });

    it('should close details panel when close button is clicked', async () => {
        const setDetailPanel = vi.fn();
        vi.mocked(useShellStore).mockReturnValue({
            ...mockStore,
            detailPanelId: 'details-item',
            setDetailPanel
        } as any);

        render(<AppShellDesktop>Content</AppShellDesktop>);

        const closeBtn = await screen.findByTestId('shell-details-close');
        await act(async () => {
            fireEvent.click(closeBtn);
        });
        expect(setDetailPanel).toHaveBeenCalledWith(null);
    });
});
