import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('UserUi API - Update', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // PUT /api/user-ui/[id]
  describe('PUT /api/user-ui/[id]', () => {
    it('should update userUi', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      const target = await Factory.create('userUi', { ...{} });

      const updatePayload = {
        name: 'name_updated',
      };

      const res = await client.put(`/api/user-ui/${target.id}`, updatePayload);

      expect(res.status).toBe(200);

      const updated = await Factory.prisma.userUi.findUnique({ where: { id: target.id } });
      expect(updated?.name).toBe(updatePayload.name);
    });
  });
});
