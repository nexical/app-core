import { db } from '@/lib/core/db';
import { HookSystem } from '@/lib/modules/hooks';
import type { ServiceResponse } from '@/types/service';
import type { ApiActor } from '@/types/actor';
import type { Prisma } from '@prisma/client';

/**
 * MANUAL SERVICE TEMPLATE
 *
 * LOCATION: modules/{name}/src/services/
 *
 * NOTE: This is a MIXED DIRECTORY. If you see '// GENERATED CODE' in a file, DO NOT EDIT IT.
 * Create a new file with a manual suffix (e.g., '*-ops-service.ts') for custom domain logic.
 *
 * STRICT RULES:
 * 1. Services are the ONLY layer allowed to import 'db'.
 * 2. All public methods MUST be 'public static async', accept an 'actor: ApiActor', and return Promise<ServiceResponse<T>>.
 * 3. Follow the sequence: Filter Input -> Execute Logic -> Dispatch Side-Effects -> Filter Output.
 */
export class EntityOpsService {
  /**
   * Creates a new Entity with HookSystem integration and Transaction safety.
   */
  static async create(
    input: Prisma.EntityCreateInput,
    actor: ApiActor,
  ): Promise<ServiceResponse<Prisma.Entity>> {
    try {
      // 1. Filter Input (Pre-computation hooks)
      const filteredInput = await HookSystem.filter('entity.beforeCreate', input, { actor });

      // 2. Atomic Transaction (Execute Logic)
      const result = await db.$transaction(async (tx) => {
        // Always use 'tx' inside the transaction scope, NEVER 'db'
        const item = await tx.entity.create({
          data: filteredInput,
        });
        return item;
      });

      // 3. Dispatch Event (Post-computation side effects)
      await HookSystem.dispatch('entity.created', result, { actor });

      // 4. Filter Output (Sanitization/Transformation/Permission checking)
      const finalData = await HookSystem.filter('entity.afterCreate', result, { actor });

      return { success: true, data: finalData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Entity',
      };
    }
  }

  /**
   * Retrieves an Entity by ID.
   * EVEN READS should follow the flow if they trigger hooks/filtering.
   */
  static async getById(
    id: string,
    actor: ApiActor,
  ): Promise<ServiceResponse<Prisma.Entity | null>> {
    try {
      // 1. Filter Input (e.g. scoping the ID)
      const filteredId = await HookSystem.filter('entity.beforeRead', id, { actor });

      // 2. Execute Logic
      const item = await db.entity.findUnique({ where: { id: filteredId } });

      if (!item) return { success: true, data: null };

      // 3. Dispatch Event (Optional for reads)
      await HookSystem.dispatch('entity.read', item, { actor });

      // 4. Filter Output (Sanitization/Transformation/Permission checking)
      const filteredItem = await HookSystem.filter('entity.afterRead', item, { actor });

      return { success: true, data: filteredItem };
    } catch (error) {
      return { success: false, error: 'Failed to fetch Entity' };
    }
  }
}
