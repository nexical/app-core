import type { RolePolicy } from "@/lib/registries/role-registry";
import { type APIContext, type AstroGlobal } from "astro";

export class IsMyself implements RolePolicy {
    async check(context: AstroGlobal | APIContext, input: Record<string, any>, data?: any): Promise<void> {
        const currentUser = context.locals?.actor || (context as any).user;

        if (!currentUser) {
            throw new Error("Unauthorized: Login required");
        }

        // 1. Check existing data (Post-fetch check)
        if (data) {
            // If checking a user record, id matches
            if (data.id === currentUser.id) return;
            // If checking a resource (Session, etc), userId matches
            if (data.userId === currentUser.id) return;
        }

        // 2. Check input params (Pre-fetch check or filtered input)
        if (input) {
            if (input.id === currentUser.id) return;
            if (input.userId === currentUser.id) return;
        }

        // Special case: /user/me alias often used
        // But for strict "myself", if we can't verify ownership, we fail.

        throw new Error("Forbidden: You can only access your own resources");
    }
}
