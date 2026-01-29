/** @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { createConfig } from '../../../../src/lib/core/config';
import { z } from 'zod';

describe('config utilities (server/node)', () => {
    it('should NOT access window', () => {
        // In node env, window should be undefined
        const schema = z.object({ KEY: z.string().optional() });
        const config = createConfig(schema);
        expect(config).toEqual({});
        // Coverage should mark the 'window !== undefined' branch as taken (false path)
    });
});
