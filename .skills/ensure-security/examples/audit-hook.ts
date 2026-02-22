import { HookSystem } from '@/lib/modules/hooks';
import { Logger } from '@/lib/core/logger';

/**
 * EXAMPLE: Security Audit Hook
 *
 * This example demonstrates how to listen for sensitive events
 * and create an audit log without modifying the core business logic.
 * Place in `src/hooks/` for auto-discovery.
 */
export class SecurityAuditHooks {
  static init() {
    // Listen for critical security events
    HookSystem.on(
      'auth.login_failed',
      async (event: { email: string; ip: string; reason: string }) => {
        Logger.warn(`Security Alert: Failed login for ${event.email} from ${event.ip}`);

        // Side effect: In a real scenario, you might call a Service to log to the DB
        // CRITICAL: NEVER import 'db' in a hook.
      },
    );

    HookSystem.on(
      'role.assigned',
      async (event: { userId: string; role: string; assignedBy: string }) => {
        Logger.info(`audit  Role ${event.role} assigned to ${event.userId} by ${event.assignedBy}`);
      },
    );
  }
}
