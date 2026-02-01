// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { parseQuery } from '@/lib/api/api-query';
import { HookSystem } from '@/lib/modules/hooks';
import { z } from 'zod';
import { AgentService } from '@modules/orchestrator-api/src/services/agent-service';
import { AgentStatus } from '@modules/orchestrator-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    const filterOptions = {
      fields: {
        id: 'string',
        hostname: 'string',
        lastHeartbeat: 'date',
        status: 'enum',
        createdAt: 'date',
      },
      searchFields: ['id', 'hostname'],
    } as const;

    const { where, take, skip, orderBy } = parseQuery(
      new URL(context.request.url).searchParams,
      filterOptions,
    );

    // Security Check
    // Pass query params as input to role check
    await ApiGuard.protect(context, 'member', { ...context.params, where, take, skip, orderBy });

    const select = {
      id: true,
      hostname: true,
      capabilities: true,
      lastHeartbeat: true,
      status: true,
      createdAt: true,
    };

    const actor = context.locals.actor;
    const result = await AgentService.list({ where, take, skip, orderBy, select }, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    const data = result.data || [];
    const total = result.total || 0;

    // Analytics Hook
    await HookSystem.dispatch('agent.list.viewed', {
      count: data.length,
      actorId: actor?.id || 'anonymous',
    });

    return { success: true, data, meta: { total } };
  },
  {
    summary: 'List Agents',
    tags: ['Agent'],
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
        name: 'hostname.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (eq)',
      },
      {
        name: 'hostname.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (ne)',
      },
      {
        name: 'hostname.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (contains)',
      },
      {
        name: 'hostname.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (startsWith)',
      },
      {
        name: 'hostname.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (endsWith)',
      },
      {
        name: 'hostname.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (in)',
      },
      {
        name: 'hostname',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by hostname (eq)',
      },
      {
        name: 'capabilities.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (eq)',
      },
      {
        name: 'capabilities.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (ne)',
      },
      {
        name: 'capabilities.contains',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (contains)',
      },
      {
        name: 'capabilities.startsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (startsWith)',
      },
      {
        name: 'capabilities.endsWith',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (endsWith)',
      },
      {
        name: 'capabilities.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (in)',
      },
      {
        name: 'capabilities',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by capabilities (eq)',
      },
      {
        name: 'lastHeartbeat.eq',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (eq)',
      },
      {
        name: 'lastHeartbeat.ne',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (ne)',
      },
      {
        name: 'lastHeartbeat.gt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (gt)',
      },
      {
        name: 'lastHeartbeat.gte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (gte)',
      },
      {
        name: 'lastHeartbeat.lt',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (lt)',
      },
      {
        name: 'lastHeartbeat.lte',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (lte)',
      },
      {
        name: 'lastHeartbeat.in',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (in)',
      },
      {
        name: 'lastHeartbeat',
        in: 'query',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by lastHeartbeat (eq)',
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
                      hostname: { type: 'string' },
                      capabilities: { type: 'array', items: { type: 'string' } },
                      lastHeartbeat: { type: 'string', format: 'date-time' },
                      status: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                    required: ['hostname', 'capabilities'],
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
    await ApiGuard.protect(context, 'member', { ...context.params, ...body });

    // Zod Validation
    const schema = z.object({
      hostname: z.string(),
      capabilities: z.array(z.string()),
      lastHeartbeat: z.string().datetime().optional(),
      status: z.nativeEnum(AgentStatus).optional(),
    });

    const validated = schema.parse(body);
    const select = {
      id: true,
      hostname: true,
      capabilities: true,
      lastHeartbeat: true,
      status: true,
      createdAt: true,
    };
    const actor = context.locals.actor;

    const result = await AgentService.create(validated, select, actor);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), { status: 201 });
  },
  {
    summary: 'Create Agent',
    tags: ['Agent'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
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
    },
  },
);
