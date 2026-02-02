// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { z } from 'zod';
import { UserService } from '@modules/user-api/src/services/user-service';
import { SiteRole, UserStatus } from '@modules/user-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'admin', { ...context.params });

    const select = {
      id: true,
      username: true,
      email: true,
      passwordUpdatedAt: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
    const actor = context.locals.actor;

    const result = await UserService.get(id, select, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    if (!result.data) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'User not found' } }),
        { status: 404 },
      );
    }

    return { success: true, data: result.data };
  },
  {
    summary: 'Get User',
    tags: ['User'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
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
    const { id } = context.params;
    const body = await context.request.json();

    // Security Check
    await ApiGuard.protect(context, 'admin', { ...context.params, ...body });

    // Zod Validation
    const schema = z
      .object({
        username: z.string().optional(),
        email: z.string().optional(),
        passwordUpdatedAt: z.string().datetime().optional(),
        emailVerified: z.string().datetime().optional(),
        name: z.string().optional(),
        image: z.string().optional(),
        role: z.nativeEnum(SiteRole).optional(),
        status: z.nativeEnum(UserStatus).optional(),
      })
      .partial();

    const validated = schema.parse(body);
    const select = {
      id: true,
      username: true,
      email: true,
      passwordUpdatedAt: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
    const actor = context.locals.actor;

    const result = await UserService.update(id, validated, select, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 200 });
  },
  {
    summary: 'Update User',
    tags: ['User'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
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
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'admin', { ...context.params });

    const actor = context.locals.actor;
    const result = await UserService.delete(id, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    return { success: true };
  },
  {
    summary: 'Delete User',
    tags: ['User'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
);
