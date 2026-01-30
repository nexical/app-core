import React, { useEffect, useState } from 'react';
import { getZoneComponents, type RegistryComponent } from '../../lib/ui/registry-loader';
import { useShellStore } from '../../lib/ui/shell-store';
import { config } from '../../lib/core/config';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';

export function ApiDocsShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [headerEndItems, setHeaderEndItems] = useState<RegistryComponent[]>([]);
  const [detailsPanelItems, setDetailsPanelItems] = useState<RegistryComponent[]>([]);

  const { detailPanelId, setDetailPanel, panelProps, detailsPanelWidth, setDetailsPanelWidth } =
    useShellStore();

  const [isResizingDetails, setIsResizingDetails] = useState(false);

  useEffect(() => {
    // Load Registry Zones
    getZoneComponents('header-end').then(setHeaderEndItems);
    getZoneComponents('details-panel').then(setDetailsPanelItems);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingDetails) {
        // Calculate max width for details based on min content width of 400px
        const maxDetailsWidth = window.innerWidth - 400;
        const potentialWidth = window.innerWidth - e.clientX;
        const newWidth = Math.min(Math.max(500, potentialWidth), maxDetailsWidth);
        setDetailsPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingDetails(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingDetails) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'w-resize';
      // Prevent selection during drag
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizingDetails, setDetailsPanelWidth]);

  const startResizingDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingDetails(true);
  };

  // Find active details panel component
  const ActiveDetailsPanel = detailPanelId
    ? detailsPanelItems.find((i) => i.name === detailPanelId)?.component
    : null;

  return (
    <div className="shell-root">
      {/* MAIN CONTENT AREA */}
      <main className="shell-main">
        {/* HEADER */}
        <header className="shell-header" data-testid="shell-header">
          <div className="shell-header-start flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-sm" />
              <span className="font-bold text-lg tracking-tight">
                {config.PUBLIC_SITE_NAME} API
              </span>
            </a>
          </div>
          <div className="shell-header-end">
            {headerEndItems.map((item, idx) => {
              const Component = item.component;
              return <Component key={`${item.name}-${idx}`} />;
            })}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 relative overflow-y-auto w-full min-h-0" data-testid="shell-content">
          {children}
        </div>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
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
