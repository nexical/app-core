// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import { Logger } from '@/lib/core/logger';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { Account, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';

// GENERATED CODE - DO NOT MODIFY
/** Service class for Account-related business logic. */
export class AccountService {
  public static async list(
    params?: Prisma.AccountFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Account[]>> {
    try {
      const { where, take, skip, orderBy, select } = params || {};
      const [data, total] = await db.$transaction([
        db.account.findMany({ where, take, skip, orderBy, select }),
        db.account.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('account.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error('Account list Error', error);
      return { success: false, error: 'account.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.AccountSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Account | null>> {
    try {
      const data = await db.account.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'account.service.error.not_found' };

      const filtered = await HookSystem.filter('account.read', data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Account get Error', error);
      return { success: false, error: 'account.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.AccountCreateInput,
    select?: Prisma.AccountSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Account>> {
    try {
      const input = await HookSystem.filter('account.beforeCreate', data);

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.account.create({
          data: input as Prisma.AccountCreateInput,
          select,
        });
        await HookSystem.dispatch('account.created', {
          id: created.id,
          actorId: 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('account.read', newItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Account create Error', error);
      return { success: false, error: 'account.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.AccountUpdateInput,
    select?: Prisma.AccountSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Account>> {
    try {
      const input = await HookSystem.filter('account.beforeUpdate', data);

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.account.update({
          where: { id },
          data: input as Prisma.AccountUpdateInput,
          select,
        });
        await HookSystem.dispatch('account.updated', {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter('account.read', updatedItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Account update Error', error);
      return { success: false, error: 'account.service.error.update_failed' };
    }
  }

  public static async delete(id: string, actor?: ApiActor): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.account.delete({ where: { id } });
        await HookSystem.dispatch('account.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error('Account delete Error', error);
      return { success: false, error: 'account.service.error.delete_failed' };
    }
  }
}
