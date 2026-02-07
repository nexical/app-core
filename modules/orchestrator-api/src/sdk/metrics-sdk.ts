// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource } from '@nexical/sdk/core';
import type { JobMetrics, AgentMetrics } from './types.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for Metrics. */
export class MetricsSDK extends BaseResource {
  public async getJobMetrics(): Promise<{ success: boolean; data: JobMetrics; error?: string }> {
    return this._request('GET', `/metrics/jobs`);
  }

  public async getAgentMetrics(): Promise<{
    success: boolean;
    data: AgentMetrics;
    error?: string;
  }> {
    return this._request('GET', `/metrics/agents`);
  }
}
