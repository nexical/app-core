import { describe, it, expect } from 'vitest';
import * as index from '../../src/index.ts';
import { ApiClient, NexicalError } from '../../src/client.ts';
import { BaseResource } from '../../src/resource.ts';

describe('index', () => {
  it('should export client and resource', () => {
    expect(index.ApiClient).toBe(ApiClient);
    expect(index.NexicalError).toBe(NexicalError);
    expect(index.BaseResource).toBe(BaseResource);
  });
});
