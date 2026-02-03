// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { CreateUserDTO, User } from '../sdk/types';
import type { APIContext } from 'astro';

export class RegisterAuthAction {
  public static async run(
    input: CreateUserDTO,
    context: APIContext,
  ): Promise<ServiceResponse<User>> {
    return AuthService.register(input);
  }
}
