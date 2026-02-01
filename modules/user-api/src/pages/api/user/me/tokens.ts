// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { ListTokensUserAction } from '@modules/user-api/src/actions/list-tokens-user';
import { CreateTokenUserAction } from '@modules/user-api/src/actions/create-token-user';
import type { ListTokensDTO, CreateTokenDTO } from '@modules/user-api/src/sdk';

export const GET = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = {} as ListTokensDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: ListTokensDTO = await HookSystem.filter('user.listTokens.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'member', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await ListTokensUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('user.listTokens.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'List personal access tokens',
    tags: ['User'],

    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  hashedKey: { type: 'string' },
                  prefix: { type: 'string' },
                  lastUsedAt: { type: 'string', format: 'date-time' },
                  expiresAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  userId: { type: 'string' },
                  user: { type: 'string' },
                },
                required: ['name', 'hashedKey', 'prefix', 'userId', 'user'],
              },
            },
          },
        },
      },
    },
  },
);
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as CreateTokenDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: CreateTokenDTO = await HookSystem.filter('user.createToken.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'member', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await CreateTokenUserAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('user.createToken.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Create personal access token',
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              name: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
            },
            required: ['name'],
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
                token: { type: 'string' },
                rawKey: { type: 'string' },
              },
              required: ['token', 'rawKey'],
            },
          },
        },
      },
    },
  },
);
