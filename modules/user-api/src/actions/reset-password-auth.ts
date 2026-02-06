// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { ResetPasswordDTO, ResetPasswordResponseDTO } from '../sdk/types';
import type { APIContext } from 'astro';
import { db } from '@/lib/core/db';

export class ResetPasswordAuthAction {
  public static async run(
    input: ResetPasswordDTO,
    context: APIContext,
  ): Promise<ServiceResponse<ResetPasswordResponseDTO>> {
    const token = String(input.token);
    const newPassword = String(input.password);

    try {
      const resetToken = await db.passwordResetToken.findUnique({
        where: { token },
      });
      if (!resetToken || new Date() > resetToken.expires) {
        return { success: false, error: 'user.service.error.invalid_token' };
      }

      const user = await db.user.findUnique({
        where: { email: resetToken.email },
      });
      if (!user) return { success: false, error: 'user.service.error.user_not_found' };

      // Delegate hashing to hooks
      const inputData = { password: newPassword };
      const processedData = await HookSystem.filter('user.beforeUpdate', inputData);
      // processedData.password is now hashed

      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: {
            password: processedData.password,
            passwordUpdatedAt: new Date(),
          },
        }),
        db.passwordResetToken.delete({ where: { id: resetToken.id } }),
      ]);

      await HookSystem.dispatch('auth.password_reset_completed', {
        userId: user.id,
      });

      return { success: true, data: { userId: user.id } };
    } catch (error: unknown) {
      console.error('Reset Password Service Error:', error);
      return {
        success: false,
        error: 'user.service.error.reset_password_failed',
      };
    }
  }
}
