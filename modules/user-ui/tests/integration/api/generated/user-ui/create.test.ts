import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('UserUi API - Create', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/user-ui
  describe('POST /api/user-ui', () => {
    it('should allow member to create userUi', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      const payload = {};

      const res = await client.post('/api/user-ui', payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();

      const created = await Factory.prisma.userUi.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it('should forbid non-admin/unauthorized users', async () => {
      client.useToken('invalid-token');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = undefined as unknown;

      const payload = {};
      const res = await client.post('/api/user-ui', payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
