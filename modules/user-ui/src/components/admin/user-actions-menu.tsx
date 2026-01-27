import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Shield, Trash, UserX, UserCheck, Settings } from "lucide-react";
import { api, type ApiError } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

import { type User, UserStatus } from "@modules/user-api/src/sdk";

interface UserActionsMenuProps {
    user: User;
    currentUser?: User;
    onRefresh: () => void;
}

export function UserActionsMenu({ user, currentUser, onRefresh }: UserActionsMenuProps) {
    const { t } = useTranslation();
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isSelf = currentUser?.id === user.id;

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            if (user.status === UserStatus.ACTIVE) {
                await api.user.update(user.id, { status: UserStatus.INACTIVE });
            } else {
                await api.user.update(user.id, { status: UserStatus.ACTIVE });
            }
            onRefresh();
        } catch (error: unknown) {
            console.error("Status toggle failed", error);
            const errorMessage = (error as ApiError).body?.error || (error as ApiError).message || t("user.admin.user_management.error.unexpected");
            // Assuming we might want to show a toast here in future, for now logic matches existing
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="admin-action-button h-8 w-8 p-0 border-muted-foreground/20 hover:bg-muted" data-testid="admin-actions-trigger">
                        <span className="admin-reader-only">{t("user.admin.user_management.actions.open_menu")}</span>
                        <Settings className="admin-icon-base h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="admin-dropdown-content p-2">
                    <DropdownMenuLabel className="mb-2 px-2">{t("user.admin.user_management.actions.label")}</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(user.id)}
                        className="admin-dropdown-item flex items-center gap-2 w-full cursor-pointer py-2"
                        data-testid="admin-action-copy-id"
                    >
                        {t("user.admin.user_management.actions.copy_id")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowRoleDialog(true)}
                        className="admin-dropdown-item flex items-center gap-2 w-full cursor-pointer py-2"
                        data-testid="admin-action-edit-role"
                        disabled={isSelf}
                    >
                        <Shield className="admin-icon-left h-4 w-4" /> {t("user.admin.user_management.actions.edit_role")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleToggleStatus}
                        disabled={isLoading || isSelf}
                        className="admin-dropdown-item flex items-center gap-2 w-full cursor-pointer py-2"
                        data-testid="admin-action-toggle-status"
                    >
                        {user.status === UserStatus.ACTIVE ? (
                            <>
                                <UserX className="admin-icon-left h-4 w-4" /> {t("user.admin.user_management.actions.deactivate")}
                            </>
                        ) : (
                            <>
                                <UserCheck className="admin-icon-left h-4 w-4" /> {t("user.admin.user_management.actions.reactivate")}
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="admin-dropdown-destructive flex items-center gap-2 w-full cursor-pointer py-2"
                        data-testid="admin-action-delete"
                        disabled={isSelf}
                    >
                        <Trash className="admin-icon-left h-4 w-4" /> {t("user.admin.user_management.actions.delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditRoleDialog
                userId={user.id}
                currentRole={user.role}
                open={showRoleDialog}
                onOpenChange={setShowRoleDialog}
                onSuccess={onRefresh}
            />

            <DeleteUserDialog
                userId={user.id}
                userName={user.name || user.email || t("user.common.unknown")}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onSuccess={onRefresh}
            />
        </>
    );
}
