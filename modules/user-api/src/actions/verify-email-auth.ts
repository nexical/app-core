// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { VerifyEmailDTO, VerifyEmailResponseDTO } from '../sdk/types';
import type { APIContext } from 'astro';
import { db } from '@/lib/core/db';

export class VerifyEmailAuthAction {
  public static async run(
    input: VerifyEmailDTO,
    context: APIContext,
  ): Promise<ServiceResponse<VerifyEmailResponseDTO>> {
    const tokenStr = String(input.token);

    try {
      const token = await db.verificationToken.findFirst({
        where: { token: tokenStr },
      });
      if (!token || new Date() > token.expires) {
        return { success: false, error: 'user.service.error.invalid_token' };
      }

      const user = await db.user.findUnique({
        where: { email: token.identifier },
      });
      if (!user) return { success: false, error: 'user.service.error.user_not_found' };

      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        }),
        db.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: token.identifier,
              token: token.token,
            },
          },
        }),
      ]);

      await HookSystem.dispatch('auth.email.verified', {
        userId: user.id,
        email: user.email,
      });

      return { success: true, data: { userId: user.id, email: user.email as string } };
    } catch (error: unknown) {
      console.error('Verify Email Error:', error);
      return {
        success: false,
        error: 'user.service.error.verify_email_failed',
      };
    }
  }
}
