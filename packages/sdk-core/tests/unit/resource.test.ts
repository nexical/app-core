import { describe, it, expect, vi } from 'vitest';
import { BaseResource } from '../../src/resource.ts';
import { ApiClient } from '../../src/client.ts';

class TestResource extends BaseResource {
  public async testRequest<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this._request<T>(method, path, body, options);
  }

  public testBuildQuery(filters: Record<string, unknown>): string {
    return this.buildQuery(filters);
  }
}

describe('BaseResource', () => {
  const mockClient = {
    request: vi.fn(),
  } as unknown as ApiClient;

  const resource = new TestResource(mockClient);

  it('should delegate request to ApiClient', async () => {
    const mockData = { success: true };
    vi.mocked(mockClient.request).mockResolvedValueOnce(mockData);

    const result = await resource.testRequest('GET', '/test', { foo: 'bar' });

    expect(mockClient.request).toHaveBeenCalledWith('GET', '/test', { foo: 'bar' }, undefined);
    expect(result).toEqual(mockData);
  });

  describe('buildQuery', () => {
    it('should return empty string for empty filters', () => {
      expect(resource.testBuildQuery({})).toBe('');
    });

    it('should build simple query string', () => {
      expect(resource.testBuildQuery({ foo: 'bar', baz: 123 })).toBe('?foo=bar&baz=123');
    });

    it('should handle nested objects with double underscores', () => {
      expect(
        resource.testBuildQuery({
          user: {
            name: 'John',
            profile: {
              age: 30,
            },
          },
          active: true,
        }),
      ).toBe('?user__name=John&user__profile__age=30&active=true');
    });

    it('should ignore null and undefined values', () => {
      expect(
        resource.testBuildQuery({
          foo: 'bar',
          baz: null,
          qux: undefined,
          empty: '',
        }),
      ).toBe('?foo=bar&empty=');
    });

    it('should handle arrays', () => {
      expect(
        resource.testBuildQuery({
          tags: ['a', 'b', 'c'],
        }),
      ).toBe('?tags=a%2Cb%2Cc');
    });

    it('should handle complex mixed objects', () => {
      const filters = {
        where: {
          status: 'active',
          type: 'user',
        },
        orderBy: 'createdAt',
        limit: 10,
      };
      const expected = '?where__status=active&where__type=user&orderBy=createdAt&limit=10';
      expect(resource.testBuildQuery(filters)).toBe(expected);
    });
  });
});
