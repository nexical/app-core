// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import type { CompleteJobDTO } from '@modules/orchestrator-api/src/sdk';
import { CompleteJobAction } from '@modules/orchestrator-api/src/actions/complete-job';

// GENERATED CODE - DO NOT MODIFY
export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as CompleteJobDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: CompleteJobDTO = await HookSystem.filter('job.completeJob.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'job-owner', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await CompleteJobAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('job.completeJob.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Mark job as completed',
    tags: ['Job'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              result: { type: 'object' },
            },
            required: ['id'],
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
