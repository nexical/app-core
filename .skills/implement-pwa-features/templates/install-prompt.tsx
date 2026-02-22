'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * Local interface extension for experimental PWA events.
 * Rule: NO 'any' is permitted.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * InstallPrompt component for PWA installation.
 * Pattern: Named PascalCase export for internal components.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pattern: SSR-Safe Browser Access check.
    if (typeof window === 'undefined') return;

    // Pattern: Session-Based Dismissal Logic.
    const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed === 'true') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.info('User accepted the PWA install prompt');
    } else {
      console.info('User dismissed the PWA install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Pattern: Session-Based Dismissal Logic.
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      // Pattern: Overlay Animation Styling.
      // Pattern: E2E Test Selectors.
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4',
        'bg-card text-card-foreground border rounded-lg shadow-lg',
        'animate-in slide-in-from-bottom-4',
      )}
      data-testid="install-prompt"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">Install App</h3>
          <p className="text-sm text-muted-foreground">
            Add this app to your home screen for a better experience.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDismiss}
          data-testid="install-prompt-dismiss"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="mt-4 flex gap-2">
        <Button className="w-full" onClick={handleInstall} data-testid="install-prompt-confirm">
          Install
        </Button>
      </div>
    </div>
  );
}
