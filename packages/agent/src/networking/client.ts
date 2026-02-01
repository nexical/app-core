import { NexicalClient } from '@nexical/sdk';
import { AgentAuthStrategy } from './auth.js';
import type { AgentJob, AgentResult } from '../core/types.js';

export interface AgentClientConfig {
  apiUrl: string;
  apiToken: string;
}

export class AgentClient {
  private client: NexicalClient;

  constructor(config: AgentClientConfig) {
    this.client = new NexicalClient({
      baseUrl: config.apiUrl,
      authStrategy: new AgentAuthStrategy(config.apiToken),
    });
  }

  public async poll(capabilities: string[], agentId?: string): Promise<AgentJob | null> {
    const jobs = await this.client.orchestrator.orchestrator.pollJobs({ capabilities, agentId });
    return jobs.length > 0 ? jobs[0] : null;
  }

  public async register(dto: {
    id?: string;
    hostname: string;
    capabilities: string[];
  }): Promise<void> {
    console.info('[AgentClient] Registering agent:', dto);
    await this.client.orchestrator.agent.register(
      dto as unknown as Parameters<typeof this.client.orchestrator.agent.register>[0],
    );
  }

  public async complete(jobId: string, result: AgentResult): Promise<void> {
    await this.client.orchestrator.job.completeJob(jobId, { result });
  }

  public async fail(jobId: string, error: string): Promise<void> {
    await this.client.orchestrator.job.failJob(jobId, { error });
  }
}
