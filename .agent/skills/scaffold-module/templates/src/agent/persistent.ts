import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';

export class CustomPersistentAgent extends PersistentAgent {
  public name = 'custom-watcher';
  protected intervalMs = 60000; // 1 minute

  constructor() {
    super();
  }

  /**
   * RULE: NEVER import 'db' in an Agent.
   * Use 'this.api' or imported Services for data access.
   */
  async tick() {
    this.logger.info(`[${this.name}] Scanning for updates...`);
    try {
      // Logic here...
    } catch (error) {
      this.logger.error(`[${this.name}] Scan failed:`, error);
    }
  }
}
