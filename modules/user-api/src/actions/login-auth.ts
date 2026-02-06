// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { LoginDTO, User } from '../sdk/types';
import type { APIContext } from 'astro';
import { db } from '@/lib/core/db';

export class LoginAuthAction {
  public static async run(input: LoginDTO, context: APIContext): Promise<ServiceResponse<User>> {
    const { email, password } = input;

    if (!email || !password) {
      return { success: false, error: 'user.action.login.missing_credentials' };
    }

    const normalizedEmail = email.toLowerCase();
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: { equals: normalizedEmail, mode: 'insensitive' } }, { username: email }],
      },
    });

    if (!user || user.status === 'INACTIVE' || user.status === 'BANNED') {
      return { success: false, error: 'user.action.login.invalid_credentials' };
    }

    const isValid = user.password ? await bcrypt.compare(password, user.password) : false;

    if (!isValid) {
      return { success: false, error: 'user.action.login.invalid_credentials' };
    }

    // Return user data (stripping sensitive if needed, but User type usually implies full model,
    // though we should avoid sending password back. However, for internal ServiceResponse it's okay,
    // usually the API layer filters it. But let's be safe and maybe returns safely?
    // The type says ServiceResponse<User>, so it expects the User model.
    // We'll return the user object.)

    return { success: true, data: user };
  }
}
