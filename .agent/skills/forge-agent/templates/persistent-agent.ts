import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';
import { HookSystem } from '@/lib/modules/hooks';

/**
 * TemplateAgent
 * File MUST be named: kebab-case.ts (e.g., watcher.ts)
 */
export class TemplateAgent extends PersistentAgent {
  public name = 'template-agent';
  protected intervalMs = 60000; // 1 minute

  async tick() {
    // 1. Delegate to Service Layer or Federated SDK (this.api)
    /*
    // Using this.api (Federated SDK provided by base class)
    const res = await this.api.module.action();
    
    // 2. REQUIRED: Handle ServiceResponse (Check success!)
    // Accessing .data without checking .success is FORBIDDEN.
    if (!res.success) {
       this.logger.error(`Agent tick failed: ${res.error?.message}`);
       return;
    }

    // 3. Dispatch events for side effects
    await HookSystem.dispatch('module.agent-tick-success', { agent: this.name });
    */
  }
}
