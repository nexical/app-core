import { db } from '@/lib/core/db';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { UserUi, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';
import { Logger } from '@/lib/core/logger';

// GENERATED CODE - DO NOT MODIFY
/** Service class for UserUi-related business logic. */
export class UserUiService {
  public static async list(
    params?: Prisma.UserUiFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<UserUi[]>> {
    try {
      let { where, take, skip, orderBy, select } = params || {};

      // Allow hooks to modify the query parameters (e.g. for scoping)
      // Pass actor context if available
      const filteredParams = await HookSystem.filter('userUi.beforeList', {
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
        db.userUi.findMany({ where, take, skip, orderBy, select }),
        db.userUi.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('userUi.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error('UserUi list Error', error);
      return { success: false, error: 'userUi.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.UserUiSelect,
  ): Promise<ServiceResponse<UserUi | null>> {
    try {
      const data = await db.userUi.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'userUi.service.error.not_found' };

      const filtered = await HookSystem.filter('userUi.read', data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('UserUi get Error', error);
      return { success: false, error: 'userUi.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.UserUiCreateInput,
    select?: Prisma.UserUiSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<UserUi>> {
    try {
      // Pass actor context to hooks for security/authorship validation
      const input = await HookSystem.filter('userUi.beforeCreate', data, { actor });

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.userUi.create({ data: input as Prisma.UserUiCreateInput, select });
        await HookSystem.dispatch('userUi.created', {
          id: created.id,
          actorId: actor?.id || 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('userUi.read', newItem, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('UserUi create Error', error);
      return { success: false, error: 'userUi.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.UserUiUpdateInput,
    select?: Prisma.UserUiSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<UserUi>> {
    try {
      const input = await HookSystem.filter('userUi.beforeUpdate', data, { actor, id });

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.userUi.update({
          where: { id },
          data: input as Prisma.UserUiUpdateInput,
          select,
        });
        await HookSystem.dispatch('userUi.updated', {
          id,
          changes: Object.keys(input),
          actorId: actor?.id,
        });
        return updated;
      });

      const filtered = await HookSystem.filter('userUi.read', updatedItem, { actor });

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('UserUi update Error', error);
      return { success: false, error: 'userUi.service.error.update_failed' };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.userUi.delete({ where: { id } });
        await HookSystem.dispatch('userUi.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error('UserUi delete Error', error);
      return { success: false, error: 'userUi.service.error.delete_failed' };
    }
  }
}
