/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequest } from '@/middleware';
import { getModuleMiddlewares } from '@/lib/registries/middleware-registry';
import { HookSystem } from '@/lib/modules/hooks';

import type { APIContext } from 'astro';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (
    cb: (context: APIContext, next: () => Promise<Response>) => Promise<Response>,
  ) => cb,
}));

vi.mock('@/lib/registries/middleware-registry', () => ({
  getModuleMiddlewares: vi.fn(),
}));

vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: vi.fn(),
  },
}));

vi.mock('@/lib/modules/module-init', () => ({
  initializeModules: vi.fn().mockResolvedValue(undefined),
}));

describe('Middleware', () => {
  // Generate a fresh response for each call
  const next = vi.fn().mockImplementation(() => Promise.resolve(new Response('next')));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should skip assets', async () => {
    const context = { url: new URL('http://localhost/style.css') } as APIContext;
    const response = (await onRequest(context, next)) as Response;
    expect(await response.text()).toBe('next');
    expect(getModuleMiddlewares).not.toHaveBeenCalled();
  });

  it('should allow public routes from modules', async () => {
    vi.mocked(getModuleMiddlewares).mockResolvedValue([{ publicRoutes: ['/public', '/docs/*'] }]);
    const context = { url: new URL('http://localhost/public') } as APIContext;
    const response = (await onRequest(context, next)) as Response;
    expect(await response.text()).toBe('next');
  });

  it('should handle wildcard public routes', async () => {
    vi.mocked(getModuleMiddlewares).mockResolvedValue([{ publicRoutes: ['/docs/*'] }]);
    const context = { url: new URL('http://localhost/docs/api') } as APIContext;
    const response = (await onRequest(context, next)) as Response;
    expect(await response.text()).toBe('next');
  });

  it('should execute module middlewares and stop if one returns a response', async () => {
    const mockResponse = new Response('intercepted');
    vi.mocked(getModuleMiddlewares).mockResolvedValue([
      { onRequest: async () => mockResponse },
      { onRequest: async () => new Response('should-not-run') },
    ]);

    const context = { url: new URL('http://localhost/private') } as unknown as APIContext;
    const response = (await onRequest(context, next)) as Response;
    expect(await response.text()).toBe('intercepted');
    expect(HookSystem.dispatch).toHaveBeenCalledWith('core.module.handled', expect.any(Object));
    expect(next).not.toHaveBeenCalled();
  });

  it('should continue to next if no module middleware returns a response', async () => {
    vi.mocked(getModuleMiddlewares).mockResolvedValue([{ onRequest: async () => undefined }]);
    const context = { url: new URL('http://localhost/private') } as unknown as APIContext;
    const response = (await onRequest(context, next)) as Response;
    expect(await response.text()).toBe('next');
  });
});
