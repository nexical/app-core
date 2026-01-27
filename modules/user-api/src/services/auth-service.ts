import { db } from "@/lib/core/db";
import type { ServiceResponse } from "@/types/service";
import type { CreateUserDTO, User, Invitation } from "../sdk/types";
import { UserMode, SiteRole } from "../sdk/types";
import { HookSystem } from "@/lib/modules/hooks";
import { UserStatus } from "@modules/user-api/src/sdk";
import { userConfig } from "../config";
import { Logger } from "@/lib/core/logger";

export class AuthService {
    public static async register(input: CreateUserDTO): Promise<ServiceResponse<User>> {
        const normalizedEmail = String(input.email).toLowerCase();
        const password = String(input.password);
        const confirmPassword = String(input.confirmPassword);
        const token = input.token ? String(input.token) : undefined;
        const username = input.username ? String(input.username) : undefined;
        const name = input.name ? String(input.name) : undefined;

        // Check Modes
        if (userConfig.userMode === UserMode.SINGLE) {
            return { success: false, error: "user.service.error.registration_restricted" };
        }

        // Validate Password Match
        if (password !== confirmPassword) {
            return { success: false, error: "user.service.error.passwords_mismatch" };
        }

        let role: SiteRole = SiteRole.EMPLOYEE;
        let emailVerified: Date | null = null;
        let invitation: Invitation | null = null;
        let invitationId: string | null = null;

        // Check for Invitation Token
        if (token) {
            invitation = await db.invitation.findUnique({
                where: { token: token }
            });

            if (!invitation) {
                return { success: false, error: "user.service.error.invitation_invalid" };
            }
            if (invitation.expires < new Date()) {
                return { success: false, error: "user.service.error.invitation_expired" };
            }

            if (invitation.email.toLowerCase() !== normalizedEmail) {
                return { success: false, error: "user.service.error.invitation_email_mismatch" };
            }

            role = invitation.role;
            emailVerified = new Date();
            invitationId = invitation.id;
        } else if (userConfig.userMode === UserMode.ADMIN) {
            return { success: false, error: "user.service.error.registration_restricted" };
        }

        // Check if user exists
        const existingUser = await db.user.findFirst({
            where: { OR: [{ email: normalizedEmail }, { username: username }] }
        });
        if (existingUser) {
            return { success: false, error: "user.service.error.user_exists" };
        }

        // Hash Password - DELEGATED TO HOOKS
        const inputData = {
            password: password,
            // ... other fields that might be modified by hooks
        };
        const processedData = await HookSystem.filter('user.beforeCreate', inputData);
        // Note: filtered data comes back with hashed password

        try {
            const createdUser = await db.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        email: normalizedEmail,
                        username: username,
                        // Basic XSS sanitization
                        name: name ? name.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") : name,
                        password: processedData.password,
                        role: role,
                        status: UserStatus.ACTIVE,
                        emailVerified: emailVerified,
                    }
                });

                if (invitationId) {
                    await tx.invitation.delete({ where: { id: invitationId } });
                }

                return newUser;
            });

            // Dispatch created event which will trigger email hooks
            await HookSystem.dispatch('user.created', { id: createdUser.id, actorId: 'system' });

            return {
                success: true,
                data: createdUser as unknown as User
            };
        } catch (error: unknown) {
            Logger.error("Register Error:", error);
            return { success: false, error: "user.service.error.create_account_failed" };
        }
    }
}
