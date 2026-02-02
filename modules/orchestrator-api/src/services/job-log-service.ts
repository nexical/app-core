// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { JobLog, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';

// GENERATED CODE - DO NOT MODIFY
/** Service class for JobLog-related business logic. */
export class JobLogService {
  public static async list(
    params?: Prisma.JobLogFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<JobLog[]>> {
    try {
      let { where, take, skip, orderBy, select } = params || {};

      // Allow hooks to modify the query parameters (e.g. for scoping)
      // Pass actor context if available
      const filteredParams = await HookSystem.filter('jobLog.beforeList', {
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
        db.jobLog.findMany({ where, take, skip, orderBy, select }),
        db.jobLog.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('jobLog.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error('JobLog list Error', error);
      return { success: false, error: 'jobLog.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.JobLogSelect,
  ): Promise<ServiceResponse<JobLog | null>> {
    try {
      const data = await db.jobLog.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'jobLog.service.error.not_found' };

      const filtered = await HookSystem.filter('jobLog.read', data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('JobLog get Error', error);
      return { success: false, error: 'jobLog.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.JobLogCreateInput,
    select?: Prisma.JobLogSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<JobLog>> {
    try {
      // Pass actor context to hooks for security/authorship validation
      const input = await HookSystem.filter('jobLog.beforeCreate', data, {
        actor,
      });

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.jobLog.create({ data: input, select });
        await HookSystem.dispatch('jobLog.created', {
          id: created.id,
          actorId: actor?.id || 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('jobLog.read', newItem, {
        actor,
      });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('JobLog create Error', error);
      return { success: false, error: 'jobLog.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.JobLogUpdateInput,
    select?: Prisma.JobLogSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<JobLog>> {
    try {
      const input = await HookSystem.filter('jobLog.beforeUpdate', data, {
        actor,
        id,
      });

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.jobLog.update({
          where: { id },
          data: input,
          select,
        });
        await HookSystem.dispatch('jobLog.updated', {
          id,
          changes: Object.keys(input),
          actorId: actor?.id,
        });
        return updated;
      });

      const filtered = await HookSystem.filter('jobLog.read', updatedItem, {
        actor,
      });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('JobLog update Error', error);
      return { success: false, error: 'jobLog.service.error.update_failed' };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.jobLog.delete({ where: { id } });
        await HookSystem.dispatch('jobLog.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error('JobLog delete Error', error);
      return { success: false, error: 'jobLog.service.error.delete_failed' };
    }
  }
}
