import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequest } from '@/middleware';
import { getModuleMiddlewares } from '@/lib/registries/middleware-registry';
import { HookSystem } from '@/lib/modules/hooks';
import { createMockAstroContext, createMockNext } from './helpers';

vi.mock('@/lib/registries/middleware-registry', () => ({
    getModuleMiddlewares: vi.fn()
}));

vi.mock('@/lib/modules/hooks', () => ({
    HookSystem: {
        dispatch: vi.fn()
    }
}));

vi.mock('@/lib/modules/module-init', () => ({
    initializeModules: vi.fn(() => Promise.resolve())
}));

describe('Core Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(onRequest).toBeDefined();
    });

    it('should skip middleware for assets', async () => {
        const context = createMockAstroContext({ url: 'http://localhost:4321/styles.css' });
        const next = createMockNext();

        await onRequest(context, next);

        expect(next).toHaveBeenCalled();
        expect(getModuleMiddlewares).not.toHaveBeenCalled();
    });

    it('should allow public routes from modules', async () => {
        const context = createMockAstroContext({ url: 'http://localhost:4321/public-page' });
        const next = createMockNext();

        (getModuleMiddlewares as any).mockResolvedValue([
            { publicRoutes: ['/public-page'] }
        ]);

        await onRequest(context, next);
        expect(next).toHaveBeenCalled();
    });

    it('should handle wildcard public routes', async () => {
        const context = createMockAstroContext({ url: 'http://localhost:4321/public/anything' });
        const next = createMockNext();

        (getModuleMiddlewares as any).mockResolvedValue([
            { publicRoutes: ['/public/*'] }
        ]);

        await onRequest(context, next);
        expect(next).toHaveBeenCalled();
    });

    it('should execute module middlewares in order', async () => {
        const context = createMockAstroContext({ url: 'http://localhost:4321/protected' });
        const next = createMockNext();

        const m1 = { onRequest: vi.fn() };
        const m2 = { onRequest: vi.fn() };
        (getModuleMiddlewares as any).mockResolvedValue([m1, m2]);

        await onRequest(context, next);

        expect(m1.onRequest).toHaveBeenCalled();
        expect(m2.onRequest).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it('should stop and return response if a module middleware returns one', async () => {
        const context = createMockAstroContext({ url: 'http://localhost:4321/protected' });
        const next = createMockNext();
        const response = new Response('Redirect', { status: 302 });

        const m1 = { onRequest: vi.fn(() => response) };
        const m2 = { onRequest: vi.fn() };
        (getModuleMiddlewares as any).mockResolvedValue([m1, m2]);

        const result = await onRequest(context, next);

        expect(m1.onRequest).toHaveBeenCalled();
        expect(m2.onRequest).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(result).toBe(response);
        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.module.handled', { path: '/protected' });
    });
});
