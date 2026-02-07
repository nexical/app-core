// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource } from '@nexical/sdk/core';
import type { Agent, RegisterAgentDTO, HeartbeatDTO } from './types.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for Agent. */
export class AgentSDK extends BaseResource {
  public async list(params?: {
    search?: string;
    take?: number;
    skip?: number;
    orderBy?: string | Record<string, 'asc' | 'desc'>;
    filters?: Record<string, unknown>;
  }): Promise<{ success: boolean; data: Agent[]; error?: string; meta: { total: number } }> {
    let orderBy = params?.orderBy;
    if (orderBy && typeof orderBy === 'object') {
      const keys = Object.keys(orderBy);
      if (keys.length > 0) {
        orderBy = `${keys[0]}:${orderBy[keys[0]]}`;
      }
    }
    const query = this.buildQuery({
      ...params?.filters,
      search: params?.search,
      take: params?.take,
      skip: params?.skip,
      orderBy,
    });
    return this._request('GET', `/agent${query}`);
  }

  public async get(id: string): Promise<{ success: boolean; data: Agent; error?: string }> {
    return this._request('GET', `/agent/${id}`);
  }

  public async create(
    data: Partial<Agent>,
  ): Promise<{ success: boolean; data: Agent; error?: string }> {
    return this._request('POST', `/agent`, data);
  }

  public async update(
    id: string,
    data: Partial<Agent>,
  ): Promise<{ success: boolean; data: Agent; error?: string }> {
    return this._request('PUT', `/agent/${id}`, data);
  }

  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return this._request('DELETE', `/agent/${id}`);
  }

  public async registerAgent(
    data: RegisterAgentDTO,
  ): Promise<{ success: boolean; data: Agent; error?: string }> {
    return this._request('POST', `/agent/register`, data);
  }

  public async heartbeat(
    id: string,
    data: HeartbeatDTO,
  ): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('POST', `/agent/${id}/heartbeat`, data);
  }
}
