
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiDocsShell } from '../../../../src/components/shell/api-docs-shell';
import { getZoneComponents } from '../../../../src/lib/ui/registry-loader';
import { useShellStore } from '../../../../src/lib/ui/shell-store';

// Mock dependencies
vi.mock('../../../../src/lib/ui/registry-loader', () => ({
    getZoneComponents: vi.fn(),
}));

vi.mock('../../../../src/lib/ui/shell-store', () => ({
    useShellStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../../src/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('../../../../src/lib/core/config', () => ({
    config: {
        PUBLIC_SITE_NAME: 'Test Site',
    },
}));

describe('ApiDocsShell', () => {
    const mockSetDetailsPanelWidth = vi.fn();
    const mockSetDetailPanel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useShellStore).mockReturnValue({
            detailPanelId: null,
            setDetailPanel: mockSetDetailPanel,
            panelProps: {},
            detailsPanelWidth: 500,
            setDetailsPanelWidth: mockSetDetailsPanelWidth,
        } as any);
        vi.mocked(getZoneComponents).mockResolvedValue([]);
    });

    afterEach(() => {
        cleanup();
    });

    it('should render basic structure', async () => {
        await act(async () => {
            render(<ApiDocsShell>Content</ApiDocsShell>);
        });

        expect(screen.getByText('Test Site API')).toBeDefined();
        expect(screen.getByText('Content')).toBeDefined();
    });

    it('should load zone components on mount', async () => {
        await act(async () => {
            render(<ApiDocsShell>Content</ApiDocsShell>);
        });

        expect(getZoneComponents).toHaveBeenCalledWith('header-end');
        expect(getZoneComponents).toHaveBeenCalledWith('details-panel');
    });

    it('should handle details panel resizing', async () => {
        vi.mocked(useShellStore).mockReturnValue({
            detailPanelId: 'test-panel',
            setDetailPanel: mockSetDetailPanel,
            panelProps: {},
            detailsPanelWidth: 500,
            setDetailsPanelWidth: mockSetDetailsPanelWidth,
        } as any);

        const MockPanel = () => <div data-testid="mock-panel">Panel</div>;
        vi.mocked(getZoneComponents).mockImplementation(async (zone) => {
            if (zone === 'details-panel') return [{ name: 'test-panel', component: MockPanel, order: 1 }];
            return [];
        });

        await act(async () => {
            render(<ApiDocsShell>Content</ApiDocsShell>);
        });

        const handle = screen.getByTitle('Drag to resize detail panel');

        // Start resizing
        fireEvent.mouseDown(handle);

        // Move mouse
        fireEvent.mouseMove(document, { clientX: 424 }); // 1024 - 424 = 600
        expect(mockSetDetailsPanelWidth).toHaveBeenCalled();

        // Stop resizing
        fireEvent.mouseUp(document);
    });

    it('should close details panel', async () => {
        vi.mocked(useShellStore).mockReturnValue({
            detailPanelId: 'test-panel',
            setDetailPanel: mockSetDetailPanel,
            panelProps: {},
            detailsPanelWidth: 500,
            setDetailsPanelWidth: mockSetDetailsPanelWidth,
        } as any);

        const MockPanel = () => <div data-testid="mock-panel">Panel</div>;
        vi.mocked(getZoneComponents).mockImplementation(async (zone) => {
            if (zone === 'details-panel') return [{ name: 'test-panel', component: MockPanel, order: 1 }];
            return [];
        });

        await act(async () => {
            render(<ApiDocsShell>Content</ApiDocsShell>);
        });

        fireEvent.click(screen.getByTestId('shell-details-close'));
        expect(mockSetDetailPanel).toHaveBeenCalledWith(null);
    });
});
