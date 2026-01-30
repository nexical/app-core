import type { ServiceResponse } from '@/types/service';
import type { APIContext } from 'astro';
import { z } from 'zod';

export const CreateResourceSchema = z.object({
  name: z.string().min(1),
});

export class CreateResourceAction {
  /**
   * Orchestrates the creation of a resource.
   * Actions manage context and delegation, while Services handle the DB.
   */
  public static async run(
    input: z.infer<typeof CreateResourceSchema>,
    context: APIContext,
  ): Promise<ServiceResponse<any>> {
    // 1. Authorization
    const actor = context.locals.actor;

    // 2. Validation
    const validated = CreateResourceSchema.parse(input);

    // 3. Delegate to Service
    // return await ResourceService.create(validated, actor);

    return { success: true, data: {} };
  }
}
