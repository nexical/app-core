import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { HookSystem } from '@/lib/modules/hooks';
import type { ServiceResponse } from '@/types/service';
import type { ApiActor } from '@/lib/api/api-docs';

/**
 * Service Template (Manual Domain Logic)
 *
 * Naming: {kebab-case}-ops-service.ts
 * Location: src/services/
 *
 * Rules:
 * 1. Static Class (No instantiation).
 * 2. ALL public domain methods MUST return a ServiceResponse<T> object.
 * 3. ONLY layer allowed to import 'db' from '@/lib/core/db'.
 * 4. Domain methods MUST accept an 'actor?: ApiActor' parameter for scoping/security.
 * 5. Implement the "Hook-First" logic flow: Filter -> Execute -> Dispatch -> Filter.
 */
export class __Entity__OpsService {
  /**
   * Example Domain Operation
   * @param id The entity ID
   * @param actor The authenticated user/agent context (MANDATORY for security/scoping)
   */
  public static async processOperation(
    id: string,
    actor?: ApiActor,
  ): Promise<ServiceResponse<any>> {
    try {
      // 1. Hook: Filter (Pre-execution validation/modification)
      // Allows other modules to modify input or block the action.
      const { id: filteredId } = await HookSystem.filter(
        '__entity__.beforeProcess',
        { id },
        { actor },
      );

      // 2. Fetch & Execute (Transactional)
      const result = await db.$transaction(async (tx) => {
        const record = await tx.__entity__.findUnique({ where: { id: filteredId } });

        if (!record) throw new Error('not_found');

        // Custom business logic here...

        return record;
      });

      // 3. Hook: Dispatch (Post-execution Side Effects)
      // Asynchronous events for logging, notifications, or triggering other modules.
      await HookSystem.dispatch('__entity__.processed', { id: filteredId, actorId: actor?.id });

      // 4. Hook: Filter (Read/Decorate result for output)
      // Allows other modules to strip fields or add metadata based on the actor.
      const finalData = await HookSystem.filter('__entity__.read', result, { actor });

      return { success: true, data: finalData };
    } catch (error: any) {
      Logger.error('__Entity__OpsService.processOperation failed', error);
      return {
        success: false,
        error: error.message === 'not_found' ? 'service.error.not_found' : 'service.error.generic',
      };
    }
  }
}
