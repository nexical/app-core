import { describe, it, expect } from 'vitest';
import { GET } from '../../../../src/pages/api/status';

import type { APIContext } from 'astro';

describe('API Status Endpoint', () => {
  it('returns OK response', async () => {
    const response = await GET({} as unknown as APIContext);
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe('OK');
    expect(response.status).toBe(200);
  });
});
