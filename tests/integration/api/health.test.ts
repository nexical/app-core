import { describe, it, expect } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';

describe('Health Check Integration', () => {
  it('should return 200 OK from status endpoint', async () => {
    const client = new ApiClient();
    const response = await client.get('/api/status');
    expect(response.status).toBe(200);
  });
});
