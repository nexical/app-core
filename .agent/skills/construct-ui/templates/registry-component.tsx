import React from 'react';
import { useNavData } from '@/lib/ui/nav-context';
import { useShellStore } from '@/lib/ui/shell-store';
import { api, type ApiError } from '@/lib/api/api';

/**
 * Standard Registry Component Template
 *
 * Usage:
 * Place this file in `modules/{name}/src/registry/{zone}/`.
 * Name it `{order}-{name}.tsx` (e.g., `20-my-widget.tsx`).
 */
export default function RegistryComponent() {
  // 1. Access Global Context (User, Team, Active Module)
  // Data is injected by middleware -> NavContext
  const { context } = useNavData();

  // 2. Control the Shell
  // Use this to open panels, toggle mobile menu, etc.
  const { setDetailPanel, closeMobileMenu } = useShellStore();

  const handleClick = async () => {
    try {
      // 3. API Interaction
      // Use the generated SDK client
      await api.user.updateProfile({ active: true });

      setDetailPanel('my-module-detail');
      closeMobileMenu();
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Action failed:', apiError.body?.error || apiError.message);
    }
  };

  // 4. Render
  // Use semantic surface classes for styling
  return (
    <div className="p-2" data-testid="registry-component-wrapper">
      <button
        onClick={handleClick}
        className="btn-secondary w-full flex items-center justify-center"
        data-testid="registry-action-btn"
      >
        <span className="text-sm font-medium">{context.user?.name || 'Guest'}</span>
      </button>
    </div>
  );
}
