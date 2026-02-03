import { BaseResource } from '@nexical/sdk-core';
import type { UserUi } from './types.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for UserUi. */
export class UserUiSDK extends BaseResource {
  public async list(params?: {
    search?: string;
    take?: number;
    skip?: number;
    orderBy?: string | Record<string, 'asc' | 'desc'>;
    filters?: Record<string, unknown>;
  }): Promise<{ success: boolean; data: UserUi[]; error?: string; meta: { total: number } }> {
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
    return this._request('GET', `/user-ui${query}`);
  }

  public async get(id: string): Promise<{ success: boolean; data: UserUi; error?: string }> {
    return this._request('GET', `/user-ui/${id}`);
  }

  public async create(
    data: Partial<UserUi>,
  ): Promise<{ success: boolean; data: UserUi; error?: string }> {
    return this._request('POST', `/user-ui`, data);
  }

  public async update(
    id: string,
    data: Partial<UserUi>,
  ): Promise<{ success: boolean; data: UserUi; error?: string }> {
    return this._request('PUT', `/user-ui/${id}`, data);
  }

  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return this._request('DELETE', `/user-ui/${id}`);
  }
}
