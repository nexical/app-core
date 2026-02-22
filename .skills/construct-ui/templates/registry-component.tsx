'use client';

import React from 'react';
import { useNavData } from '@/lib/ui/nav-context';
import { useShellStore } from '@/lib/ui/shell-store';
import { api, type ApiError } from '@/lib/api/api';
import { Permission } from '@modules/user-api/src/permissions';
import { useTranslation } from 'react-i18next';

/**
 * Standard Registry Component Template
 *
 * Rules:
 * - MUST use 'use client' directive.
 * - MUST check permissions before rendering sensitive actions.
 * - MUST use t() for all strings.
 * - MUST use data-testid for all interactive elements.
 */
export default function RegistryComponent() {
  const { t } = useTranslation();
  const { context } = useNavData();
  const { setDetailPanel, closeMobileMenu } = useShellStore();

  // 1. Permission Check
  // Always verify if the user has the required rights
  const canUpdateProfile = Permission.check('user:profile:write', context.user?.role);

  const handleClick = async () => {
    if (!canUpdateProfile) return;

    try {
      await api.user.updateProfile({ active: true });
      setDetailPanel('my-module-detail');
      closeMobileMenu();
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Action failed:', apiError.body?.error || apiError.message);
    }
  };

  return (
    <div className="p-2" data-testid="registry-component-wrapper">
      <button
        onClick={handleClick}
        disabled={!canUpdateProfile}
        className="btn-secondary w-full flex items-center justify-center disabled:opacity-50"
        data-testid="registry-action-btn"
      >
        <span className="text-sm font-medium">{context.user?.name || t('common.guest')}</span>
      </button>
    </div>
  );
}
