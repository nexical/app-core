import { db } from '@/lib/core/db';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';

/**
 * MANUAL DOMAIN SERVICE
 * Standard CRUD services are named {model}-service.ts and are GENERATED.
 * Put custom domain logic in static classes like this one.
 */
export class ResourceService {
  public static async performComplexLogic(id: string): Promise<ServiceResponse<any>> {
    try {
      const item = await db.model.findUnique({ where: { id } });
      if (!item) return { success: false, error: 'not_found' };

      const result = await db.$transaction(async (tx) => {
        // Complex operations...
        return item;
      });

      await HookSystem.dispatch('resource.processed', result);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'operation_failed' };
    }
  }
}
