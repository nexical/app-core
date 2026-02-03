// Manual Route - Get Orchestration Metrics
import { defineApi } from '@/lib/api/api-docs';
import { ApiGuard } from '@/lib/api/api-guard';
import { JobMetricsService } from '@modules/orchestrator-api/src/services/job-metrics-service';

export const GET = defineApi(
  async (context) => {
    // Security Check - Only admins can view metrics
    await ApiGuard.protect(context, 'admin');

    // Get metrics
    const [jobs, agents] = await Promise.all([
      JobMetricsService.getJobMetrics(),
      JobMetricsService.getAgentMetrics(),
    ]);

    return {
      success: true,
      data: {
        jobs,
        agents,
        timestamp: new Date().toISOString(),
      },
    };
  },
  {
    summary: 'Get orchestration metrics',
    tags: ['Orchestrator'],
    responses: {
      200: {
        description: 'Metrics snapshot',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  properties: {
                    jobs: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        pending: { type: 'integer' },
                        running: { type: 'integer' },
                        completed: { type: 'integer' },
                        failed: { type: 'integer' },
                        cancelled: { type: 'integer' },
                        successRate: { type: 'number' },
                        retryRate: { type: 'number' },
                      },
                    },
                    agents: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        online: { type: 'integer' },
                        offline: { type: 'integer' },
                        busy: { type: 'integer' },
                        jobsProcessedLast24h: { type: 'integer' },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time' },
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
