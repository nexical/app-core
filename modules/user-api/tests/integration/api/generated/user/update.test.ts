// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('User API - Update', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // PUT /api/user/[id]
  describe('PUT /api/user/[id]', () => {
    it('should update user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const updatePayload = {
        username: 'username_updated',
        email: 'email_updated',
        passwordUpdatedAt: new Date().toISOString(),
        emailVerified: new Date().toISOString(),
        name: 'name_updated',
        image: 'image_updated',
      };

      const res = await client.put(`/api/user/${target.id}`, updatePayload);

      expect(res.status).toBe(200);

      const updated = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(updated?.username).toBe(updatePayload.username);
      expect(updated?.email).toBe(updatePayload.email);
      expect(updated?.passwordUpdatedAt.toISOString()).toBe(updatePayload.passwordUpdatedAt); // Compare as ISO strings
      expect(updated?.emailVerified.toISOString()).toBe(updatePayload.emailVerified); // Compare as ISO strings
      expect(updated?.name).toBe(updatePayload.name);
      expect(updated?.image).toBe(updatePayload.image);
    });
  });
});
describe('User API - Update', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // PUT /api/user/[id]
  describe('PUT /api/user/[id]', () => {
    it('should update user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const updatePayload = {
        username: 'username_updated',
        email: 'email_updated',
        passwordUpdatedAt: new Date().toISOString(),
        emailVerified: new Date().toISOString(),
        name: 'name_updated',
        image: 'image_updated',
      };

      const res = await client.put(`/api/user/${target.id}`, updatePayload);

      expect(res.status).toBe(200);

      const updated = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(updated?.username).toBe(updatePayload.username);
      expect(updated?.email).toBe(updatePayload.email);
      expect(updated?.passwordUpdatedAt.toISOString()).toBe(updatePayload.passwordUpdatedAt); // Compare as ISO strings
      expect(updated?.emailVerified.toISOString()).toBe(updatePayload.emailVerified); // Compare as ISO strings
      expect(updated?.name).toBe(updatePayload.name);
      expect(updated?.image).toBe(updatePayload.image);
    });
  });
});
describe('User API - Update', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // PUT /api/user/[id]
  describe('PUT /api/user/[id]', () => {
    it('should update user', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = actor;

      const updatePayload = {
        username: 'username_updated',
        email: 'email_updated',
        passwordUpdatedAt: new Date().toISOString(),
        emailVerified: new Date().toISOString(),
        name: 'name_updated',
        image: 'image_updated',
      };

      const res = await client.put(`/api/user/${target.id}`, updatePayload);

      expect(res.status).toBe(200);

      const updated = await Factory.prisma.user.findUnique({ where: { id: target.id } });
      expect(updated?.username).toBe(updatePayload.username);
      expect(updated?.email).toBe(updatePayload.email);
      expect(updated?.passwordUpdatedAt.toISOString()).toBe(updatePayload.passwordUpdatedAt); // Compare as ISO strings
      expect(updated?.emailVerified.toISOString()).toBe(updatePayload.emailVerified); // Compare as ISO strings
      expect(updated?.name).toBe(updatePayload.name);
      expect(updated?.image).toBe(updatePayload.image);
    });
  });
});
