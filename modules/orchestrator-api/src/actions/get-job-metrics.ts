// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { JobMetrics } from '../sdk/types';

// GENERATED CODE - DO NOT MODIFY
export class GetJobMetricsAction {
  public static async run(_input: void, context: APIContext): Promise<ServiceResponse<JobMetrics>> {
    return { success: true, data: {} as unknown as JobMetrics };
  }
}
