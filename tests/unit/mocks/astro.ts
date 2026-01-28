import { vi } from 'vitest';

export const defineMiddleware = vi.fn((handler) => handler);
export const sequence = vi.fn((...handlers) => handlers[0]);

export const actions = new Proxy({}, {
    get: () => ({
        safe: vi.fn(),
        then: vi.fn(),
    })
});
