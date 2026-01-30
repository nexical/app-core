import React from 'react';
import { cn } from '@/lib/core/utils';

interface ShellProps {
  children: React.ReactNode;
}

export default function __Name__Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="h-16 border-b border-border flex items-center px-6">
        <span className="font-bold text-lg">__Name__</span>
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
