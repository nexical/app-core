/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MasterShell } from '@/components/shell/master-shell';
import { ShellRegistry } from '@/lib/registries/shell-registry';
import { FooterRegistry } from '@/lib/registries/footer-registry';

// Aggressively mock all shell components to prevent loading heavy dependencies
vi.mock('@/components/shell/app-shell-desktop', () => ({
    AppShellDesktop: ({ children }: any) => <div data-testid="desktop-shell">{children}</div>
}));
vi.mock('@/components/shell/app-shell-mobile', () => ({
    AppShellMobile: ({ children }: any) => <div data-testid="mobile-shell">{children}</div>
}));
vi.mock('@/components/shell/api-docs-shell.tsx', () => ({
    ApiDocsShell: ({ children }: any) => <div data-testid="api-docs-shell">{children}</div>
}));

// Mock registries
vi.mock('@/lib/registries/shell-registry', () => ({
    ShellRegistry: {
        get: vi.fn(),
        findEntry: vi.fn(),
        register: vi.fn(),
    },
}));

vi.mock('@/lib/registries/footer-registry', () => ({
    FooterRegistry: {
        get: vi.fn(),
        findEntry: vi.fn(),
        register: vi.fn(),
    },
}));

vi.mock('@/lib/core/client-init', () => ({
    initializeClientModules: vi.fn(),
}));

vi.mock('@/hooks/use-shell-context', () => ({
    useShellContext: vi.fn((data) => data),
}));

const MockShell = ({ children }: { children: React.ReactNode }) => <div data-testid="mock-shell">{children}</div>;
const MockFooter = () => <div data-testid="mock-footer">Footer</div>;

describe('MasterShell', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render children within the selected shell and footer', async () => {
        // Mock for both SSR (get) and Client (findEntry)
        vi.mocked(ShellRegistry.get).mockReturnValue(MockShell);
        vi.mocked(ShellRegistry.findEntry).mockReturnValue({ component: MockShell } as any);
        vi.mocked(FooterRegistry.get).mockReturnValue(MockFooter);
        vi.mocked(FooterRegistry.findEntry).mockReturnValue({ component: MockFooter } as any);

        await act(async () => {
            render(
                <MasterShell shellName="default" footerName="default" navData={{}}>
                    <div data-testid="child">Hello</div>
                </MasterShell>
            );
        });

        expect(screen.getByTestId('mock-shell')).toBeDefined();
        expect(screen.getByTestId('mock-footer')).toBeDefined();
        expect(screen.getByText('Hello')).toBeDefined();
    });

    it('should fallback to AppShellDesktop if shell is not found', async () => {
        vi.mocked(ShellRegistry.get).mockReturnValue(null);
        vi.mocked(ShellRegistry.findEntry).mockReturnValue(undefined);

        await act(async () => {
            render(
                <MasterShell navData={{}}>
                    <div>Content</div>
                </MasterShell>
            );
        });

        expect(screen.getByTestId('desktop-shell')).toBeDefined();
        expect(screen.getByText('Content')).toBeDefined();
    });
});
