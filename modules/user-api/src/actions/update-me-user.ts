import type { ServiceResponse } from '@/types/service';
import type { UpdateUserDTO, User } from '../sdk/types';
import { UserService } from '../services/user-service';
import type { APIContext } from 'astro';

export class UpdateMeUserAction {
  public static async run(
    input: UpdateUserDTO,
    context: APIContext,
  ): Promise<ServiceResponse<User>> {
    const userId = input.id || context.locals.actor?.id;

    if (!userId) return { success: false, error: 'user.service.error.missing_user_id' };

    return UserService.update(userId, input);
  }
}
