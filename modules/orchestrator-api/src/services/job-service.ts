// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { Job, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';

// GENERATED CODE - DO NOT MODIFY
/** Service class for Job-related business logic. */
export class JobService {
  public static async list(
    params?: Prisma.JobFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Job[]>> {
    try {
      let { where, take, skip, orderBy, select } = params || {};

      // Allow hooks to modify the query parameters (e.g. for scoping)
      // Pass actor context if available
      const filteredParams = await HookSystem.filter('job.beforeList', {
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
        db.job.findMany({ where, take, skip, orderBy, select }),
        db.job.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('job.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error('Job list Error', error);
      return { success: false, error: 'job.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.JobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Job | null>> {
    try {
      const data = await db.job.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'job.service.error.not_found' };

      const filtered = await HookSystem.filter('job.read', data, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Job get Error', error);
      return { success: false, error: 'job.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.JobCreateInput,
    select?: Prisma.JobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Job>> {
    try {
      // Pass actor context to hooks for security/authorship validation
      const input = await HookSystem.filter('job.beforeCreate', data, {
        actor,
      });

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.job.create({ data: input, select });
        await HookSystem.dispatch('job.created', {
          id: created.id,
          actorId: actor?.id || 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('job.read', newItem, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Job create Error', error);
      return { success: false, error: 'job.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.JobUpdateInput,
    select?: Prisma.JobSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Job>> {
    try {
      const input = await HookSystem.filter('job.beforeUpdate', data, {
        actor,
        id,
      });

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.job.update({
          where: { id },
          data: input,
          select,
        });
        await HookSystem.dispatch('job.updated', {
          id,
          changes: Object.keys(input),
          actorId: actor?.id,
        });
        return updated;
      });

      const filtered = await HookSystem.filter('job.read', updatedItem, {
        actor,
      });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Job update Error', error);
      return { success: false, error: 'job.service.error.update_failed' };
    }
  }

  public static async delete(id: string, actor?: ApiActor): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.job.delete({ where: { id } });
        await HookSystem.dispatch('job.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error('Job delete Error', error);
      return { success: false, error: 'job.service.error.delete_failed' };
    }
  }
}
