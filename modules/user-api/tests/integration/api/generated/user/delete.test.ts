// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('User API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/user/[id]
  describe('DELETE /api/user/[id]', () => {
    it('should delete user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const res = await client.delete(`/api/user/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
describe('User API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/user/[id]
  describe('DELETE /api/user/[id]', () => {
    it('should delete user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const res = await client.delete(`/api/user/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
describe('User API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/user/[id]
  describe('DELETE /api/user/[id]', () => {
    it('should delete user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const res = await client.delete(`/api/user/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
