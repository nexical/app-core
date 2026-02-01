// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { RequestPasswordResetAuthAction } from '@modules/user-api/src/actions/request-password-reset-auth';
import type { RequestPasswordResetDTO } from '@modules/user-api/src/sdk';

export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as RequestPasswordResetDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: RequestPasswordResetDTO = await HookSystem.filter(
      'auth.requestPasswordReset.input',
      body,
    );

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'anonymous', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await RequestPasswordResetAuthAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('auth.requestPasswordReset.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Request password reset',
    tags: ['Auth'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
            },
            required: ['email'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
    },
    protected: false,
  },
);
