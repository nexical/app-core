import type { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

export class IsJobOwner implements RolePolicy {
   
  async check(
    context: AstroGlobal | APIContext,
    input: Record<string, unknown>,
    data?: any,
  ): Promise<void> {
    // 1. Basic Authentication Check
    const actor = context.locals?.actor;

    if (!actor) {
      throw new Error('Unauthorized: Login required');
    }

    // 2. Admin Override
    if (actor.role === 'ADMIN') return;

    // 3. Agent Access (Delegated to Service Layer)
    // Agents are allowed to pass the Role Guard.
    // Specific operations (like complete) will check locks in the Service.
    if (actor.role === 'AGENT' || actor.type === 'agent') return;

    // 4. Ownership Check (Resource Level)
    // If we are operating on a specific resource (data is present)
    if (data) {
      let isOwner =
        (data.actorId && data.actorId === actor.id) || (data.userId && data.userId === actor.id);

      // Handle Child Resources (e.g. JobLog) that reference a job
      if (!isOwner && data.jobId) {
        const db = (await import('@/lib/core/db')).db;
        const job = await db.job.findUnique({
          where: { id: data.jobId },
          select: { actorId: true, userId: true, actorType: true },
        });
        if (job) {
          isOwner =
            (job.actorId && job.actorId === actor.id) || (job.userId && job.userId === actor.id);

          if (!isOwner && job.actorId && actor.id) {
            // Check Team Membership
            const membership = await db.teamMember.findFirst({
              where: { teamId: job.actorId, userId: actor.id },
            });
            if (membership) isOwner = true;
          }
        }
      }

      // Handle ID-only operations (DELETE/GET single)
      if (!isOwner && data.id) {
        const db = (await import('@/lib/core/db')).db;
        const url = context.request.url;

        if (url.includes('/api/job-log/')) {
          // It's a JobLog
          const log = await db.jobLog.findUnique({
            where: { id: data.id },
            select: { job: { select: { actorId: true, userId: true, actorType: true } } },
          });
          if (log?.job) {
            isOwner = log.job.actorId === actor.id || log.job.userId === actor.id;

            if (!isOwner && log.job.actorId && actor.id) {
              // Check Team Membership
              const membership = await db.teamMember.findFirst({
                where: { teamId: log.job.actorId, userId: actor.id },
              });
              if (membership) isOwner = true;
            }
          }
        } else if (url.includes('/api/job/')) {
          // It's a Job
          const job = await db.job.findUnique({
            where: { id: data.id },
            select: { actorId: true, userId: true, actorType: true },
          });
          if (job) {
            isOwner = job.actorId === actor.id || job.userId === actor.id;

            if (!isOwner && job.actorId && actor.id) {
              // Check Team Membership
              const membership = await db.teamMember.findFirst({
                where: { teamId: job.actorId, userId: actor.id },
              });
              if (membership) isOwner = true;
            }
          }
        }
      }

      if (isOwner) return;

      // If we have data but no match, Forbidden
      throw new Error('Forbidden: You do not own this Job');
    }

    // 5. List/Create Scope Check (Input Level)
    // If no specific data is loaded (e.g. creating or listing), we check the input parameters
    // to ensure they aren't trying to create/list for someone else.
    if (input) {
      // If specifying an actorId, it must match OR be a team the user belongs to
      if (input.actorId && input.actorId !== actor.id) {
        const db = (await import('@/lib/core/db')).db;
        const membership = await db.teamMember.findFirst({
          where: { teamId: input.actorId, userId: actor.id },
        });

        if (!membership) {
          throw new Error('Forbidden: Cannot act on behalf of another actor');
        }
      }
      // If specifying a userId, it must match
      if (input.userId && input.userId !== actor.id) {
        throw new Error('Forbidden: Cannot act on behalf of another user');
      }
    }
  }
}
