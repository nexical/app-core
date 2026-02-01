// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { RegisterAgentAction } from '@modules/orchestrator-api/src/actions/register-agent';
import type { RegisterAgentDTO } from '@modules/orchestrator-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as RegisterAgentDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: RegisterAgentDTO = await HookSystem.filter('agent.register.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'public', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await RegisterAgentAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('agent.register.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Register or update an agent',
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
);
