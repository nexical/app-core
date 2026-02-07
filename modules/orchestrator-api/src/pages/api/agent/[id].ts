// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { z } from 'zod';
import { AgentService } from '@modules/orchestrator-api/src/services/agent-service';
import { AgentStatus } from '@modules/orchestrator-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const { id } = context.params;

    // Security Check
    await ApiGuard.protect(context, 'member', { ...context.params });

    const select = {
      id: true,
      name: true,
      hashedKey: true,
      prefix: true,
      hostname: true,
      capabilities: true,
      lastHeartbeat: true,
      status: true,
      createdAt: true,
    };
    const actor = context.locals.actor;

    const result = await AgentService.get(id, select, actor);

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
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Agent not found' } }),
        { status: 404 },
      );
    }

    return { success: true, data: result.data };
  },
  {
    summary: 'Get Agent',
    tags: ['Agent'],
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
                name: { type: 'string' },
                hashedKey: { type: 'string' },
                prefix: { type: 'string' },
                hostname: { type: 'string' },
                capabilities: { type: 'array', items: { type: 'string' } },
                lastHeartbeat: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
              required: ['hostname', 'capabilities'],
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
    await ApiGuard.protect(context, 'member', { ...context.params, ...body });

    // Zod Validation
    const schema = z
      .object({
        name: z.string().optional(),
        hashedKey: z.string().optional(),
        prefix: z.string().optional(),
        hostname: z.string(),
        capabilities: z.array(z.string()),
        lastHeartbeat: z.string().datetime().optional(),
        status: z.nativeEnum(AgentStatus).optional(),
      })
      .partial();

    const validated = schema.parse(body);
    const select = {
      id: true,
      name: true,
      hashedKey: true,
      prefix: true,
      hostname: true,
      capabilities: true,
      lastHeartbeat: true,
      status: true,
      createdAt: true,
    };
    const actor = context.locals.actor;

    const result = await AgentService.update(id, validated, select, actor);

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
    summary: 'Update Agent',
    tags: ['Agent'],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              hashedKey: { type: 'string' },
              prefix: { type: 'string' },
              hostname: { type: 'string' },
              capabilities: { type: 'array', items: { type: 'string' } },
              lastHeartbeat: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
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
                name: { type: 'string' },
                hashedKey: { type: 'string' },
                prefix: { type: 'string' },
                hostname: { type: 'string' },
                capabilities: { type: 'array', items: { type: 'string' } },
                lastHeartbeat: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
              required: ['hostname', 'capabilities'],
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
    await ApiGuard.protect(context, 'member', { ...context.params });

    const actor = context.locals.actor;
    const result = await AgentService.delete(id, actor);

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
    summary: 'Delete Agent',
    tags: ['Agent'],
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
