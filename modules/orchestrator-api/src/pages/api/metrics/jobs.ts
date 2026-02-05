// GENERATED CODE - DO NOT MODIFY
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { HookSystem } from '@/lib/modules/hooks';
import { GetJobMetricsAction } from '@modules/orchestrator-api/src/actions/get-job-metrics';

// GENERATED CODE - DO NOT MODIFY
export const GET = defineApi(
  async (context) => {
    // 1. Body Parsing (Input)
    const body = {} as none;

    const query = Object.fromEntries(new URL(context.request.url).searchParams);

    // 2. Hook: Filter Input
    const input: none = await HookSystem.filter('metrics.getJobMetrics.input', body);

    // 3. Security Check
    const combinedInput = { ...context.params, ...query, ...input };
    await ApiGuard.protect(context, 'agent-admin', combinedInput);

    // Inject userId from context for protected routes
    const user = context.locals.actor;
    if (user && user.id) {
      Object.assign(combinedInput, { userId: user.id });
    }

    // 4. Action Execution
    const result = await GetJobMetricsAction.run(combinedInput, context);

    // 5. Hook: Filter Output
    const filteredResult = await HookSystem.filter('metrics.getJobMetrics.output', result);

    // 6. Response
    if (!filteredResult.success) {
      return new Response(JSON.stringify({ error: filteredResult.error }), { status: 400 });
    }

    return { success: true, data: filteredResult.data };
  },
  {
    summary: 'Get job metrics',
    tags: ['Metrics'],

    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                pending: { type: 'number' },
                running: { type: 'number' },
                completed: { type: 'number' },
                failed: { type: 'number' },
                cancelled: { type: 'number' },
                avgCompletionTimeMs: { type: 'number' },
                retryRate: { type: 'number' },
                successRate: { type: 'number' },
              },
              required: [
                'total',
                'pending',
                'running',
                'completed',
                'failed',
                'cancelled',
                'retryRate',
                'successRate',
              ],
            },
          },
        },
      },
    },
  },
);
