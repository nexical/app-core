// GENERATED CODE - DO NOT MODIFY
import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import type { AgentMetrics } from '../sdk/types';

// GENERATED CODE - DO NOT MODIFY
export class GetAgentMetricsAction {
  public static async run(
    _input: void,
    context: APIContext,
  ): Promise<ServiceResponse<AgentMetrics>> {
    return { success: true, data: {} as unknown as AgentMetrics };
  }
}
