// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { parseQuery } from '@/lib/api/api-query';
import { z } from 'zod';
import { UserService } from '@modules/user-api/src/services/user-service';
import { HookSystem } from '@/lib/modules/hooks';
import { SiteRole, UserStatus } from '@modules/user-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const filterOptions = {
      fields: {
        id: 'string',
        username: 'string',
        email: 'string',
        passwordUpdatedAt: 'date',
        emailVerified: 'date',
        name: 'string',
        image: 'string',
        role: 'enum',
        status: 'enum',
        createdAt: 'date',
        updatedAt: 'date',
      },
      searchFields: ['id', 'username', 'email', 'name', 'image'],
    } as const;

    const { where, take, skip, orderBy } = parseQuery(
      new URL(context.request.url).searchParams,
      filterOptions,
    );

    // Security Check
    // Pass query params as input to role check
    await ApiGuard.protect(context, 'admin', { ...context.params, where, take, skip, orderBy });

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
    const result = await UserService.list({ where, take, skip, orderBy, select }, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    const data = result.data || [];
    const total = result.total || 0;

    // Analytics Hook
    await HookSystem.dispatch('user.list.viewed', {
      count: data.length,
      actorId: actor?.id || 'anonymous',
    });

    return { success: true, data, meta: { total } };
  },
  {
    summary: 'List Users',
    tags: ['User'],
    parameters: [
      { name: 'take', in: 'query', schema: { type: 'integer' } },
      { name: 'skip', in: 'query', schema: { type: 'integer' } },
      { name: 'search', in: 'query', schema: { type: 'string' } },
      {
        name: 'orderBy',
        in: 'query',
        schema: { type: 'string' },
        description: 'Ordering (format: field:asc or field:desc)',
      },
      {
        name: 'id.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (eq)',
      },
      {
        name: 'id.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (ne)',
      },
      {
        name: 'id.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (contains)',
      },
      {
        name: 'id.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (startsWith)',
      },
      {
        name: 'id.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (endsWith)',
      },
      {
        name: 'id.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (in)',
      },
      {
        name: 'id',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by id (eq)',
      },
      {
        name: 'username.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (eq)',
      },
      {
        name: 'username.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (ne)',
      },
      {
        name: 'username.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (contains)',
      },
      {
        name: 'username.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (startsWith)',
      },
      {
        name: 'username.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (endsWith)',
      },
      {
        name: 'username.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (in)',
      },
      {
        name: 'username',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by username (eq)',
      },
      {
        name: 'email.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (eq)',
      },
      {
        name: 'email.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (ne)',
      },
      {
        name: 'email.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (contains)',
      },
      {
        name: 'email.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (startsWith)',
      },
      {
        name: 'email.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (endsWith)',
      },
      {
        name: 'email.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (in)',
      },
      {
        name: 'email',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by email (eq)',
      },
      {
        name: 'passwordUpdatedAt.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (eq)',
      },
      {
        name: 'passwordUpdatedAt.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (ne)',
      },
      {
        name: 'passwordUpdatedAt.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (gt)',
      },
      {
        name: 'passwordUpdatedAt.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (gte)',
      },
      {
        name: 'passwordUpdatedAt.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (lt)',
      },
      {
        name: 'passwordUpdatedAt.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (lte)',
      },
      {
        name: 'passwordUpdatedAt.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (in)',
      },
      {
        name: 'passwordUpdatedAt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by passwordUpdatedAt (eq)',
      },
      {
        name: 'emailVerified.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (eq)',
      },
      {
        name: 'emailVerified.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (ne)',
      },
      {
        name: 'emailVerified.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (gt)',
      },
      {
        name: 'emailVerified.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (gte)',
      },
      {
        name: 'emailVerified.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (lt)',
      },
      {
        name: 'emailVerified.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (lte)',
      },
      {
        name: 'emailVerified.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (in)',
      },
      {
        name: 'emailVerified',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by emailVerified (eq)',
      },
      {
        name: 'name.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (eq)',
      },
      {
        name: 'name.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (ne)',
      },
      {
        name: 'name.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (contains)',
      },
      {
        name: 'name.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (startsWith)',
      },
      {
        name: 'name.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (endsWith)',
      },
      {
        name: 'name.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (in)',
      },
      {
        name: 'name',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by name (eq)',
      },
      {
        name: 'image.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (eq)',
      },
      {
        name: 'image.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (ne)',
      },
      {
        name: 'image.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (contains)',
      },
      {
        name: 'image.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (startsWith)',
      },
      {
        name: 'image.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (endsWith)',
      },
      {
        name: 'image.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (in)',
      },
      {
        name: 'image',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by image (eq)',
      },
      {
        name: 'role.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by role (eq)',
      },
      {
        name: 'role.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by role (ne)',
      },
      {
        name: 'role.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by role (in)',
      },
      {
        name: 'role',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by role (eq)',
      },
      {
        name: 'status.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by status (eq)',
      },
      {
        name: 'status.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by status (ne)',
      },
      {
        name: 'status.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by status (in)',
      },
      {
        name: 'status',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by status (eq)',
      },
      {
        name: 'createdAt.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (eq)',
      },
      {
        name: 'createdAt.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (ne)',
      },
      {
        name: 'createdAt.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (gt)',
      },
      {
        name: 'createdAt.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (gte)',
      },
      {
        name: 'createdAt.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (lt)',
      },
      {
        name: 'createdAt.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (lte)',
      },
      {
        name: 'createdAt.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (in)',
      },
      {
        name: 'createdAt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by createdAt (eq)',
      },
      {
        name: 'updatedAt.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (eq)',
      },
      {
        name: 'updatedAt.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (ne)',
      },
      {
        name: 'updatedAt.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (gt)',
      },
      {
        name: 'updatedAt.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (gte)',
      },
      {
        name: 'updatedAt.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (lt)',
      },
      {
        name: 'updatedAt.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (lte)',
      },
      {
        name: 'updatedAt.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (in)',
      },
      {
        name: 'updatedAt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by updatedAt (eq)',
      },
    ],
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
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
                meta: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                  },
                },
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
    const body = await context.request.json();

    // Security Check
    await ApiGuard.protect(context, 'admin', { ...context.params, ...body });

    // Zod Validation
    const schema = z.object({
      username: z.string().optional(),
      email: z.string().optional(),
      passwordUpdatedAt: z.string().datetime().optional(),
      emailVerified: z.string().datetime().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
      role: z.nativeEnum(SiteRole).optional(),
      status: z.nativeEnum(UserStatus).optional(),
    });

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

    const result = await UserService.create(validated, select, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 201 });
  },
  {
    summary: 'Create User',
    tags: ['User'],
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
            required: ['updatedAt'],
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
                data: {
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
    },
  },
);
