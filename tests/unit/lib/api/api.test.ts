import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use a hoisted spy so it's available in vi.mock
const { constructorSpy } = vi.hoisted(() => ({
    constructorSpy: vi.fn()
}));

vi.mock('@nexical/sdk', () => ({
    NexicalClient: vi.fn().mockImplementation(function (this: any, config: any) {
        constructorSpy(config);
        this.config = config;
    })
}));

describe('api client', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        delete (globalThis as any).window;
    });

    it('should initialize with server-side baseUrl', async () => {
        process.env.PUBLIC_SITE_URL = 'https://mysite.com';

        await import('@/lib/api/api');

        expect(constructorSpy).toHaveBeenCalledWith({
            baseUrl: 'https://mysite.com/api'
        });
    });

    it('should initialize with browser-side baseUrl', async () => {
        (globalThis as any).window = { api: null } as any;

        await import('@/lib/api/api');

        expect(constructorSpy).toHaveBeenCalledWith({
            baseUrl: '/api'
        });
        expect((globalThis as any).window.api).toBeDefined();

        delete (globalThis as any).window;
    });
});
