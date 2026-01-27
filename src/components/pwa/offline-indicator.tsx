import React, { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => {
            setIsOffline(true);
            setDismissed(false);
        };

        // Check initial state
        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline || dismissed) return null;

    return (
        <div
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-lg px-4 py-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2"
            data-testid="offline-indicator"
        >
            <div className="flex items-center gap-3">
                <WifiOff className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                    You're offline. Some features may be limited.
                </span>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-yellow-500/20 rounded shrink-0"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
