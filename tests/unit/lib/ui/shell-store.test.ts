/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { useShellStore } from '../../../../src/lib/ui/shell-store';

describe('useShellStore', () => {
    beforeEach(() => {
        // Reset state manually since Zustand stores are singletons
        useShellStore.setState({
            detailPanelId: null,
            panelProps: {},
            sidebarWidth: 300,
            detailsPanelWidth: 400
        });
    });

    it('should initialize with default values', () => {
        const state = useShellStore.getState();
        expect(state.detailPanelId).toBeNull();
        expect(state.sidebarWidth).toBe(300);
    });

    it('should update detail panel state', () => {
        useShellStore.getState().setDetailPanel('test-panel', { foo: 'bar' });
        const state = useShellStore.getState();
        expect(state.detailPanelId).toBe('test-panel');
        expect(state.panelProps).toEqual({ foo: 'bar' });
    });

    it('should update widths', () => {
        useShellStore.getState().setSidebarWidth(500);
        useShellStore.getState().setDetailsPanelWidth(600);

        const state = useShellStore.getState();
        expect(state.sidebarWidth).toBe(500);
        expect(state.detailsPanelWidth).toBe(600);
    });
});
