/* eslint-disable */
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppShellMobile } from '../../../../src/components/shell/app-shell-mobile';
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

vi.mock('../../../../src/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="mock-sheet" data-open={open}>
      {children}
      <button onClick={() => onOpenChange(!open)}>Toggle</button>
    </div>
  ),
  SheetContent: ({ children, side }: any) => (
    <div data-testid={`sheet-content-${side}`}>{children}</div>
  ),
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

vi.mock('../../../../src/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
}));

vi.mock('../../../../src/lib/core/config', () => ({
  config: {
    PUBLIC_SITE_NAME: 'Test Site',
  },
}));

describe('AppShellMobile', () => {
  const mockSetDetailPanel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useShellStore).mockReturnValue({
      detailPanelId: null,
      setDetailPanel: mockSetDetailPanel,
      panelProps: {},
    } as any);
    vi.mocked(getZoneComponents).mockResolvedValue([]);
  });

  it('should render basic structure', async () => {
    await act(async () => {
      render(<AppShellMobile>Content</AppShellMobile>);
    });

    expect(screen.getByText('Content')).toBeDefined();
  });

  it('should open and close nav menu', async () => {
    await act(async () => {
      render(<AppShellMobile>Content</AppShellMobile>);
    });

    // AppShellMobile renders two sheets (nav and details). Nav is the first one.
    const sheets = screen.getAllByTestId('mock-sheet');
    const navSheet = sheets[0];

    expect(navSheet.getAttribute('data-open')).toBe('false');

    // Toggle via mocked button in Sheet (need to find the one inside navSheet)
    // Since mock implementation renders button inside, we can find by text within navSheet container
    // But getAllByTestId returns elements.

    // Simpler: Find the trigger button which opens it.
    // The mock sheet has a "Toggle" button rendered inside it for testing open state?
    // My mock: <button onClick={() => onOpenChange(!open)}>Toggle</button>
    // But the real trigger is outside?
    // AppShellMobile passes `open` state to Sheet.

    // Let's use specific selector context
    const toggleBtn = navSheet.querySelector('button');
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      // Re-query or check state update (mockSetSidebar... wait, Mobile uses internal state?)
      // AppShellMobile uses `open` state for nav.
      // Test verification needs to observe state change or effect.

      // Wait, the mock updates `onOpenChange`.
      // If AppShellMobile passes `setOpen` to `onOpenChange`, `open` prop should update on re-render.
      // But re-render happens async?

      // The assertion `expect(sheet...` might need `waitFor`.
    }

    // Actually, the previous error was "Found multiple elements".
    // Resolving ambiguity is enough.

    const toggles = screen.getAllByText('Toggle');
    fireEvent.click(toggles[0]); // Toggle first sheet (nav)

    expect(navSheet.getAttribute('data-open')).toBe('true');
  });

  it('should render registry components in nav and footer', async () => {
    const MockNav = () => <div data-testid="mock-nav">Nav</div>;
    const MockFooter = () => <div data-testid="mock-footer">Footer</div>;

    vi.mocked(getZoneComponents).mockImplementation(async (zone) => {
      if (zone === 'nav-main') return [{ name: 'nav', component: MockNav, order: 1 }];
      if (zone === 'mobile-bottom') return [{ name: 'footer', component: MockFooter, order: 1 }];
      return [];
    });

    await act(async () => {
      render(<AppShellMobile>Content</AppShellMobile>);
    });

    expect(screen.getByTestId('mock-nav')).toBeDefined();
    expect(screen.getByTestId('mock-footer')).toBeDefined();
    expect(screen.getByText('Test Site')).toBeDefined();
  });

  it('should render details panel when detailPanelId is set', async () => {
    vi.mocked(useShellStore).mockReturnValue({
      detailPanelId: 'test-panel',
      setDetailPanel: mockSetDetailPanel,
      panelProps: { data: 123 },
    } as any);

    const MockPanel = ({ data }: any) => <div data-testid="mock-panel">{data}</div>;
    vi.mocked(getZoneComponents).mockImplementation(async (zone) => {
      if (zone === 'details-panel') return [{ name: 'test-panel', component: MockPanel, order: 1 }];
      return [];
    });

    await act(async () => {
      render(<AppShellMobile>Content</AppShellMobile>);
    });

    expect(screen.getByTestId('mock-panel')).toBeDefined();
    expect(screen.getByText('123')).toBeDefined();
  });
});
