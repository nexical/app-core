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

// Automatically cleanup after each test to prevent memory leaks and state pollution
afterEach(() => {
    cleanup();
});
