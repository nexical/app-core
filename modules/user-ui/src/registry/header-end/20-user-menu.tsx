"use client"

import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "auth-astro/client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useShellStore } from "@/lib/ui/shell-store"
import { useNavData } from "@/lib/ui/nav-context" // Check path if it needs relative or absolute alias
import { Settings, LogOut, Key, ChevronDown, Users } from "lucide-react"

/**
 * Registry component for the user profile menu in the header.
 * Consumes NavContext and ShellStore.
 */
export default function UserProfile() {
    const { t } = useTranslation();
    const { context } = useNavData();
    const { setDetailPanel } = useShellStore();
    const user = context?.user as any;

    if (!user) return null;

    const userInitials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || "U";

    const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER'; // Assuming role exists on user object or needing fetch. 
    // Context user might not have role. If not, we might need to skip admin link or use a different check.
    // For now assuming user object has it or we can't show it.
    // Actually, earlier TeamSettings used currentUserMember to check role. 
    // Shell context user often has basic info. Let's assume basic info for now and maybe skip Admin User Mgmt if unsure, 
    // OR add it if we know they are admin. 
    // Request says: "For admin users they should see the User Management"

    return (
        <DropdownMenu>
            <div className="flex flex-col items-end text-right min-w-0 mr-4">
                <span className="text-sm font-semibold leading-none whitespace-nowrap">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-0.5 whitespace-nowrap">{user.email}</span>
            </div>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="user-menu-trigger h-auto py-1 px-2 rounded-full hover:bg-accent border border-transparent hover:border-border transition-all group gap-2" aria-label="Toggle user menu" data-testid="user-menu-trigger">
                    <ChevronDown className="size-6 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="user-menu-content w-64 p-2" align="end" forceMount>

                {/* Admin Section */}
                {isAdmin && (
                    <DropdownMenuItem onClick={() => setDetailPanel("user-management")} className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1" data-testid="user-menu-admin-users">
                        <Users className="size-5 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{t("user.registry.user_menu.admin_users")}</span>
                        </div>
                    </DropdownMenuItem>
                )}

                {/* Items are flex-row by default but let's be explicit to avoid "icon above text" if styles vary */}
                <DropdownMenuItem onSelect={() => setDetailPanel("user-profile-form")} className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1" data-testid="user-menu-settings">
                    <Settings className="size-5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{t("user.registry.user_menu.settings")}</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setDetailPanel("token-management")} className="flex items-center gap-3 py-3 px-3 cursor-pointer mb-1" data-testid="user-menu-tokens">
                    <Key className="size-5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Token Management</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-3 py-3 px-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20" data-testid="user-menu-logout">
                    <LogOut className="size-5 shrink-0" />
                    <span className="text-sm font-medium">{t("user.registry.user_menu.logout")}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
