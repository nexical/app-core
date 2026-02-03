// GENERATED CODE - DO NOT MODIFY BY HAND
import { BaseResource } from '@nexical/sdk-core';
import type { Job, CompleteJobDTO, FailJobDTO, CancelJobDTO, UpdateProgressDTO } from './types.js';

// GENERATED CODE - DO NOT MODIFY BY HAND
/** SDK client for Job. */
export class JobSDK extends BaseResource {
  public async list(params?: {
    search?: string;
    take?: number;
    skip?: number;
    orderBy?: string | Record<string, 'asc' | 'desc'>;
    filters?: Record<string, unknown>;
  }): Promise<{ success: boolean; data: Job[]; error?: string; meta: { total: number } }> {
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
    return this._request('GET', `/job${query}`);
  }

  public async get(id: string): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('GET', `/job/${id}`);
  }

  public async create(
    data: Partial<Job>,
  ): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('POST', `/job`, data);
  }

  public async update(
    id: string,
    data: Partial<Job>,
  ): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('PUT', `/job/${id}`, data);
  }

  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return this._request('DELETE', `/job/${id}`);
  }

  public async completeJob(
    id: string,
    data: CompleteJobDTO,
  ): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('POST', `/job/${id}/complete`, data);
  }

  public async failJob(
    id: string,
    data: FailJobDTO,
  ): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('POST', `/job/${id}/fail`, data);
  }

  public async cancelJob(
    id: string,
    data: CancelJobDTO,
  ): Promise<{ success: boolean; data: Job; error?: string }> {
    return this._request('POST', `/job/${id}/cancel`, data);
  }

  public async updateProgress(
    id: string,
    data: UpdateProgressDTO,
  ): Promise<{ success: boolean; data: void; error?: string }> {
    return this._request('POST', `/job/${id}/progress`, data);
  }
}
