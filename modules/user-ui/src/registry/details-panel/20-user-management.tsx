"use client"

import React from "react"
import { AdminUserManagement } from "../../components/admin/admin-user-management"
import { useNavData } from "@/lib/ui/nav-context"
import { type User } from "@modules/user-api/src/sdk"

/**
 * Registry component for Admin User Management.
 * Renders in the details panel.
 */
export default function UserManagementRegistry() {
    const { context } = useNavData();
    const currentUser = context?.user as User;

    return (
        <div className="user-management-registry-container pb-10">
            <AdminUserManagement currentUser={currentUser} />
        </div>
    );
}
