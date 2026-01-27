// GENERATED CODE - DO NOT MODIFY
import { db } from "@/lib/core/db";
import { Logger } from "@/lib/core/logger";
import type { ServiceResponse } from "@/types/service";
import { HookSystem } from "@/lib/modules/hooks";
import type { User, Prisma } from "@prisma/client";
import type { ApiActor } from "@/lib/api/api-docs";

// GENERATED CODE - DO NOT MODIFY
/** Service class for User-related business logic. */
export class UserService {
  public static async list(
    params?: Prisma.UserFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<User[]>> {
    try {
      const { where, take, skip, orderBy, select } = params || {};
      const [data, total] = await db.$transaction([
        db.user.findMany({ where, take, skip, orderBy, select }),
        db.user.count({ where }),
      ]);

      const filteredData = await HookSystem.filter("user.list", data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error("User list Error", error);
      return { success: false, error: "user.service.error.list_failed" };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.UserSelect,
  ): Promise<ServiceResponse<User | null>> {
    try {
      const data = await db.user.findUnique({ where: { id }, select });
      if (!data)
        return { success: false, error: "user.service.error.not_found" };

      const filtered = await HookSystem.filter("user.read", data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("User get Error", error);
      return { success: false, error: "user.service.error.get_failed" };
    }
  }

  public static async create(
    data: Prisma.UserCreateInput,
    select?: Prisma.UserSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<User>> {
    try {
      const input = await HookSystem.filter("user.beforeCreate", data);

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.user.create({ data: input as any, select });
        await HookSystem.dispatch("user.created", {
          id: created.id,
          actorId: "system",
        });
        return created;
      });

      const filtered = await HookSystem.filter("user.read", newItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("User create Error", error);
      return { success: false, error: "user.service.error.create_failed" };
    }
  }

  public static async update(
    id: string,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<User>> {
    try {
      const input = await HookSystem.filter("user.beforeUpdate", data);

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id },
          data: input as any,
          select,
        });
        await HookSystem.dispatch("user.updated", {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter("user.read", updatedItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("User update Error", error);
      return { success: false, error: "user.service.error.update_failed" };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.user.delete({ where: { id } });
        await HookSystem.dispatch("user.deleted", { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error("User delete Error", error);
      return { success: false, error: "user.service.error.delete_failed" };
    }
  }
}
