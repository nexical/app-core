// GENERATED CODE - DO NOT MODIFY
// Manual Route - Update Job Progress
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { UpdateProgressJobAction } from '@modules/orchestrator-api/src/actions/update-progress-job';
import { HookSystem } from '@/lib/modules/hooks';
import type { UpdateProgressDTO } from '@modules/orchestrator-api/src/sdk';

export const POST = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = (await context.request.json()) as UpdateProgressDTO;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: UpdateProgressDTO = await HookSystem.filter('job.updateProgress.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'job-owner', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await UpdateProgressJobAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('job.updateProgress.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Update job progress',
    tags: ['Job'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              progress: { type: 'number' },
            },
            required: ['id', 'progress'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
    },
  },
);
