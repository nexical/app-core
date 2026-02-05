// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { AgentMetrics } from '../sdk/types';
import { JobMetricsService } from '../services/job-metrics-service';
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
export class GetAgentMetricsAction {
  public static async run(
    _input: void,
    context: APIContext,
  ): Promise<ServiceResponse<AgentMetrics>> {
    const metrics = await JobMetricsService.getAgentMetrics();
    return { success: true, data: metrics };
  }
}
