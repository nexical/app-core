import { vi } from 'vitest';

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
    locals?: Record<string, any>;
    cookies?: Record<string, any>;
  } = {},
) {
  const url = new URL(options.url || 'http://localhost:4321/');

  return {
    url,
    params: options.params || {},
    locals: options.locals || {},
    cookies: {
      get: vi.fn((name) => options.cookies?.[name]),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn((name) => !!options.cookies?.[name]),
    },
    redirect: vi.fn(),
    request: createMockRequest(url.toString()),
  } as any;
}

/**
 * Creates a mock 'next' function for middleware testing.
 */
export function createMockNext() {
  return vi.fn(async () => new Response(null, { status: 200 }));
}
