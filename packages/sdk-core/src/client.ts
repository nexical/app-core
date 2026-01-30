/* eslint-disable */
export interface AuthStrategy {
  getHeaders(): Promise<Record<string, string>>;
}

export interface ApiClientOptions {
  baseUrl: string;
  authStrategy?: AuthStrategy;
}

export class NexicalError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
  ) {
    const message = data?.error || data?.message || statusText;
    super(message);
    this.name = 'NexicalError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private authStrategy?: AuthStrategy;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.authStrategy = options.authStrategy;
  }

  async request<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authStrategy) {
      const authHeaders = await this.authStrategy.getHeaders();
      Object.assign(headers, authHeaders);
    }

    const config: RequestInit = {
      method,
      ...options,
      headers,
    };

    if (!config.credentials) {
      config.credentials = 'include';
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, config);

    if (!response.ok) {
      let errorData;
      const text = await response.text();
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = text;
      }
      throw new NexicalError(response.status, response.statusText, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}
