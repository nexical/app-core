import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShellStore {
  detailPanelId: string | null;
  panelProps: Record<string, unknown>;
  sidebarWidth: number;
  detailsPanelWidth: number;
  setDetailPanel: (id: string | null, props?: Record<string, unknown>) => void;
  setSidebarWidth: (width: number) => void;
  setDetailsPanelWidth: (width: number) => void;
}

export const useShellStore = create<ShellStore>()(
  persist(
    (set) => ({
      detailPanelId: null,
      panelProps: {},
      sidebarWidth: 300, // Default 300px
      detailsPanelWidth: 400, // Default 400px
      setDetailPanel: (id: string | null, props: Record<string, unknown> = {}) =>
        set({ detailPanelId: id, panelProps: props }),
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      setDetailsPanelWidth: (width: number) => set({ detailsPanelWidth: width }),
    }),
    {
      name: 'shell-storage', // unique name
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        detailsPanelWidth: state.detailsPanelWidth,
        detailPanelId: state.detailPanelId,
        panelProps: state.panelProps,
      }), // select fields to persist
    },
  ),
);
