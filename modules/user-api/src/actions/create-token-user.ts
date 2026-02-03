// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { CreateTokenDTO, CreateTokenResponseDTO } from '../sdk/types';
import type { APIContext } from 'astro';

export class CreateTokenUserAction {
  public static async run(
    input: CreateTokenDTO,
    context: APIContext,
  ): Promise<ServiceResponse<CreateTokenResponseDTO>> {
    let userId = input.userId;
    // Logic update: session middleware might not set actorType on locals root, but actor object is present.
    const locals = context.locals;
    if (!userId && locals.actor && locals.actor.id) {
      userId = locals.actor.id;
    }

    if (!userId) {
      return { success: false, error: 'user.service.error.missing_user_id' };
    }

    const currentUserId = userId;
    const name = input.name || 'Unnamed Token';

    try {
      const randomHex = randomBytes(32).toString('hex');
      const rawKey = `${TOKEN_PREFIX}${randomHex}`;
      const hashedKey = createHash('sha256').update(rawKey).digest('hex');

      const result = await PersonalAccessTokenService.create({
        user: { connect: { id: currentUserId } },
        name,
        hashedKey,
        prefix: TOKEN_PREFIX,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'user.service.error.create_token_failed',
        };
      }

      // We augment the return type to include rawKey for display once
      // DTO expects { token: PersonalAccessToken, rawKey: string }
      return {
        success: true,
        data: {
          token: result.data,
          rawKey,
        },
      };
    } catch (error) {
      console.error('Create Token Error', error);
      return {
        success: false,
        error: 'user.service.error.create_token_failed',
      };
    }
  }
}
