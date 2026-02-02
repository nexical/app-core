// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { z } from 'zod';
import { JobLogService } from '@modules/orchestrator-api/src/services/job-log-service';
export const GET = defineApi(
  async (context) => {
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'job-owner', { ...context.params });

    const select = {
      id: true,
      jobId: true,
      level: true,
      message: true,
      timestamp: true,
      job: true,
    };
    const actor = context.locals.actor;

    const result = await JobLogService.get(id, select, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    if (!result.data) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'JobLog not found' } }),
        { status: 404 },
      );
    }

    return { success: true, data: result.data };
  },
  {
    summary: 'Get JobLog',
    tags: ['JobLog'],
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
);
export const PUT = defineApi(
  async (context) => {
    const { id } = context.params;
    const body = await context.request.json();

    // Security Check
    await ApiGuard.protect(context, 'job-owner', { ...context.params, ...body });

    // Zod Validation
    const schema = z
      .object({
        jobId: z.string(),
        level: z.string().optional(),
        message: z.string(),
        timestamp: z.string().datetime().optional(),
      })
      .partial();

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

    const result = await JobLogService.update(id, validated, select, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 200 });
  },
  {
    summary: 'Update JobLog',
    tags: ['JobLog'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
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
);
export const DELETE = defineApi(
  async (context) => {
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'job-owner', { ...context.params });

    const actor = context.locals.actor;
    const result = await JobLogService.delete(id, actor);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    return { success: true };
  },
  {
    summary: 'Delete JobLog',
    tags: ['JobLog'],
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
