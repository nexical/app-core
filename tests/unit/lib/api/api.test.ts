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
  });

  it('should initialize with server-side baseUrl from env', async () => {
    vi.stubEnv('PUBLIC_API_URL', 'http://test.com/api');
    // @ts-ignore
    global.window = undefined;
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('http://test.com/api');
  });

  it('should use default if env is missing', async () => {
    vi.stubEnv('PUBLIC_API_URL', 'http://localhost:4321/api');
    // @ts-ignore
    global.window = undefined;
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('http://localhost:4321/api');
  });
});

describe('api client browser initialization', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should initialize with /api baseUrl in browser', async () => {
    vi.stubEnv('PUBLIC_API_URL', 'http://should-not-be-used.com/api');
    // @ts-ignore
    global.window = { location: { origin: 'http://localhost' } };
    const { api } = await import('@/lib/api/api');
    expect(api.options.baseUrl).toBe('/api');
    expect((global.window as any).api).toBe(api);
    // @ts-ignore
    global.window = undefined;
  });
});
