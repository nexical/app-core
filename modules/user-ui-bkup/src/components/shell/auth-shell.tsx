import React from 'react';
import { RegistryLoader } from '@/components/shell/registry-loader';
import { config } from '@/lib/core/config';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page-container" data-testid="auth-shell">
      {/* Theme Toggle (Absolute Top Right) */}
      <div className="auth-mode-toggle-container">
        <RegistryLoader zone="header-end" />
      </div>

      {/* Gradient Orbs */}
      <div className="auth-orb auth-orb-primary dark:bg-purple-900/20" />
      <div className="auth-orb auth-orb-secondary dark:bg-blue-900/20" />

      <div className="auth-form-wrapper">
        <div className="auth-header-container flex flex-row items-center justify-center gap-4">
          <div className="auth-logo-container shrink-0">
            <img src="/logo.png" alt="Logo" width={64} height={64} className="auth-logo-image" />
          </div>
          <h1 className="auth-app-title text-3xl font-bold">{config.PUBLIC_SITE_NAME}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
