import { ApiClient } from './client.js';

export abstract class BaseResource {
  constructor(protected client: ApiClient) {}

  protected _request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.client.request<T>(method, path, body, options);
  }

  protected buildQuery(filters: Record<string, unknown> = {}): string {
    const params = new URLSearchParams();

    const process = (prefix: string, obj: Record<string, unknown>) => {
      for (const key in obj) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}__${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          process(fullKey, value as Record<string, unknown>);
        } else if (value !== undefined && value !== null) {
          params.append(fullKey, String(value));
        }
      }
    };

    process('', filters);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }
}
