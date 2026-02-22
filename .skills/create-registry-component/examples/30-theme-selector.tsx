'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/core/utils';

/**
 * Example Registry Component: Theme Selector
 *
 * Location: src/registry/header-end/30-theme-selector.tsx
 */
export default function ThemeSelector() {
  return (
    <div className={cn('flex items-center', 'gap-2', 'px-2')}>
      <Button variant="ghost" size="icon" onClick={() => console.info('Toggle Theme')}>
        <span className="sr-only">Toggle theme</span>
        {/* Icon would go here */}
        🌙
      </Button>
    </div>
  );
}
