// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { z } from 'zod';
import { UserService } from '@modules/user-api/src/services/user-service';
import { SiteRole, UserStatus } from '@modules/user-api/src/sdk';
import { HookSystem } from '@/lib/modules/hooks';
// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const { id } = context.params;
    if (!id) return new Response(null, { status: 404 });

    // Pre-check
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
    const result = await UserService.get(id, select);

    if (!result.success || !result.data) {
      return new Response(null, { status: 404 });
    }

    // Post-check (Data ownership)
    await ApiGuard.protect(context, 'admin', { ...context.params }, result.data);

    // Analytics Hook
    const actor = context.locals.actor;
    await HookSystem.dispatch('user.viewed', { id, actorId: actor?.id || 'anonymous' });

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
    if (!id) return new Response(null, { status: 404 });

    const body = await context.request.json();

    // Pre-check
    await ApiGuard.protect(context, 'admin', { ...context.params, ...body });

    // Fetch for Post-check ownership
    const existing = await UserService.get(id);
    if (!existing.success || !existing.data) {
      return new Response(null, { status: 404 });
    }

    // Post-check
    await ApiGuard.protect(context, 'admin', { ...context.params, ...body }, existing.data);

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
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return { success: true, data: result.data };
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
    if (!id) return new Response(null, { status: 404 });

    // Pre-check
    await ApiGuard.protect(context, 'admin', { ...context.params });

    // Fetch for Post-check ownership
    const existing = await UserService.get(id);
    if (!existing.success || !existing.data) {
      return new Response(null, { status: 404 });
    }

    // Post-check
    await ApiGuard.protect(context, 'admin', { ...context.params }, existing.data);

    const result = await UserService.delete(id);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
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
