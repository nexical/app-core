// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { ResetPasswordAuthAction } from '@modules/user-api/src/actions/reset-password-auth';
import type { ResetPasswordDTO } from '@modules/user-api/src/sdk';

export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as ResetPasswordDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: ResetPasswordDTO = await HookSystem.filter('auth.resetPassword.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'anonymous', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await ResetPasswordAuthAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('auth.resetPassword.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Reset password',
    tags: ['Auth'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              password: { type: 'string' },
              confirmPassword: { type: 'string' },
            },
            required: ['token', 'password', 'confirmPassword'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
              },
              required: ['userId'],
            },
          },
        },
      },
    },
    protected: false,
  },
);
