import type { ServiceResponse } from '@/types/service';
import type { RequestPasswordResetDTO } from '../sdk/types';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import type { APIContext } from 'astro';

export class RequestPasswordResetAuthAction {
  public static async run(
    input: RequestPasswordResetDTO,
    context: APIContext,
  ): Promise<ServiceResponse<void>> {
    const normalizedEmail = String(input.email).toLowerCase();

    try {
      const user = await db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await db.passwordResetToken.create({
          data: { email: normalizedEmail, token, expires },
        });

        // Dispatch event for email sending
        await HookSystem.dispatch('auth.password_reset_requested', {
          email: normalizedEmail,
          token,
        });
      }
      // Always return success to prevent Email Enumeration
      return { success: true, data: {} };
    } catch (error) {
      console.error('Request Password Reset Error:', error);
      // Still return success for security
      return { success: true, data: {} };
    }
  }
}
