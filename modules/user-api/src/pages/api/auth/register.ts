// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { RegisterAuthAction } from '@modules/user-api/src/actions/register-auth';
import type { CreateUserDTO } from '@modules/user-api/src/sdk';

export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as CreateUserDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: CreateUserDTO = await HookSystem.filter('auth.register.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'anonymous', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await RegisterAuthAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('auth.register.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Register a new user',
    tags: ['Auth'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
              confirmPassword: { type: 'string' },
              name: { type: 'string' },
              username: { type: 'string' },
              token: { type: 'string' },
            },
            required: ['email', 'password', 'confirmPassword'],
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
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                passwordUpdatedAt: { type: 'string', format: 'date-time' },
                emailVerified: { type: 'string', format: 'date-time' },
                name: { type: 'string' },
                image: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['updatedAt'],
            },
          },
        },
      },
    },
    protected: false,
  },
);
