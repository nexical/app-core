// GENERATED CODE - DO NOT MODIFY
import { db } from '@/lib/core/db';
import type { ServiceResponse } from '@/types/service';
import { HookSystem } from '@/lib/modules/hooks';
import type { Agent, Prisma } from '@prisma/client';
import type { ApiActor } from '@/lib/api/api-docs';

/** Service class for Agent-related business logic. */
export class AgentService {
  public static async list(
    params?: Prisma.AgentFindManyArgs,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Agent[]>> {
    try {
      const { where, take = 50, skip = 0, orderBy = { createdAt: 'desc' }, select } = params || {};
      const [data, total] = await db.$transaction([
        db.agent.findMany({ where, take, skip, orderBy, select }),
        db.agent.count({ where }),
      ]);

      const filteredData = await HookSystem.filter('agent.list', data);

      return { success: true, data: filteredData, total };
    } catch (error) {
      console.error('Agent list Error:', error);
      return { success: false, error: 'agent.service.error.list_failed' };
    }
  }

  public static async get(
    id: string,
    select?: Prisma.AgentSelect,
  ): Promise<ServiceResponse<Agent | null>> {
    try {
      const data = await db.agent.findUnique({ where: { id }, select });
      if (!data) return { success: false, error: 'agent.service.error.not_found' };

      const filtered = await HookSystem.filter('agent.read', data);

      return { success: true, data: filtered };
    } catch (error) {
      console.error('Agent get Error:', error);
      return { success: false, error: 'agent.service.error.get_failed' };
    }
  }

  public static async create(
    data: Prisma.AgentCreateInput,
    select?: Prisma.AgentSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Agent>> {
    try {
      const input = await HookSystem.filter('agent.beforeCreate', data);

      const newItem = await db.$transaction(async (tx) => {
        const created = await tx.agent.create({ data: input as Prisma.AgentCreateInput, select });
        await HookSystem.dispatch('agent.created', {
          id: created.id,
          actorId: 'system',
        });
        return created;
      });

      const filtered = await HookSystem.filter('agent.read', newItem);

      return { success: true, data: filtered };
    } catch (error) {
      console.error('Agent create Error:', error);
      return { success: false, error: 'agent.service.error.create_failed' };
    }
  }

  public static async update(
    id: string,
    data: Prisma.AgentUpdateInput,
    select?: Prisma.AgentSelect,
    actor?: ApiActor,
  ): Promise<ServiceResponse<Agent>> {
    try {
      const input = await HookSystem.filter('agent.beforeUpdate', data);

      const updatedItem = await db.$transaction(async (tx) => {
        const updated = await tx.agent.update({
          where: { id },
          data: input as Prisma.AgentUpdateInput,
          select,
        });
        await HookSystem.dispatch('agent.updated', {
          id,
          changes: Object.keys(input),
        });
        return updated;
      });

      const filtered = await HookSystem.filter('agent.read', updatedItem);

      return { success: true, data: filtered };
    } catch (error) {
      console.error('Agent update Error:', error);
      return { success: false, error: 'agent.service.error.update_failed' };
    }
  }

  public static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      await db.$transaction(async (tx) => {
        await tx.agent.delete({ where: { id } });
        await HookSystem.dispatch('agent.deleted', { id });
      });
      return { success: true };
    } catch (error) {
      console.error('Agent delete Error:', error);
      return { success: false, error: 'agent.service.error.delete_failed' };
    }
  }
}
