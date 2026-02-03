// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { DeleteMeDTO } from '../sdk/types';
import type { APIContext } from 'astro';

export class DeleteMeUserAction {
  public static async run(input: DeleteMeDTO, context: APIContext): Promise<ServiceResponse<void>> {
    if (!input.userId) {
      return { success: false, error: 'user.service.error.unauthorized' };
    }

    return UserService.delete(input.userId);
  }
}
