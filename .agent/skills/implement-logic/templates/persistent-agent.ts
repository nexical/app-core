import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';
import { __Entity__OpsService } from '../services/__entity__-ops-service';

/**
 * Persistent Agent Template
 *
 * Location: src/agent/
 * Naming: {kebab-case}.ts
 *
 * Rules:
 * 1. Extend PersistentAgent.
 * 2. Implement `tick()` method.
 * 3. Use this.api (Federated SDK) or Ops Services for data access.
 * 4. NEVER import 'db' directly.
 */
export class __AgentName__Agent extends PersistentAgent {
  public readonly name = '__module__.__agent_name__';
  protected intervalMs = 60000; // 1 minute

  protected async tick(): Promise<void> {
    this.logger.info(`[${this.name}] Tick started`);

    try {
      // Use this.api (Federated SDK) to fetch data across modules
      const res = await this.api.__module__.listItems({ status: 'PENDING' });

      if (!res.success) {
        this.logger.error(`Failed to fetch items: ${res.error}`);
        return;
      }

      for (const item of res.data) {
        // Perform work...
        await __Entity__OpsService.process(item.id);
      }
    } catch (error) {
      this.logger.error(`Tick failed:`, error);
    }
  }
}
