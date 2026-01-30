/**
 * SDK: src/sdk/__entity__-sdk.ts
 * Type-safe client for the __Entity__ resource.
 */
import { BaseResource } from '@nexical/sdk-core';
import type { __Entity__ } from '@prisma/client';

export class __Entity__SDK extends BaseResource {
  /**
   * List all resources
   */
  async list() {
    return this.request<__Entity__[]>('GET', '/__resource__');
  }

  /**
   * Create a resource
   */
  async create(data: { name: string }) {
    return this.request<__Entity__>('POST', '/__resource__', data);
  }
}
