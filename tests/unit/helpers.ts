import { vi } from 'vitest';
import type { APIContext } from 'astro';

/**
 * Creates a mock Request object.
 */
export function createMockRequest(
  url: string = 'http://localhost:4321/',
  options: RequestInit = {},
): Request {
  return new Request(url, options);
}

/**
 * Creates a mock Astro context for middleware testing.
 */
export function createMockAstroContext(
  options: {
    url?: string;
    params?: Record<string, string | undefined>;
    locals?: Record<string, unknown>;
    cookies?: Record<string, string>;
  } = {},
): APIContext {
  const url = new URL(options.url || 'http://localhost:4321/');

  return {
    url,
    params: options.params || {},
    locals: options.locals || {},
    cookies: {
      get: vi.fn((name: string) => ({
        value: options.cookies?.[name] || '',
        json: () => JSON.parse(options.cookies?.[name] || '{}'),
        number: () => Number(options.cookies?.[name]),
        boolean: () => options.cookies?.[name] === 'true',
      })),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn((name: string) => !!options.cookies?.[name]),
      getAll: vi.fn(() => []),
    },
    redirect: vi.fn(),
    request: createMockRequest(url.toString()),
    site: undefined,
    generator: 'Astro',
    props: {},
    clientAddress: '127.0.0.1',
    isPrerendered: false,
    originPathname: url.pathname,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    self: {} as any, // Astro-internal, usually not needed for unit tests
    preferredLocale: undefined,
    preferredLocaleList: [],
    currentLocale: undefined,
    getLocaleByPath: vi.fn(),
    redirectToDefaultLocale: vi.fn(),
    rewrite: vi.fn(),
  } as unknown as APIContext;
}

/**
 * Creates a mock 'next' function for middleware testing.
 */
export function createMockNext() {
  return vi.fn(async () => new Response(null, { status: 200 }));
}
