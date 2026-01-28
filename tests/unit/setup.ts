import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock Astro virtual modules
vi.mock('astro:actions', () => ({
    actions: new Proxy({}, {
        get: () => ({
            safe: vi.fn(),
            then: vi.fn(),
        })
    })
}));

vi.mock('astro:middleware', () => ({
    defineMiddleware: vi.fn((handler) => handler),
    sequence: vi.fn((...handlers) => handlers[0]),
}));

// Automatically cleanup after each test to prevent memory leaks and state pollution
afterEach(() => {
    cleanup();
});
