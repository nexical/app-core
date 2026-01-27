
import React, { useEffect, useState, useMemo } from 'react';
import { ShellRegistry } from '@/lib/registries/shell-registry';
import { FooterRegistry } from '@/lib/registries/footer-registry';
import { ThemeProvider } from '@/components/system/ThemeProvider';
import { NavProvider } from '@/lib/ui/nav-context';
import { initializeClientModules } from '@/lib/core/client-init';
import { useShellContext } from '@/hooks/use-shell-context';
import { AppShellDesktop } from './app-shell-desktop';

// Ensure modules are initialized when this component is loaded on the client
initializeClientModules();

interface MasterShellProps {
    shellName?: string;
    footerName?: string;
    navData: any;
    children: React.ReactNode;
}

export function MasterShell({ shellName: initialShellName, footerName: initialFooterName, navData, children }: MasterShellProps) {
    const [mounted, setMounted] = useState(false);
    const context = useShellContext(navData);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Resolve shell by context on client, or initialShellName on server/initial mount
    const activeShellComponent = useMemo(() => {
        if (!mounted) {
            // During SSR and initial hydration, use the shell the server selected
            const initialShell = initialShellName ? ShellRegistry.get(initialShellName) : null;
            return initialShell || AppShellDesktop;
        }

        // On the client after mount, re-evaluate based on reactive context
        const entry = ShellRegistry.findEntry(context);
        return entry?.component || AppShellDesktop;
    }, [mounted, context, initialShellName]);

    // Resolve footer by context
    // We can assume on server start we might not have a selected footer passed in props yet (unless we expand MasterShell props)
    // For now, let's resolve it reactively or similar to shell.
    // If we want SSR footer, we should ideally pass it as a prop too, but for now client-side resolution is acceptable as per "just like shell" request.
    const activeFooterComponent = useMemo(() => {
        if (!mounted) {
            const initialFooter = initialFooterName ? FooterRegistry.get(initialFooterName) : null;
            return initialFooter;
        }
        const entry = FooterRegistry.findEntry(context);
        return entry?.component;
    }, [mounted, context, initialFooterName]);


    const ShellComponent = activeShellComponent;
    const FooterComponent = activeFooterComponent;

    return (
        <ThemeProvider storageKey="app-theme">
            <NavProvider value={navData}>
                <div className="flex flex-col min-h-screen">
                    <div className="flex-1 flex flex-col">
                        <ShellComponent navData={navData}>
                            {children}
                        </ShellComponent>
                    </div>
                    {FooterComponent && (
                        <footer className="w-full">
                            <FooterComponent navData={navData} />
                        </footer>
                    )}
                </div>
            </NavProvider>
        </ThemeProvider>
    );
}
