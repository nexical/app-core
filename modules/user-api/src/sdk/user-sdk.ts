import { BaseResource } from '@nexical/sdk-core';
import type {
  User,
  UpdateUserDTO,
  PersonalAccessToken,
  CreateTokenDTO,
  CreateTokenResponseDTO,
} from './types';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for User. */
export class UserSDK extends BaseResource {
  public async list(params?: {
    search?: string;
    take?: number;
    skip?: number;
    orderBy?: string | Record<string, 'asc' | 'desc'>;
    filters?: Record<string, unknown>;
  }): Promise<{ success: boolean; data: User[]; error?: string; meta: { total: number } }> {
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
    return this._request('GET', `/user${query}`);
  }

  public async get(id: string): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('GET', `/user/${id}`);
  }

  public async create(
    data: Partial<User>,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('POST', `/user`, data);
  }

  public async update(
    id: string,
    data: Partial<User>,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('PUT', `/user/${id}`, data);
  }

  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return this._request('DELETE', `/user/${id}`);
  }

  public async getMe(): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('GET', `/user/me`);
  }

  public async updateMe(
    data: UpdateUserDTO,
  ): Promise<{ success: boolean; data: User; error?: string }> {
    return this._request('PUT', `/user/me`, data);
  }

  public async deleteMe(): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('DELETE', `/user/me`);
  }

  public async listTokens(): Promise<{
    success: boolean;
    data: PersonalAccessToken[];
    error?: string;
  }> {
    return this._request('GET', `/user/me/tokens`);
  }

  public async createToken(
    data: CreateTokenDTO,
  ): Promise<{ success: boolean; data: CreateTokenResponseDTO; error?: string }> {
    return this._request('POST', `/user/me/tokens`, data);
  }

  public async deleteToken(id: string): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('DELETE', `/user/me/tokens/${id}`);
  }
}
