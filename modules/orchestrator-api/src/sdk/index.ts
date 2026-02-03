// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource, ApiClient } from '@nexical/sdk-core';
import { JobSDK as BaseJobSDK } from './job-sdk.js';
import { JobLogSDK as BaseJobLogSDK } from './job-log-sdk.js';
import { AgentSDK as BaseAgentSDK } from './agent-sdk.js';
import { DeadLetterJobSDK as BaseDeadLetterJobSDK } from './dead-letter-job-sdk.js';
import { OrchestratorSDK as BaseOrchestratorSDK } from './orchestrator-sdk.js';
import { MetricsSDK as BaseMetricsSDK } from './metrics-sdk.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
export * from './job-sdk.js';
export * from './job-log-sdk.js';
export * from './agent-sdk.js';
export * from './dead-letter-job-sdk.js';
export * from './orchestrator-sdk.js';
export * from './metrics-sdk.js';
export * from './types.js';

/** Main SDK for the orchestrator-api module. */
export class OrchestratorModule extends BaseResource {
  public job: BaseJobSDK;
  public jobLog: BaseJobLogSDK;
  public agent: BaseAgentSDK;
  public deadLetterJob: BaseDeadLetterJobSDK;
  public orchestrator: BaseOrchestratorSDK;
  public metrics: BaseMetricsSDK;

  constructor(client: ApiClient) {
    super(client);
    this.job = new BaseJobSDK(client);
    this.jobLog = new BaseJobLogSDK(client);
    this.agent = new BaseAgentSDK(client);
    this.deadLetterJob = new BaseDeadLetterJobSDK(client);
    this.orchestrator = new BaseOrchestratorSDK(client);
    this.metrics = new BaseMetricsSDK(client);
  }
}
