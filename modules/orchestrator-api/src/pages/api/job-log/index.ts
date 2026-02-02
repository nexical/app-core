// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { parseQuery } from '@/lib/api/api-query';
import { z } from 'zod';
import { JobLogService } from '@modules/orchestrator-api/src/services/job-log-service';
import { HookSystem } from '@/lib/modules/hooks';

export const GET = defineApi(
  async (context) => {
    const filterOptions = {
      fields: {
        id: 'string',
        jobId: 'string',
        level: 'string',
        message: 'string',
        timestamp: 'date',
      },
      searchFields: ['id', 'jobId', 'level', 'message'],
    } as const;

    const { where, take, skip, orderBy } = parseQuery(
      new URL(context.request.url).searchParams,
      filterOptions,
    );

    // Security Check
    // Pass query params as input to role check
    await ApiGuard.protect(context, 'job-owner', { ...context.params, where, take, skip, orderBy });

    const select = {
      id: true,
      jobId: true,
      level: true,
      message: true,
      timestamp: true,
      job: true,
    };

    const actor = context.locals.actor;
    const result = await JobLogService.list({ where, take, skip, orderBy, select }, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    const data = result.data || [];
    const total = result.total || 0;

    // Analytics Hook
    await HookSystem.dispatch('jobLog.list.viewed', {
      count: data.length,
      actorId: actor?.id || 'anonymous',
    });

    return { success: true, data, meta: { total } };
  },
  {
    summary: 'List JobLogs',
    tags: ['JobLog'],
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
        name: 'jobId.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (eq)',
      },
      {
        name: 'jobId.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (ne)',
      },
      {
        name: 'jobId.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (contains)',
      },
      {
        name: 'jobId.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (startsWith)',
      },
      {
        name: 'jobId.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (endsWith)',
      },
      {
        name: 'jobId.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (in)',
      },
      {
        name: 'jobId',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by jobId (eq)',
      },
      {
        name: 'level.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (eq)',
      },
      {
        name: 'level.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (ne)',
      },
      {
        name: 'level.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (contains)',
      },
      {
        name: 'level.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (startsWith)',
      },
      {
        name: 'level.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (endsWith)',
      },
      {
        name: 'level.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (in)',
      },
      {
        name: 'level',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by level (eq)',
      },
      {
        name: 'message.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (eq)',
      },
      {
        name: 'message.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (ne)',
      },
      {
        name: 'message.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (contains)',
      },
      {
        name: 'message.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (startsWith)',
      },
      {
        name: 'message.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (endsWith)',
      },
      {
        name: 'message.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (in)',
      },
      {
        name: 'message',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by message (eq)',
      },
      {
        name: 'timestamp.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (eq)',
      },
      {
        name: 'timestamp.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (ne)',
      },
      {
        name: 'timestamp.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (gt)',
      },
      {
        name: 'timestamp.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (gte)',
      },
      {
        name: 'timestamp.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (lt)',
      },
      {
        name: 'timestamp.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (lte)',
      },
      {
        name: 'timestamp.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (in)',
      },
      {
        name: 'timestamp',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by timestamp (eq)',
      },
      {
        name: 'job.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by job (eq)',
      },
      {
        name: 'job.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by job (ne)',
      },
      {
        name: 'job.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by job (in)',
      },
      {
        name: 'job',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by job (eq)',
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
                      jobId: { type: 'string' },
                      level: { type: 'string' },
                      message: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      job: { type: 'string' },
                    },
                    required: ['jobId', 'message', 'job'],
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
    await ApiGuard.protect(context, 'job-owner', { ...context.params, ...body });

    // Zod Validation
    const schema = z.object({
      jobId: z.string(),
      level: z.string().optional(),
      message: z.string(),
      timestamp: z.string().datetime().optional(),
    });

    const validated = schema.parse(body);
    const select = {
      id: true,
      jobId: true,
      level: true,
      message: true,
      timestamp: true,
      job: true,
    };
    const actor = context.locals.actor;

    const result = await JobLogService.create(validated, select, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 201 });
  },
  {
    summary: 'Create JobLog',
    tags: ['JobLog'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              jobId: { type: 'string' },
              level: { type: 'string' },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              job: { type: 'string' },
            },
            required: ['jobId', 'message', 'job'],
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
                    jobId: { type: 'string' },
                    level: { type: 'string' },
                    message: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    job: { type: 'string' },
                  },
                  required: ['jobId', 'message', 'job'],
                },
              },
            },
          },
        },
      },
    },
  },
);
