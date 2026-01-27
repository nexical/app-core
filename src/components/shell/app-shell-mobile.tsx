import React, { useEffect, useState } from 'react';
import { getZoneComponents, type RegistryComponent } from '@/lib/ui/registry-loader';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { config } from "@/lib/core/config";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { useShellStore } from '@/lib/ui/shell-store';

export function AppShellMobile({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const [navItems, setNavItems] = useState<RegistryComponent[]>([]);
    const [mobileBottomItems, setMobileBottomItems] = useState<RegistryComponent[]>([]);
    const [detailsPanelItems, setDetailsPanelItems] = useState<RegistryComponent[]>([]);

    // Shell Store for Details Panel State
    const {
        detailPanelId,
        setDetailPanel,
        panelProps
    } = useShellStore();

    // Local state for Nav Sheet
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        getZoneComponents('nav-main').then(setNavItems);
        getZoneComponents('mobile-bottom').then(setMobileBottomItems);
        getZoneComponents('details-panel').then(setDetailsPanelItems);
    }, []);

    // Find active details panel component
    const ActiveDetailsPanel = detailPanelId
        ? detailsPanelItems.find(i => i.name === detailPanelId)?.component
        : null;

    return (
        <div className="shell-mobile-root">
            {/* MOBILE HEADER (Clean, minimalist) */}
            <header className="shell-mobile-header">
                <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="shell-mobile-menu-btn" data-testid="shell-mobile-menu-btn">
                            <Menu className="shell-mobile-menu-icon" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>

                    {/* LEFT NAV SHEET */}
                    <SheetContent side="left" className="sheet-mobile-full p-0 gap-0 border-none">

                        {/* NAV HEADER: Logo + Brand */}
                        <div className="shell-nav-header">
                            <img src="/logo.png" alt="Logo" className="w8 h-8 object-contain" />
                            <span className="font-bold text-lg leading-none">{config.PUBLIC_SITE_NAME}</span>

                            {/* Standard Close is built-in to SheetContent. */}
                        </div>

                        {/* NAV SCROLL AREA */}
                        <ScrollArea className="shell-mobile-nav-scroll">
                            <nav className="shell-sidebar-nav" data-testid="shell-mobile-nav">
                                {navItems.map((item, idx) => {
                                    const Component = item.component;
                                    return <Component key={`${item.name}-${idx}`} />;
                                })}
                            </nav>
                        </ScrollArea>

                        {/* NAV FOOTER: User & Theme (Moved from bottom bar) */}
                        <div className="shell-mobile-nav-footer">
                            {mobileBottomItems.map((item, idx) => {
                                const Component = item.component;
                                return <Component key={`${item.name}-${idx}`} />;
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            {/* CONTENT */}
            <main className="shell-mobile-main">
                {children}
            </main>

            {/* RIGHT DETAILS SHEET (Full Screen) */}
            <Sheet open={!!detailPanelId} onOpenChange={(open) => !open && setDetailPanel(null)}>
                <SheetContent side="right" className="sheet-mobile-full p-0 gap-0 border-none">
                    <div className="shell-details-header">
                        <span className="font-semibold text-lg">{t('Details')}</span>
                    </div>
                    {ActiveDetailsPanel && (
                        <ScrollArea className="shell-details-scroll">
                            <ActiveDetailsPanel {...panelProps} />
                        </ScrollArea>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
