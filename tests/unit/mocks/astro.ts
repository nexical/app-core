import { vi } from 'vitest';
import { z } from 'zod';

export { z };

export const defineMiddleware = vi.fn((handler) => handler);
export const sequence = vi.fn((...handlers) => handlers[0]);

export const actions = new Proxy({}, {
    get: () => ({
        safe: vi.fn(),
        then: vi.fn(),
    })
});
