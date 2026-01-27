// GENERATED CODE - DO NOT MODIFY
import { db } from "@/lib/core/db";
import { Logger } from "@/lib/core/logger";
import type { ServiceResponse } from "@/types/service";
import { HookSystem } from "@/lib/modules/hooks";
import type { VerificationToken, Prisma } from "@prisma/client";
import type { ApiActor } from "@/lib/api/api-docs";

// GENERATED CODE - DO NOT MODIFY
/** Service class for VerificationToken-related business logic. */
export class VerificationTokenService {
  public static async list(
    params?: Prisma.VerificationTokenFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<VerificationToken[]>> {
    try {
      const { where, take, skip, orderBy, select } = params || {};
      const [data, total] = await db.$transaction([
        db.verificationToken.findMany({ where, take, skip, orderBy, select }),
        db.verificationToken.count({ where }),
      ]);

      const filteredData = await HookSystem.filter(
        "verificationToken.list",
        data,
      );

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error("VerificationToken list Error", error);
      return {
        success: false,
        error: "verificationToken.service.error.list_failed",
      };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.VerificationTokenSelect,
  ): Promise<ServiceResponse<VerificationToken | null>> {
    try {
      const data = await db.verificationToken.findUnique({
        where: { id },
        select,
      });
      if (!data)
        return {
          success: false,
          error: "verificationToken.service.error.not_found",
        };

      const filtered = await HookSystem.filter("verificationToken.read", data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("VerificationToken get Error", error);
      return {
        success: false,
        error: "verificationToken.service.error.get_failed",
      };
    }
  }

  public static async create(
    data: Prisma.VerificationTokenCreateInput,
    select?: Prisma.VerificationTokenSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<VerificationToken>> {
    try {
      const input = await HookSystem.filter(
        "verificationToken.beforeCreate",
        data,
      );

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.verificationToken.create({
          data: input as any,
          select,
        });
        await HookSystem.dispatch("verificationToken.created", {
          id: created.id,
          actorId: "system",
        });
        return created;
      });

      const filtered = await HookSystem.filter(
        "verificationToken.read",
        newItem,
      );

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("VerificationToken create Error", error);
      return {
        success: false,
        error: "verificationToken.service.error.create_failed",
      };
    }
  }

  public static async update(
    id: string,
    data: Prisma.VerificationTokenUpdateInput,
    select?: Prisma.VerificationTokenSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<VerificationToken>> {
    try {
      const input = await HookSystem.filter(
        "verificationToken.beforeUpdate",
        data,
      );

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.verificationToken.update({
          where: { id },
          data: input as any,
          select,
        });
        await HookSystem.dispatch("verificationToken.updated", {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter(
        "verificationToken.read",
        updatedItem,
      );

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("VerificationToken update Error", error);
      return {
        success: false,
        error: "verificationToken.service.error.update_failed",
      };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.verificationToken.delete({ where: { id } });
        await HookSystem.dispatch("verificationToken.deleted", { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error("VerificationToken delete Error", error);
      return {
        success: false,
        error: "verificationToken.service.error.delete_failed",
      };
    }
  }
}
