// GENERATED CODE - DO NOT MODIFY
import { db } from "@/lib/core/db";
import { Logger } from "@/lib/core/logger";
import type { ServiceResponse } from "@/types/service";
import { HookSystem } from "@/lib/modules/hooks";
import type { PasswordResetToken, Prisma } from "@prisma/client";
import type { ApiActor } from "@/lib/api/api-docs";

// GENERATED CODE - DO NOT MODIFY
/** Service class for PasswordResetToken-related business logic. */
export class PasswordResetTokenService {
  public static async list(
    params?: Prisma.PasswordResetTokenFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<PasswordResetToken[]>> {
    try {
      const { where, take, skip, orderBy, select } = params || {};
      const [data, total] = await db.$transaction([
        db.passwordResetToken.findMany({ where, take, skip, orderBy, select }),
        db.passwordResetToken.count({ where }),
      ]);

      const filteredData = await HookSystem.filter(
        "passwordResetToken.list",
        data,
      );

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error("PasswordResetToken list Error", error);
      return {
        success: false,
        error: "passwordResetToken.service.error.list_failed",
      };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.PasswordResetTokenSelect,
  ): Promise<ServiceResponse<PasswordResetToken | null>> {
    try {
      const data = await db.passwordResetToken.findUnique({
        where: { id },
        select,
      });
      if (!data)
        return {
          success: false,
          error: "passwordResetToken.service.error.not_found",
        };

      const filtered = await HookSystem.filter("passwordResetToken.read", data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("PasswordResetToken get Error", error);
      return {
        success: false,
        error: "passwordResetToken.service.error.get_failed",
      };
    }
  }

  public static async create(
    data: Prisma.PasswordResetTokenCreateInput,
    select?: Prisma.PasswordResetTokenSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<PasswordResetToken>> {
    try {
      const input = await HookSystem.filter(
        "passwordResetToken.beforeCreate",
        data,
      );

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.passwordResetToken.create({
          data: input as any,
          select,
        });
        await HookSystem.dispatch("passwordResetToken.created", {
          id: created.id,
          actorId: "system",
        });
        return created;
      });

      const filtered = await HookSystem.filter(
        "passwordResetToken.read",
        newItem,
      );

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("PasswordResetToken create Error", error);
      return {
        success: false,
        error: "passwordResetToken.service.error.create_failed",
      };
    }
  }

  public static async update(
    id: string,
    data: Prisma.PasswordResetTokenUpdateInput,
    select?: Prisma.PasswordResetTokenSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<PasswordResetToken>> {
    try {
      const input = await HookSystem.filter(
        "passwordResetToken.beforeUpdate",
        data,
      );

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.passwordResetToken.update({
          where: { id },
          data: input as any,
          select,
        });
        await HookSystem.dispatch("passwordResetToken.updated", {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter(
        "passwordResetToken.read",
        updatedItem,
      );

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("PasswordResetToken update Error", error);
      return {
        success: false,
        error: "passwordResetToken.service.error.update_failed",
      };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.passwordResetToken.delete({ where: { id } });
        await HookSystem.dispatch("passwordResetToken.deleted", { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error("PasswordResetToken delete Error", error);
      return {
        success: false,
        error: "passwordResetToken.service.error.delete_failed",
      };
    }
  }
}
