/* eslint-disable */
import { TestServer } from './server';

export class ApiClient {
  private cookies: Map<string, string> = new Map();
  private bearerToken: string | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || TestServer.getUrl() || 'http://localhost:4322';
  }

  /**
   * Authenticate as a specific actor type using registered providers.
   * e.g. client.as('user', { role: 'ADMIN' })
   */
  async as(provider: string, params: any = {}): Promise<any> {
    const { Registry } = await import('./actor-registry');
    const actorProvider = await Registry.getProvider(provider);
    return actorProvider(this, params);
  }

  private headers: Record<string, string> = {};

  /**
   * Set a Bearer token for subsequent requests.
   */
  useToken(token: string): this {
    this.bearerToken = token;
    return this;
  }

  /**
   * Set a generic header for subsequent requests.
   */
  useHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Clear generic headers.
   */
  clearHeaders(): this {
    this.headers = {};
    return this;
  }

  /**
   * Clear token and use session cookies.
   */
  useSession(): this {
    this.bearerToken = null;
    return this;
  }

  /**
   * Clear all authentication state (cookies and tokens).
   */
  clearAuth(): this {
    this.cookies.clear();
    this.bearerToken = null;
    this.headers = {};
    return this;
  }

  /**
   * Make an HTTP request with session persistence and token support.
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    body?: any,
  ): Promise<{ status: number; body: T; headers: Headers }> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const headers: HeadersInit = { ...this.headers };

    // 1. Bearer Token
    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    // 2. Cookies
    const cookieHeader = Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

    headers['Origin'] = this.baseUrl;

    const DEBUG = process.env.DEBUG === 'true';

    if (cookieHeader && DEBUG) {
      console.log(`[ApiClient] Sending Cookies: ${cookieHeader}`);
      headers['Cookie'] = cookieHeader;
    } else if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    if (!this.bearerToken && !cookieHeader && DEBUG) {
      console.log(`[ApiClient] No authentication (token or cookies) to send.`);
    }

    const options: RequestInit = {
      method,
      headers,
      redirect: 'manual',
    };

    if (body) {
      if (body instanceof URLSearchParams) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    // Capture cookies
    let setCookies: string[] = [];
    // @ts-ignore
    if (typeof response.headers.getSetCookie === 'function') {
      setCookies = response.headers.getSetCookie();
    } else {
      const sc = response.headers.get('set-cookie');
      if (sc) setCookies = [sc];
    }

    for (const sc of setCookies) {
      if (DEBUG) console.log(`[ApiClient] Received Set-Cookie: ${sc.split(';')[0]}`);
      const firstPart = sc.split(';')[0];
      const eqIndex = firstPart.indexOf('=');
      if (eqIndex > 0) {
        const key = firstPart.substring(0, eqIndex).trim();
        const value = firstPart.substring(eqIndex + 1).trim();
        this.cookies.set(key, value);
      }
    }

    // Handle manual redirect
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (location) {
        if (DEBUG) console.log(`[ApiClient] Following redirect to ${location}`);
        const nextMethod = response.status === 307 || response.status === 308 ? method : 'GET';
        return this.request(nextMethod, location);
      }
    }

    let resBody: T;
    let text = '';
    try {
      text = await response.text();
      if (!text || text.trim() === '') {
        resBody = {} as T;
      } else {
        resBody = JSON.parse(text);
      }
    } catch (e) {
      if (DEBUG)
        console.log(
          `[ApiClient] JSON Parse Error for ${url}. Response starts with: ${text.substring(0, 500)}`,
        );
      resBody = {} as T;
    }

    if (response.status >= 500) {
      console.error(`[ApiClient] Server Error (${response.status}) for ${method} ${url}`);
      console.error(`[ApiClient] Response Body:`, JSON.stringify(resBody, null, 2));
    }

    return {
      status: response.status,
      body: resBody,
      headers: response.headers,
    };
  }

  async get<T = any>(path: string) {
    return this.request<T>('GET', path);
  }

  async post<T = any>(path: string, body?: any) {
    return this.request<T>('POST', path, body);
  }

  async put<T = any>(path: string, body?: any) {
    return this.request<T>('PUT', path, body);
  }

  async delete<T = any>(path: string) {
    return this.request<T>('DELETE', path);
  }

  getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }
}
