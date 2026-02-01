import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';

/**
 * NAMING CONVENTION: Class MUST end with 'Agent'.
 */
export class __Name__Agent extends PersistentAgent {
  // 1. Define Agent Name (Unique ID)
  public name = '__module__.__name__';

  // 2. Define Interval (Optional, defaults to 60s)
  // public intervalMs = 60000;

  /**
   * RULE OF AUTHORITY:
   * Background agents MUST NOT import 'db' directly.
   * Use this.api (SDK) or import a Service class.
   */
  public async tick(): Promise<void> {
    // 3. Logic
    // This runs repeatedly based on the interval.
    this.logger.info(`Agent ${this.name} ticking...`);

    // Example: Use the SDK or Service Authority
    // const projects = await this.api.project.list();
  }
}
