import { db } from '@/lib/core/db';
import { ServiceResponse } from '@/lib/core/service-response';
import type { ApiActor } from '@/types/auth';

/**
 * EXAMPLE: Tenancy Enforcement in Service Layer
 *
 * This example demonstrates the standard pattern for scoping database
 * queries to the current actor's context (Team/User ID).
 */
export class ProjectService {
  /**
   * Scoped 'Get' operation.
   * Ensures the user can only fetch projects belonging to their team.
   */
  public static async get(actor: ApiActor, id: string): Promise<ServiceResponse<unknown>> {
    try {
      // MANDATORY: Scope query by actor.teamId or actor.id
      const project = await db.project.findFirst({
        where: {
          id,
          teamId: actor.teamId, // Tenancy Enforcement
        },
      });

      if (!project) {
        return ServiceResponse.error('Project not found or access denied', 404);
      }

      return ServiceResponse.success(project);
    } catch {
      return ServiceResponse.error('Failed to fetch project');
    }
  }

  /**
   * Scoped 'List' operation.
   */
  public static async list(actor: ApiActor): Promise<ServiceResponse<unknown[]>> {
    const projects = await db.project.findMany({
      where: { teamId: actor.teamId }, // Tenancy Enforcement
    });

    return ServiceResponse.success(projects);
  }
}
