import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';
import { db } from '@/lib/core/db';

/**
 * Persistent Agent Template
 *
 * Location: src/agent/
 *
 * Rules:
 * 1. Extend PersistentAgent.
 * 2. Implement `tick()` method.
 * 3. Use `db` (Universal Access) or `this.api` (Federated SDK).
 */
export class __AgentName__Agent extends PersistentAgent {
  public readonly name = '__module__.__agent_name__';
  protected intervalMs = 60000; // 1 minute

  protected async tick(): Promise<void> {
    this.logger.info(`[${this.name}] Tick started`);

    try {
      // Direct DB access example
      const items = await db.__entity__.findMany({
        where: { status: 'PENDING' },
      });

      for (const item of items) {
        // Perform work...
        await db.__entity__.update({
          where: { id: item.id },
          data: { status: 'COMPLETED' },
        });
      }
    } catch (error) {
      this.logger.error(`Tick failed:`, error);
    }
  }
}
