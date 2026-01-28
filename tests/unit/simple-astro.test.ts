import { describe, it, expect } from 'vitest';
import { defineMiddleware } from 'astro:middleware';

describe('Astro Mock', () => {
    it('should have defineMiddleware', () => {
        expect(defineMiddleware).toBeDefined();
    });
});
