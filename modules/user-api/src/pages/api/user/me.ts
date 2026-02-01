// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { GetMeUserAction } from '@modules/user-api/src/actions/get-me-user';
import { UpdateMeUserAction } from '@modules/user-api/src/actions/update-me-user';
import { DeleteMeUserAction } from '@modules/user-api/src/actions/delete-me-user';
import type { UpdateUserDTO, DeleteMeDTO } from '@modules/user-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = {} as none;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: none = await HookSystem.filter('user.getMe.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'member', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await GetMeUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('user.getMe.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Get current user profile',
    tags: ['User'],

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
  },
);
export const PUT = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as UpdateUserDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: UpdateUserDTO = await HookSystem.filter('user.updateMe.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'member', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await UpdateMeUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('user.updateMe.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Update current user profile',
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              image: { type: 'string' },
              role: { type: 'string' },
              status: { type: 'string' },
              password: { type: 'string' },
            },
            required: ['id'],
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
  },
);
export const DELETE = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as DeleteMeDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: DeleteMeDTO = await HookSystem.filter('user.deleteMe.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'member', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await DeleteMeUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('user.deleteMe.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Delete current user account',
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
            },
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
  },
);
