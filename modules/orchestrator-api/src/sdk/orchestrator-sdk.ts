// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource } from '@nexical/sdk-core';
import type { PollJobsDTO, Job } from './types';

/** SDK client for Orchestrator. */
export class OrchestratorSDK extends BaseResource {
  public async pollJobs(
    data: PollJobsDTO,
  ): Promise<{ success: boolean; data: Job[]; error?: string }> {
    return this._request('POST', `/orchestrator/poll`, data);
  }
}
