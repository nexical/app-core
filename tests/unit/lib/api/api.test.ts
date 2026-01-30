/* eslint-disable */
/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock NexicalClient
vi.mock('@nexical/sdk', () => ({
  NexicalClient: class {
    options: any;
    constructor(options: any) {
      this.options = options;
    }
  },
}));

describe('api client initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_SITE_URL', 'http://test.com');
  });

  it('should initialize with server-side baseUrl from env', async () => {
    // @ts-ignore
    global.window = undefined;
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('http://test.com/api');
  });

  it('should use localhost default if env is missing', async () => {
    vi.stubEnv('PUBLIC_SITE_URL', '');
    // @ts-ignore
    global.window = undefined;
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('http://localhost:4321/api');
  });
});

describe('api client browser initialization', () => {
  it('should initialize with /api baseUrl in browser', async () => {
    vi.resetModules();
    // @ts-ignore
    global.window = { location: { origin: 'http://localhost' } };
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('/api');
    expect((global.window as any).api).toBe(api);
    // @ts-ignore
    global.window = undefined;
  });
});
