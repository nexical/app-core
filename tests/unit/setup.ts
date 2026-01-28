import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically cleanup after each test to prevent memory leaks and state pollution
afterEach(() => {
    cleanup();
});
