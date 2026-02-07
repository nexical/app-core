// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';

// GENERATED CODE - DO NOT MODIFY
describe('User API - Get', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/user/[id]
  describe('GET /api/user/[id]', () => {
    it('should retrieve a specific user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const res = await client.get(`/api/user/${target.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(target.id);
    });

    it('should return 404 for missing id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', { role: 'ADMIN' });
      const res = await client.get('/api/user/missing-id-123');
      expect(res.status).toBe(404);
    });
  });
});
