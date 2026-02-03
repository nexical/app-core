import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('UserUi API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/user-ui/[id]
  describe('DELETE /api/user-ui/[id]', () => {
    it('should delete userUi', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      const target = await Factory.create('userUi', { ...{} });

      const res = await client.delete(`/api/user-ui/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.userUi.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
