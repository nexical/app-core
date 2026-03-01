/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { ShellRegistry } from '../../lib/registries/shell-registry';
import { FooterRegistry } from '../../lib/registries/footer-registry';
import { ThemeProvider } from '../system/ThemeProvider';
import { NavProvider } from '../../lib/ui/nav-context';
import { initializeClientModules } from '../../lib/core/client-init';
import { useShellContext } from '../../hooks/use-shell-context';
import { AppShellDesktop } from './app-shell-desktop';

// Trigger async init for any async work in module init() exports.
// Module-level registrations (ShellRegistry etc.) have already run
// synchronously via the eager glob in client-init.ts.
initializeClientModules();

interface MasterShellProps {
  shellName?: string;
  footerName?: string;
  navData: Record<string, unknown>;
  children: React.ReactNode;
}

export function MasterShell({
  shellName: initialShellName,
  footerName: initialFooterName,
  navData,
  children,
}: MasterShellProps) {
  const [mounted, setMounted] = useState(false);
  const context = useShellContext(navData);

  useEffect(() => {
    setMounted(true);
    // Hide the global loading spinner only after the shell has been resolved
    // and React has mounted. This prevents flicker between wrong shells.
    if (
      typeof window !== 'undefined' &&
      typeof (window as Window & { __hideLoader?: () => void }).__hideLoader === 'function'
    ) {
      (window as Window & { __hideLoader?: () => void }).__hideLoader!();
    }
  }, []);

  // Resolve shell by context on client, or initialShellName on server/initial mount.
  // Because module inits run eagerly, ShellRegistry.get(initialShellName) is immediately
  // available on the client without waiting for any async operation.
  const activeShellComponent = useMemo(() => {
    if (!mounted) {
      return (initialShellName ? ShellRegistry.get(initialShellName) : null) || AppShellDesktop;
    }
    const entry = ShellRegistry.findEntry(context);
    return entry?.component || AppShellDesktop;
  }, [mounted, context, initialShellName]);

  const activeFooterComponent = useMemo(() => {
    if (!mounted) {
      return initialFooterName ? FooterRegistry.get(initialFooterName) : null;
    }
    const entry = FooterRegistry.findEntry(context);
    return entry?.component;
  }, [mounted, context, initialFooterName]);

  return (
    <ThemeProvider storageKey="app-theme">
      <NavProvider value={navData}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">
            {React.createElement(activeShellComponent || AppShellDesktop, { navData, children })}
          </div>
          {activeFooterComponent && (
            <footer className="w-full">
              {React.createElement(activeFooterComponent, { navData })}
            </footer>
          )}
        </div>
      </NavProvider>
    </ThemeProvider>
  );
}
