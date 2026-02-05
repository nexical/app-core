// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { z } from 'zod';
import { JobService } from '@modules/orchestrator-api/src/services/job-service';
import { JobStatus } from '@modules/orchestrator-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'job-owner', { ...context.params });

    const select = {
      id: true,
      type: true,
      userId: true,
      actorId: true,
      actorType: true,
      payload: true,
      result: true,
      error: true,
      status: true,
      progress: true,
      lockedBy: true,
      lockedAt: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
      retryCount: true,
      maxRetries: true,
      nextRetryAt: true,
      logs: { take: 10 },
    };
    const actor = context.locals.actor;

    const result = await JobService.get(id, select, actor);

    if (!result.success) {
      if (
        result.error?.code === 'NOT_FOUND' ||
        (typeof result.error === 'string' && result.error.includes('not_found'))
      ) {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    if (!result.data) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Job not found' } }),
        { status: 404 },
      );
    }

    return { success: true, data: result.data };
  },
  {
    summary: 'Get Job',
    tags: ['Job'],
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
                type: { type: 'string' },
                userId: { type: 'string' },
                actorId: { type: 'string' },
                actorType: { type: 'string' },
                payload: { type: 'object' },
                result: { type: 'object' },
                error: { type: 'object' },
                status: { type: 'string' },
                progress: { type: 'number' },
                lockedBy: { type: 'string' },
                lockedAt: { type: 'string', format: 'date-time' },
                startedAt: { type: 'string', format: 'date-time' },
                completedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                retryCount: { type: 'number' },
                maxRetries: { type: 'number' },
                nextRetryAt: { type: 'string', format: 'date-time' },
                logs: { type: 'array', items: { type: 'string' } },
              },
              required: ['type', 'updatedAt', 'logs'],
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
        type: z.string(),
        userId: z.string().optional(),
        actorId: z.string().optional(),
        actorType: z.string().optional(),
        payload: z.unknown().optional(),
        result: z.unknown().optional(),
        error: z.unknown().optional(),
        status: z.nativeEnum(JobStatus).optional(),
        progress: z.number().int().optional(),
        lockedBy: z.string().optional(),
        lockedAt: z.string().datetime().optional(),
        startedAt: z.string().datetime().optional(),
        completedAt: z.string().datetime().optional(),
        retryCount: z.number().int().optional(),
        maxRetries: z.number().int().optional(),
        nextRetryAt: z.string().datetime().optional(),
      })
      .partial();

    const validated = schema.parse(body);
    const select = {
      id: true,
      type: true,
      userId: true,
      actorId: true,
      actorType: true,
      payload: true,
      result: true,
      error: true,
      status: true,
      progress: true,
      lockedBy: true,
      lockedAt: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
      retryCount: true,
      maxRetries: true,
      nextRetryAt: true,
      logs: { take: 10 },
    };
    const actor = context.locals.actor;

    const result = await JobService.update(id, validated, select, actor);

    if (!result.success) {
      if (
        result.error?.code === 'NOT_FOUND' ||
        (typeof result.error === 'string' && result.error.includes('not_found'))
      ) {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 200 });
  },
  {
    summary: 'Update Job',
    tags: ['Job'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              userId: { type: 'string' },
              actorId: { type: 'string' },
              actorType: { type: 'string' },
              payload: { type: 'object' },
              result: { type: 'object' },
              error: { type: 'object' },
              status: { type: 'string' },
              progress: { type: 'number' },
              lockedBy: { type: 'string' },
              lockedAt: { type: 'string', format: 'date-time' },
              startedAt: { type: 'string', format: 'date-time' },
              completedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              retryCount: { type: 'number' },
              maxRetries: { type: 'number' },
              nextRetryAt: { type: 'string', format: 'date-time' },
              logs: { type: 'array', items: { type: 'string' } },
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
                type: { type: 'string' },
                userId: { type: 'string' },
                actorId: { type: 'string' },
                actorType: { type: 'string' },
                payload: { type: 'object' },
                result: { type: 'object' },
                error: { type: 'object' },
                status: { type: 'string' },
                progress: { type: 'number' },
                lockedBy: { type: 'string' },
                lockedAt: { type: 'string', format: 'date-time' },
                startedAt: { type: 'string', format: 'date-time' },
                completedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                retryCount: { type: 'number' },
                maxRetries: { type: 'number' },
                nextRetryAt: { type: 'string', format: 'date-time' },
                logs: { type: 'array', items: { type: 'string' } },
              },
              required: ['type', 'updatedAt', 'logs'],
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
    const result = await JobService.delete(id, actor);

    if (!result.success) {
      if (
        result.error?.code === 'NOT_FOUND' ||
        (typeof result.error === 'string' && result.error.includes('not_found'))
      ) {
        return new Response(JSON.stringify({ error: result.error }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    return { success: true };
  },
  {
    summary: 'Delete Job',
    tags: ['Job'],
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
