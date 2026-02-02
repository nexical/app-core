// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource, ApiClient } from '@nexical/sdk-core';
import { JobSDK as BaseJobSDK } from './job-sdk';
import { JobLogSDK as BaseJobLogSDK } from './job-log-sdk';
import { AgentSDK as BaseAgentSDK } from './agent-sdk';
import { OrchestratorSDK as BaseOrchestratorSDK } from './orchestrator-sdk';

// GENERATED CODE - DO NOT MODIFY BY HAND
export * from './job-sdk';
export * from './job-log-sdk';
export * from './agent-sdk';
export * from './orchestrator-sdk';
export * from './types';

/** Main SDK for the orchestrator-api module. */
export class OrchestratorSDK extends BaseResource {
  public job: BaseJobSDK;
  public jobLog: BaseJobLogSDK;
  public agent: BaseAgentSDK;
  public orchestrator: BaseOrchestratorSDK;

  constructor(client: ApiClient) {
    super(client);
    this.job = new BaseJobSDK(client);
    this.jobLog = new BaseJobLogSDK(client);
    this.agent = new BaseAgentSDK(client);
    this.orchestrator = new BaseOrchestratorSDK(client);
  }
}
