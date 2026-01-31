import type { ServiceResponse } from '@/types/service';
import type { InviteUserDTO, Invitation } from '../sdk/types';
import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import { SiteRole } from '@modules/user-api/src/sdk';

import type { APIContext } from 'astro';

export class InviteUserAuthAction {
  public static async run(
    input: InviteUserDTO,
    context: APIContext,
  ): Promise<ServiceResponse<Invitation>> {
    const email = String(input.email);
    const role = (input.role as SiteRole) || SiteRole.EMPLOYEE;

    const normalizedEmail = email.toLowerCase();
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return { success: false, error: 'user.service.error.user_exists' };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      const invitation = (await db.invitation.upsert({
        where: { email },
        update: { token, role, expires },
        create: { email, token, role, expires },
        // We return the created invitation to match ServiceResponse<Invitation>
        select: {
          id: true,
          email: true,
          role: true,
          token: true,
          expires: true,
          createdAt: true,
        },
      })) as unknown as Invitation;

      // Dispatch event to trigger email
      await HookSystem.dispatch('invitation.created', {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        role: invitation.role,
      });

      return { success: true, data: invitation };
    } catch (error: unknown) {
      console.error('Invite Error:', error);
      return { success: false, error: 'user.service.error.invite_failed' };
    }
  }
}
