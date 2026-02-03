import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('UserUi API - Get', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/user-ui/[id]
  describe('GET /api/user-ui/[id]', () => {
    it('should retrieve a specific userUi', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      const target = await Factory.create('userUi', { ...{} });

      const res = await client.get(`/api/user-ui/${target.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(target.id);
    });

    it('should return 404 for missing id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});
      const res = await client.get('/api/user-ui/missing-id-123');
      expect(res.status).toBe(404);
    });
  });
});
