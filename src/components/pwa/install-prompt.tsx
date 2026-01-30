/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-banner-dismissed')) {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner || isInstalled) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[360px] bg-card border rounded-xl p-4 shadow-lg z-50 animate-in slide-in-from-bottom-4"
      data-testid="install-prompt"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">Install ArcNexus</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Add to your home screen for quick access and offline support.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} data-testid="install-btn">
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
