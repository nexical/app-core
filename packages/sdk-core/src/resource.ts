import { ApiClient } from './client';

export abstract class BaseResource {
  constructor(protected client: ApiClient) {}

  protected _request<T>(
    method: string,
    path: string,
    body?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.client.request<T>(method, path, body, options);
  }

  protected buildQuery(filters: Record<string, any> = {}): string {
    const params = new URLSearchParams();

    const process = (prefix: string, obj: any) => {
      for (const key in obj) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}__${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          process(fullKey, value);
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
