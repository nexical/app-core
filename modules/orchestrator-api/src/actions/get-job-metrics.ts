// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { JobMetrics } from '../sdk/types';
import { JobMetricsService } from '../services/job-metrics-service';
// GENERATED CODE - DO NOT MODIFY
// GENERATED CODE - DO NOT MODIFY
export class GetJobMetricsAction {
  public static async run(_input: void, context: APIContext): Promise<ServiceResponse<JobMetrics>> {
    const metrics = await JobMetricsService.getJobMetrics();
    return { success: true, data: metrics };
  }
}
