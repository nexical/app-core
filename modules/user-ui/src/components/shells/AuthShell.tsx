import React from 'react';
import { RegistryLoader } from '@/components/shell/registry-loader';
// import { config } from '@/lib/core/config'; // Assuming config is available or use placeholder

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="auth-page-container min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20 relative overflow-hidden"
      data-testid="auth-shell"
    >
      {/* Theme Toggle (Absolute Top Right) */}
      <div className="auth-mode-toggle-container absolute top-4 right-4 z-50">
        <RegistryLoader zone="header-end" />
      </div>

      {/* Gradient Orbs - Using simple divs for now if orb classes are missing */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      <div className="auth-form-wrapper w-full max-w-md space-y-8 relative z-10">
        <div className="auth-header-container flex flex-col items-center justify-center gap-4 text-center">
          <div className="auth-logo-container shrink-0">
            {/* Logo placeholder */}
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">
              N
            </div>
          </div>
          <h1 className="auth-app-title text-3xl font-bold tracking-tight">Nexical</h1>
        </div>

        <div className="bg-card text-card-foreground shadow-xl rounded-xl border p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
