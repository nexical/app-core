// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { DeadLetterJob, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';
import { Logger } from '@/lib/core/logger';

// GENERATED CODE - DO NOT MODIFY
/** Service class for DeadLetterJob-related business logic. */
export class DeadLetterJobService {
  public static async list(
    params?: Prisma.DeadLetterJobFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<DeadLetterJob[]>> {
    try {
      let { where, take, skip, orderBy, select } = params || {};

      // Allow hooks to modify the query parameters (e.g. for scoping)
      // Pass actor context if available
      const filteredParams = await HookSystem.filter('deadLetterJob.beforeList', {
        where,
        take,
        skip,
        orderBy,
        select,
        actor,
      });
      where = filteredParams.where;
      take = filteredParams.take;
      skip = filteredParams.skip;
      orderBy = filteredParams.orderBy;
      select = filteredParams.select;

      const [data, total] = await db.$transaction([
        db.deadLetterJob.findMany({ where, take, skip, orderBy, select }),
        db.deadLetterJob.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('deadLetterJob.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error('DeadLetterJob list Error', error);
      return { success: false, error: 'deadLetterJob.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.DeadLetterJobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<DeadLetterJob | null>> {
    try {
      const data = await db.deadLetterJob.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'deadLetterJob.service.error.not_found' };

      const filtered = await HookSystem.filter('deadLetterJob.read', data, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('DeadLetterJob get Error', error);
      return { success: false, error: 'deadLetterJob.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.DeadLetterJobCreateInput,
    select?: Prisma.DeadLetterJobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<DeadLetterJob>> {
    try {
      // Pass actor context to hooks for security/authorship validation
      const input = await HookSystem.filter('deadLetterJob.beforeCreate', data, { actor });

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.deadLetterJob.create({
          data: input as Prisma.DeadLetterJobCreateInput,
          select,
        });
        await HookSystem.dispatch('deadLetterJob.created', {
          id: created.id,
          actorId: actor?.id || 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('deadLetterJob.read', newItem, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('DeadLetterJob create Error', error);
      return { success: false, error: 'deadLetterJob.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.DeadLetterJobUpdateInput,
    select?: Prisma.DeadLetterJobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<DeadLetterJob>> {
    try {
      const input = await HookSystem.filter('deadLetterJob.beforeUpdate', data, { actor, id });

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.deadLetterJob.update({
          where: { id },
          data: input as Prisma.DeadLetterJobUpdateInput,
          select,
        });
        await HookSystem.dispatch('deadLetterJob.updated', {
          id,
          changes: Object.keys(input),
          actorId: actor?.id,
        });
        return updated;
      });

      const filtered = await HookSystem.filter('deadLetterJob.read', updatedItem, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('DeadLetterJob update Error', error);
      return { success: false, error: 'deadLetterJob.service.error.update_failed' };
    }
  }

  public static async delete(id: string, actor?: ApiActor): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.deadLetterJob.delete({ where: { id } });
        await HookSystem.dispatch('deadLetterJob.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error('DeadLetterJob delete Error', error);
      return { success: false, error: 'deadLetterJob.service.error.delete_failed' };
    }
  }
}
