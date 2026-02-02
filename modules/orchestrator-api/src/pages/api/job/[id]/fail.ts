// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { FailJobJobAction } from '@modules/orchestrator-api/src/actions/fail-job-job';
import type { FailJobDTO } from '@modules/orchestrator-api/src/sdk';

// GENERATED CODE - DO NOT MODIFY
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as FailJobDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: FailJobDTO = await HookSystem.filter('job.failJob.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'job-owner', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await FailJobJobAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('job.failJob.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Mark job as failed',
    tags: ['Job'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'object' },
            },
            required: ['error'],
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
