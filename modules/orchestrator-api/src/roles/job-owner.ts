import type { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';
import { db } from '@/lib/core/db';

export class IsJobOwner implements RolePolicy {
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: unknown,
  ): Promise<void> {
    // 1. Basic Authentication Check
    const actor = context.locals?.actor;

    if (!actor) {
      throw new Error('Unauthorized: Login required');
    }

    // 2. Admin Oversight
    if (actor.role === 'ADMIN') return;

    // 3. Resource Level Checks
    // Normalize data/input: If data is provided (post-fetch), use it.
    // If not, and input has 'id' (pre-fetch), treat input as the resource identifier source.
    const resource = (data || input) as Record<string, unknown>;

    if (resource && (resource.id || resource.actorId || resource.jobId)) {
      const typedData = resource; // Use resource as data source

      // A. Direct Ownership Check (Input Data)
      // Check if the input object itself has owner fields matching the actor
      let isOwner = false;
      if (typedData.actorId === actor.id && typedData.actorType === actor.type) {
        isOwner = true;
      }

      // B. Job/Resource Lookup (Database Data)
      // If we are operating on a resource by ID, we need to verify the actual resource in DB logic
      // Note: Typically the Service layer handles the DB fetch, and passes the result as `data` here
      // via the "Post-Fetch" pattern if the API framework supports it.
      // However, seeing the previous implementation did DB lookups here, we will support strictly necessary lookups.

      // SCENARIO: Operations on an existing Job (complete, fail, cancel, progress, get)
      // We expect the 'data' passed to check() to often be the result of a Service call OR just the input parameters depending on how this is called.
      // If `data` is just input params (like { id: '...' }), we might need to fetch.
      // BUT, referencing the SKILL.md, Policies *should*      // 2. Input Scope Checks (Create/List)
      if (typedData.actorId) {
        if (typedData.actorId !== actor.id) {
          throw new Error('Forbidden: Cannot act on behalf of another actor');
        }
        isOwner = true;
      }

      if (typedData.jobId && !isOwner) {
        const job = await db.job.findUnique({
          where: { id: typedData.jobId as string },
          select: { actorId: true, actorType: true, lockedBy: true },
        });
        if (job) {
          const isCreator =
            job.actorId === actor.id && (job.actorType === actor.type || !job.actorType);
          const isLocker = job.lockedBy === actor.id;
          if (isCreator || isLocker) isOwner = true;
        }
      }
      // Existing code did manual DB lookups. To be safe and compatible with current architecture:

      if (!isOwner && typedData.id) {
        const id = typedData.id as string;

        // 1. Try Lookup as Job
        const job = await db.job.findUnique({
          where: { id },
          select: { actorId: true, actorType: true, lockedBy: true },
        });

        if (job) {
          const isCreator =
            job.actorId === actor.id && (job.actorType === actor.type || !job.actorType);
          const isLocker = job.lockedBy === actor.id;
          if (isCreator || isLocker) isOwner = true;
        } else {
          // 2. Try Lookup as JobLog
          const log = await db.jobLog.findUnique({
            where: { id },
            include: {
              job: {
                select: { actorId: true, actorType: true, lockedBy: true },
              },
            },
          });

          if (log?.job) {
            const isCreator =
              log.job.actorId === actor.id &&
              (log.job.actorType === actor.type || !log.job.actorType);
            const isLocker = log.job.lockedBy === actor.id;
            if (isCreator || isLocker) isOwner = true;
          } else {
            // If neither Job nor JobLog found by ID, return 404
            throw new Error('Resource not found');
          }
        }
      }

      if (isOwner) return;

      throw new Error('Forbidden: You do not have access to this resource');
    }

    // 4. Input Scope Checks (Create/List)
    // If no specific resource data is provided, ensure they aren't trying to act as someone else
    if (input) {
      // If specifying an actorId, it must match strict equality
      if (input.actorId && input.actorId !== actor.id) {
        throw new Error('Forbidden: Cannot act on behalf of another actor');
      }
      // If specifying actorType, it must match
      if (input.actorType && input.actorType !== actor.type) {
        throw new Error('Forbidden: Cannot act as a different actor type');
      }
    }
  }
}
