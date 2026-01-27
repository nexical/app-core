// GENERATED CODE - DO NOT MODIFY
import { db } from "@/lib/core/db";
import { Logger } from "@/lib/core/logger";
import type { ServiceResponse } from "@/types/service";
import { HookSystem } from "@/lib/modules/hooks";
import type { Invitation, Prisma } from "@prisma/client";
import type { ApiActor } from "@/lib/api/api-docs";

// GENERATED CODE - DO NOT MODIFY
/** Service class for Invitation-related business logic. */
export class InvitationService {
  public static async list(
    params?: Prisma.InvitationFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Invitation[]>> {
    try {
      const { where, take, skip, orderBy, select } = params || {};
      const [data, total] = await db.$transaction([
        db.invitation.findMany({ where, take, skip, orderBy, select }),
        db.invitation.count({ where }),
      ]);

      const filteredData = await HookSystem.filter("invitation.list", data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      Logger.error("Invitation list Error", error);
      return { success: false, error: "invitation.service.error.list_failed" };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.InvitationSelect,
  ): Promise<ServiceResponse<Invitation | null>> {
    try {
      const data = await db.invitation.findUnique({ where: { id }, select });
      if (!data)
        return { success: false, error: "invitation.service.error.not_found" };

      const filtered = await HookSystem.filter("invitation.read", data);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("Invitation get Error", error);
      return { success: false, error: "invitation.service.error.get_failed" };
    }
  }

  public static async create(
    data: Prisma.InvitationCreateInput,
    select?: Prisma.InvitationSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Invitation>> {
    try {
      const input = await HookSystem.filter("invitation.beforeCreate", data);

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.invitation.create({
          data: input as any,
          select,
        });
        await HookSystem.dispatch("invitation.created", {
          id: created.id,
          actorId: "system",
        });
        return created;
      });

      const filtered = await HookSystem.filter("invitation.read", newItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("Invitation create Error", error);
      return {
        success: false,
        error: "invitation.service.error.create_failed",
      };
    }
  }

  public static async update(
    id: string,
    data: Prisma.InvitationUpdateInput,
    select?: Prisma.InvitationSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Invitation>> {
    try {
      const input = await HookSystem.filter("invitation.beforeUpdate", data);

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.invitation.update({
          where: { id },
          data: input as any,
          select,
        });
        await HookSystem.dispatch("invitation.updated", {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter("invitation.read", updatedItem);

      return { success: true, data: filtered };
    } catch (error) {
      Logger.error("Invitation update Error", error);
      return {
        success: false,
        error: "invitation.service.error.update_failed",
      };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.invitation.delete({ where: { id } });
        await HookSystem.dispatch("invitation.deleted", { id });
      });
      return { success: true };
    } catch (error) {
      Logger.error("Invitation delete Error", error);
      return {
        success: false,
        error: "invitation.service.error.delete_failed",
      };
    }
  }
}
