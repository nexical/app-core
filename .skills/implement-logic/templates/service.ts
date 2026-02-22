import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import { config } from '@/lib/core/config';
import { HookSystem } from '@/lib/modules/hooks';
import type { ServiceResponse } from '@/types/service';
import type { ApiActor } from '@/lib/api/api-docs';

/**
 * Service Template (Manual Domain Logic)
 *
 * Naming: {kebab-case}-service.ts
 * Location: src/services/
 *
 * Rules:
 * 1. Static Class (No instantiation).
 * 2. ALL public domain methods MUST return a ServiceResponse<T> object.
 * 3. Domain methods SHOULD accept an 'actor?: ApiActor' parameter.
 * 4. Implement the "Hook-First" logic flow: Filter -> Execute -> Dispatch -> Filter.
 * 5. Use 'config' helper for environment settings.
 */
export class __Entity__Service {
  /**
   * Example Domain Operation
   */
  public static async processOperation(
    id: string,
    actor?: ApiActor,
  ): Promise<ServiceResponse<unknown>> {
    try {
      // 1. Hook: Filter (Pre-execution validation/modification)
      const { id: filteredId } = await HookSystem.filter(
        '__entity__.beforeProcess',
        { id },
        { actor },
      );

      // 2. Fetch & Execute (Transactional)
      // Services are the only place where direct DB transactions should occur
      const result = await db.$transaction(async (tx) => {
        const record = await tx.__entity__.findUnique({ where: { id: filteredId } });

        if (!record) throw new Error('not_found');

        // Logic using config
        if (config.DEBUG_MODE) {
          Logger.info('Processing entity', { id: filteredId });
        }

        return record;
      });

      // 3. Hook: Dispatch (Post-execution Side Effects)
      await HookSystem.dispatch('__entity__.processed', { id: filteredId, actorId: actor?.id });

      // 4. Hook: Filter (Read/Decorate result for output)
      const finalData = await HookSystem.filter('__entity__.read', result, { actor });

      return { success: true, data: finalData };
    } catch (error: unknown) {
      Logger.error('__Entity__Service.processOperation failed', error);
      const err = error as Error;
      return {
        success: false,
        error: err?.message === 'not_found' ? 'service.error.not_found' : 'service.error.generic',
      };
    }
  }
}
