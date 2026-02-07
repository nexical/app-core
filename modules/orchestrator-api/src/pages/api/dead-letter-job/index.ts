// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { parseQuery } from '@/lib/api/api-query';
import { HookSystem } from '@/lib/modules/hooks';
import { z } from 'zod';
import { DeadLetterJobService } from '@modules/orchestrator-api/src/services/dead-letter-job-service';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const filterOptions = {
      fields: {
        id: 'string',
        originalJobId: 'string',
        type: 'string',
        failedAt: 'date',
        retryCount: 'number',
        reason: 'string',
        actorId: 'string',
        actorType: 'string',
      },
      searchFields: ['id', 'originalJobId', 'type', 'reason', 'actorId', 'actorType'],
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
      originalJobId: true,
      type: true,
      payload: true,
      error: true,
      failedAt: true,
      retryCount: true,
      reason: true,
      actorId: true,
      actorType: true,
    };

    const actor = context.locals.actor;
    const result = await DeadLetterJobService.list({ where, take, skip, orderBy, select }, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    const data = result.data || [];
    const total = result.total || 0;

    // Analytics Hook
    await HookSystem.dispatch('deadLetterJob.list.viewed', {
      count: data.length,
      actorId: actor?.id || 'anonymous',
    });

    return { success: true, data, meta: { total } };
  },
  {
    summary: 'List DeadLetterJobs',
    tags: ['DeadLetterJob'],
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
        name: 'originalJobId.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (eq)',
      },
      {
        name: 'originalJobId.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (ne)',
      },
      {
        name: 'originalJobId.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (contains)',
      },
      {
        name: 'originalJobId.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (startsWith)',
      },
      {
        name: 'originalJobId.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (endsWith)',
      },
      {
        name: 'originalJobId.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (in)',
      },
      {
        name: 'originalJobId',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by originalJobId (eq)',
      },
      {
        name: 'type.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (eq)',
      },
      {
        name: 'type.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (ne)',
      },
      {
        name: 'type.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (contains)',
      },
      {
        name: 'type.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (startsWith)',
      },
      {
        name: 'type.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (endsWith)',
      },
      {
        name: 'type.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (in)',
      },
      {
        name: 'type',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by type (eq)',
      },
      {
        name: 'payload.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by payload (eq)',
      },
      {
        name: 'payload.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by payload (ne)',
      },
      {
        name: 'payload.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by payload (in)',
      },
      {
        name: 'payload',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by payload (eq)',
      },
      {
        name: 'error.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by error (eq)',
      },
      {
        name: 'error.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by error (ne)',
      },
      {
        name: 'error.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by error (in)',
      },
      {
        name: 'error',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by error (eq)',
      },
      {
        name: 'failedAt.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (eq)',
      },
      {
        name: 'failedAt.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (ne)',
      },
      {
        name: 'failedAt.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (gt)',
      },
      {
        name: 'failedAt.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (gte)',
      },
      {
        name: 'failedAt.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (lt)',
      },
      {
        name: 'failedAt.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (lte)',
      },
      {
        name: 'failedAt.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (in)',
      },
      {
        name: 'failedAt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by failedAt (eq)',
      },
      {
        name: 'retryCount.eq',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (eq)',
      },
      {
        name: 'retryCount.ne',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (ne)',
      },
      {
        name: 'retryCount.gt',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (gt)',
      },
      {
        name: 'retryCount.gte',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (gte)',
      },
      {
        name: 'retryCount.lt',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (lt)',
      },
      {
        name: 'retryCount.lte',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (lte)',
      },
      {
        name: 'retryCount.in',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (in)',
      },
      {
        name: 'retryCount',
        in: 'query',
        schema: { type: 'number' },
        required: false,
        description: 'Filter by retryCount (eq)',
      },
      {
        name: 'reason.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (eq)',
      },
      {
        name: 'reason.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (ne)',
      },
      {
        name: 'reason.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (contains)',
      },
      {
        name: 'reason.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (startsWith)',
      },
      {
        name: 'reason.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (endsWith)',
      },
      {
        name: 'reason.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (in)',
      },
      {
        name: 'reason',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by reason (eq)',
      },
      {
        name: 'actorId.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (eq)',
      },
      {
        name: 'actorId.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (ne)',
      },
      {
        name: 'actorId.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (contains)',
      },
      {
        name: 'actorId.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (startsWith)',
      },
      {
        name: 'actorId.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (endsWith)',
      },
      {
        name: 'actorId.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (in)',
      },
      {
        name: 'actorId',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorId (eq)',
      },
      {
        name: 'actorType.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (eq)',
      },
      {
        name: 'actorType.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (ne)',
      },
      {
        name: 'actorType.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (contains)',
      },
      {
        name: 'actorType.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (startsWith)',
      },
      {
        name: 'actorType.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (endsWith)',
      },
      {
        name: 'actorType.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (in)',
      },
      {
        name: 'actorType',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by actorType (eq)',
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
                      originalJobId: { type: 'string' },
                      type: { type: 'string' },
                      payload: { type: 'object' },
                      error: { type: 'object' },
                      failedAt: { type: 'string', format: 'date-time' },
                      retryCount: { type: 'number' },
                      reason: { type: 'string' },
                      actorId: { type: 'string' },
                      actorType: { type: 'string' },
                    },
                    required: ['originalJobId', 'type', 'retryCount'],
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
      originalJobId: z.string(),
      type: z.string(),
      payload: z.unknown().optional(),
      error: z.unknown().optional(),
      failedAt: z.string().datetime().optional(),
      retryCount: z.number().int(),
      reason: z.string().optional(),
      actorId: z.string().optional(),
      actorType: z.string().optional(),
    });

    const validated = schema.parse(body);
    const select = {
      id: true,
      originalJobId: true,
      type: true,
      payload: true,
      error: true,
      failedAt: true,
      retryCount: true,
      reason: true,
      actorId: true,
      actorType: true,
    };
    const actor = context.locals.actor;

    const result = await DeadLetterJobService.create(validated, select, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 201 });
  },
  {
    summary: 'Create DeadLetterJob',
    tags: ['DeadLetterJob'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              originalJobId: { type: 'string' },
              type: { type: 'string' },
              payload: { type: 'object' },
              error: { type: 'object' },
              failedAt: { type: 'string', format: 'date-time' },
              retryCount: { type: 'number' },
              reason: { type: 'string' },
              actorId: { type: 'string' },
              actorType: { type: 'string' },
            },
            required: ['originalJobId', 'type', 'retryCount'],
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
                    originalJobId: { type: 'string' },
                    type: { type: 'string' },
                    payload: { type: 'object' },
                    error: { type: 'object' },
                    failedAt: { type: 'string', format: 'date-time' },
                    retryCount: { type: 'number' },
                    reason: { type: 'string' },
                    actorId: { type: 'string' },
                    actorType: { type: 'string' },
                  },
                  required: ['originalJobId', 'type', 'retryCount'],
                },
              },
            },
          },
        },
      },
    },
  },
);
