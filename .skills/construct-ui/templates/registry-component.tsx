'use client';

import React, { useTransition } from 'react';
import { useNavData } from '@/lib/ui/nav-context';
import { useShellStore } from '@/lib/ui/shell-store';
import { api, type ApiError } from '@/lib/api/api';
import { Permission } from '@modules/user-api/src/permissions';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Standard Registry Component Template
 *
 * Rules:
 * - MUST use 'use client' directive.
 * - MUST check permissions before rendering sensitive actions.
 * - MUST use t() for all strings.
 * - MUST use data-testid for all interactive elements.
 * - MUST handle API responses with ServiceResponse pattern.
 */
export default function RegistryComponent() {
  const { t } = useTranslation();
  const { context } = useNavData();
  const { setDetailPanel, closeMobileMenu } = useShellStore();
  const [isPending, startTransition] = useTransition();

  // 1. Permission Check
  // Always verify if the user has the required rights
  const canUpdateProfile = Permission.check('user:profile:write', context.user?.role);

  const handleClick = () => {
    if (!canUpdateProfile) return;

    startTransition(async () => {
      try {
        const result = await api.user.updateProfile({ active: true });

        if (result.success) {
          // Success Path
          setDetailPanel('my-module-detail');
          closeMobileMenu();
        } else {
          // Logic Error Path (e.g., Validation failed)
          console.error('Action failed:', result.error);
          toast.error(t(result.error || 'common.error.unknown'));
        }
      } catch (error) {
        // Network/System Error Path
        const apiError = error as ApiError;
        const message = apiError.body?.error || apiError.message;
        console.error('System error:', message);
        toast.error(t('common.error.network'));
      }
    });
  };

  return (
    <div className="p-2" data-testid="registry-component-wrapper">
      <button
        onClick={handleClick}
        disabled={!canUpdateProfile || isPending}
        className="btn-secondary w-full flex items-center justify-center disabled:opacity-50"
        data-testid="registry-action-btn"
      >
        <span className="text-sm font-medium">
          {isPending ? t('common.loading') : context.user?.name || t('common.guest')}
        </span>
      </button>
    </div>
  );
}
