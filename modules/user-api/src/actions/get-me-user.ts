// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { User } from '../sdk/types';
import type { APIContext } from 'astro';

export class GetMeUserAction {
  public static async run(_input: void, context: APIContext): Promise<ServiceResponse<User>> {
    const userId = context.locals.actor?.id;

    if (!userId) {
      return { success: false, error: 'user.service.error.missing_user_id' };
    }

    return UserService.get(userId);
  }
}
