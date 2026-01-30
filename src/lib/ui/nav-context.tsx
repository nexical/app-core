'use client';

import React, { createContext, useContext } from 'react';

export interface NavData {
  context?: Record<string, unknown>;
  workspaces?: unknown[]; // Placeholder for workspaces/scopes
}

const NavContext = createContext<NavData | undefined>(undefined);

export function NavProvider({ children, value }: { children: React.ReactNode; value: NavData }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavData() {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error('useNavData must be used within a NavProvider');
  }
  return context;
}
