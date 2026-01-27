import React, { useEffect, useState } from 'react';
import { getZoneComponents, type RegistryComponent } from '@/lib/ui/registry-loader';
import { useShellStore } from '@/lib/ui/shell-store';
import { config } from "@/lib/core/config";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

export function AppShellDesktop({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const [navItems, setNavItems] = useState<RegistryComponent[]>([]);
    const [headerEndItems, setHeaderEndItems] = useState<RegistryComponent[]>([]);
    const [detailsPanelItems, setDetailsPanelItems] = useState<RegistryComponent[]>([]);

    const {
        detailPanelId,
        setDetailPanel,
        panelProps,
        sidebarWidth,
        setSidebarWidth,
        detailsPanelWidth,
        setDetailsPanelWidth
    } = useShellStore();

    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingDetails, setIsResizingDetails] = useState(false);

    useEffect(() => {
        // Load Registry Zones
        getZoneComponents('nav-main').then(setNavItems);
        getZoneComponents('header-end').then(setHeaderEndItems);
        getZoneComponents('details-panel').then(setDetailsPanelItems);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingSidebar) {
                // Calculate max width for sidebar based on min content width of 400px
                const effectiveDetailsWidth = detailPanelId ? detailsPanelWidth : 0;
                const maxSidebarWidth = window.innerWidth - effectiveDetailsWidth - 400;
                const newWidth = Math.min(Math.max(300, e.clientX), maxSidebarWidth);
                setSidebarWidth(newWidth);
            }
            if (isResizingDetails) {
                // Calculate max width for details based on min content width of 400px
                const maxDetailsWidth = window.innerWidth - sidebarWidth - 400;
                const potentialWidth = window.innerWidth - e.clientX;
                const newWidth = Math.min(Math.max(500, potentialWidth), maxDetailsWidth);
                setDetailsPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
            setIsResizingDetails(false);
            document.body.style.cursor = 'default';
        };

        if (isResizingSidebar || isResizingDetails) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = isResizingSidebar ? 'col-resize' : 'w-resize';
            // Prevent selection during drag
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizingSidebar, isResizingDetails, setSidebarWidth, setDetailsPanelWidth]);

    const startResizingSidebar = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingSidebar(true);
    };

    const startResizingDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingDetails(true);
    };

    // Find active details panel component
    const ActiveDetailsPanel = detailPanelId
        ? detailsPanelItems.find(i => i.name === detailPanelId)?.component
        : null;

    return (
        <div className="shell-root">
            {/* LEFT SIDEBAR */}
            <aside
                className="shell-sidebar relative flex-col shrink-0"
                style={{ width: sidebarWidth }}
                data-testid="shell-sidebar"
            >
                <div className="shell-sidebar-header flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => window.location.href = '/'}
                    title="Home"
                >
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-sm" />
                    <span className="font-bold text-lg tracking-tight truncate">{config.PUBLIC_SITE_NAME}</span>
                </div>

                <ScrollArea className="shell-sidebar-scroll">
                    <nav className="shell-sidebar-nav" data-testid="shell-sidebar-nav">
                        {navItems.map((item, idx) => {
                            const Component = item.component;
                            return <Component key={`${item.name}-${idx}`} />;
                        })}
                    </nav>
                </ScrollArea>

                <div className="shell-sidebar-footer mt-auto border-t">
                    <a href="/api/docs" className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/5">
                            {/* Generic API Icon (Code bracket style) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                        </div>
                        <span>API Documentation</span>
                    </a>
                </div>

                {/* Sidebar Drag Handle */}
                <div
                    className="absolute top-0 right-[-10px] w-5 h-full cursor-col-resize hover:bg-primary/5 transition-colors z-[100] touch-none select-none flex justify-center"
                    onMouseDown={startResizingSidebar}
                    title="Drag to resize sidebar"
                >
                    <div className="h-full w-1 bg-primary/0 hover:bg-primary/50 transition-colors rounded-full" />
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="shell-main">
                {/* HEADER */}
                <header className="shell-header" data-testid="shell-header">
                    <div className="shell-header-start">
                        {/* Header Start Zone (Optional) */}
                        <div id="header-start" />
                    </div>
                    <div className="shell-header-end">
                        {headerEndItems.map((item, idx) => {
                            const Component = item.component;
                            return <Component key={`${item.name}-${idx}`} />;
                        })}
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <ScrollArea className="shell-content-scroll">
                    <div className="shell-content" data-testid="shell-content">
                        {children}
                    </div>
                </ScrollArea>
            </main>

            {/* RIGHT RAIL (DETAILS PANEL) */}
            {detailPanelId && ActiveDetailsPanel && (
                <aside
                    className="shell-details-panel border-l-0 rounded-none rounded-l-xl"
                    style={{ width: detailsPanelWidth }}
                    data-testid="shell-details-panel"
                >
                    {/* Details Resize Handle */}
                    <div
                        className="absolute top-0 left-[-10px] w-5 h-full cursor-w-resize hover:bg-primary/5 transition-colors z-[100] touch-none select-none flex justify-center"
                        onMouseDown={startResizingDetails}
                        title="Drag to resize detail panel"
                    >
                        <div className="h-full w-1 bg-primary/0 hover:bg-primary/50 transition-colors rounded-full" />
                    </div>

                    <div className="shell-details-header pr-4 pl-6">
                        <button
                            onClick={() => setDetailPanel(null)}
                            className="shell-details-close ml-auto"
                            data-testid="shell-details-close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                    <ScrollArea className="shell-details-scroll px-6">
                        <ActiveDetailsPanel {...panelProps} />
                    </ScrollArea>
                </aside>
            )}
        </div>
    );
}
