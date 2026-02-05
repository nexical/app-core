'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { signOut } from 'auth-astro/client';
import { useTranslation } from 'react-i18next';
import { useShellStore } from '@/lib/ui/shell-store';
import { useNavData } from '@/lib/ui/nav-context';
import { Settings, LogOut, Key, ChevronDown, Users } from 'lucide-react';
import { Permission } from '@modules/user-api/src/permissions';

/**
 * Registry component for the user profile menu in the header.
 * Consumes NavContext and ShellStore.
 */
export default function UserProfile() {
  const { t } = useTranslation();
  const { context } = useNavData();
  const { setDetailPanel } = useShellStore();
  const user = context?.user as { name: string; email: string; role?: string } | undefined;

  if (!user) return null;

  // Use Centralized Permission Check instead of hardcoded roles
  const canAccessAdmin = Permission.check('auth:sudo', user.role || 'ANONYMOUS');

  return (
    <DropdownMenu>
      <div className="flex flex-col items-end text-right min-w-0 mr-4">
        <span className="text-sm font-semibold leading-none whitespace-nowrap">{user.name}</span>
        <span className="text-xs text-muted-foreground leading-none mt-0.5 whitespace-nowrap">
          {user.email}
        </span>
      </div>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="user-menu-trigger h-auto py-1 px-2 rounded-full hover:bg-accent border border-transparent hover:border-border transition-all group gap-2"
          aria-label="Toggle user menu"
          data-testid="user-menu-trigger"
        >
          <ChevronDown className="size-6 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="user-menu-content w-64 p-2" align="end" forceMount>
        {/* Admin Section */}
        {canAccessAdmin && (
          <DropdownMenuItem
            onClick={() => setDetailPanel('user-management')}
            className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1"
            data-testid="user-menu-admin-users"
          >
            <Users className="size-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {t('user.registry.user_menu.admin_users')}
              </span>
            </div>
          </DropdownMenuItem>
        )}

        {/* Items are flex-row by default but let's be explicit to avoid "icon above text" if styles vary */}
        <DropdownMenuItem
          onSelect={() => setDetailPanel('user-profile-form')}
          className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1"
          data-testid="user-menu-settings"
        >
          <Settings className="size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{t('user.registry.user_menu.settings')}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setDetailPanel('token-management')}
          className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1"
          data-testid="user-menu-tokens"
        >
          <Key className="size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Token Management</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-3 py-3 px-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
          data-testid="user-menu-logout"
        >
          <LogOut className="size-5 shrink-0" />
          <span className="text-sm font-medium">{t('user.registry.user_menu.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
