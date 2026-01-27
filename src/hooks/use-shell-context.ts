import { useState, useEffect } from 'react';
import type { ShellContext } from '@/lib/registries/shell-registry';

/**
 * Hook to provide a reactive ShellContext on the client.
 */
export function useShellContext(initialNavData: any): ShellContext {
    const [context, setContext] = useState<ShellContext>(() => {
        // Initial state (SSR compatible defaults)
        return {
            url: typeof window !== 'undefined' ? new URL(window.location.href) : new URL('http://localhost'),
            navData: initialNavData,
            isMobile: false,
            width: typeof window !== 'undefined' ? window.innerWidth : 0,
            height: typeof window !== 'undefined' ? window.innerHeight : 0,
        };
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateContext = () => {
            setContext(prev => ({
                ...prev,
                url: new URL(window.location.href),
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 1024, // Consistent with ShellRegistry/AppShellDesktop logic
            }));
        };

        // Listen for resize
        window.addEventListener('resize', updateContext);

        // Listen for navigation (popstate)
        window.addEventListener('popstate', updateContext);

        // Initial update
        updateContext();

        return () => {
            window.removeEventListener('resize', updateContext);
            window.removeEventListener('popstate', updateContext);
        };
    }, []);

    return context;
}
