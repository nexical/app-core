
import { db } from "@/lib/core/db";
import { createHash } from "node:crypto";
import type { User } from "@prisma/client";

const KEY_PREFIX = 'ne_pat_';

/**
 * Service for User Authentication validation (PATs)
 */
export class UserAuthService {
    /**
     * Validates a Personal Access Token and returns the associated user.
     * Updates lastUsedAt if the key is valid.
     */
    static async validateToken(rawKey: string): Promise<User | null> {
        if (!rawKey.startsWith(KEY_PREFIX)) {
            return null;
        }

        const hashedKey = createHash('sha256').update(rawKey).digest('hex');

        const token = await db.personalAccessToken.findUnique({
            where: { hashedKey },
            include: { user: true }
        });

        if (!token) return null;

        // Check expiration if applicable (Schema has expiresAt)
        if (token.expiresAt && token.expiresAt < new Date()) {
            return null;
        }

        // Fire and forget update of lastUsedAt
        db.personalAccessToken.update({
            where: { id: token.id },
            data: { lastUsedAt: new Date() }
        }).catch(err => {
            console.error('Failed to update PAT lastUsedAt:', err);
        });

        return token.user;
    }
}
