// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { DeleteTokenDTO } from '../sdk/types';
import type { APIContext } from 'astro';

export class DeleteTokenUserAction {
  public static async run(
    input: DeleteTokenDTO,
    context: APIContext,
  ): Promise<ServiceResponse<void>> {
    const { id, userId } = input;
    if (!userId) return { success: false, error: 'user.service.error.missing_user_id' };

    // Ownership Check via Service
    const exists = await PersonalAccessTokenService.list({
      where: { id, userId },
      take: 1,
    });
    if (!exists.success || !exists.data || exists.data.length === 0) {
      return {
        success: false,
        error: 'user.service.error.token_not_found_or_unauthorized',
      };
    }

    return PersonalAccessTokenService.delete(id);
  }
}
