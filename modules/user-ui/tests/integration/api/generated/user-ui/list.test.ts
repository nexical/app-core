import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('UserUi API - List', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/user-ui
  describe('GET /api/user-ui', () => {
    const baseData = {};

    it('should allow member to list userUis', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      // Cleanup first to ensure clean state
      await Factory.prisma.userUi.deleteMany();

      // Seed data
      const _listSuffix = Date.now();
      await Factory.create('userUi', { ...baseData });
      await Factory.create('userUi', { ...baseData });

      const res = await client.get('/api/user-ui');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
    });

    it('should verify pagination metadata', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      // Cleanup and seed specific count
      await Factory.prisma.userUi.deleteMany();

      const _suffix = Date.now();
      const createdIds: string[] = [];
      const totalTarget = 15;

      // Check current count

      const _listSuffix = Date.now();
      const currentCount = 0;
      const toCreate = totalTarget - currentCount;

      for (let i = 0; i < toCreate; i++) {
        const rec = await Factory.create('userUi', { ...baseData });
        createdIds.push(rec.id);
      }

      // Page 1
      const res1 = await client.get('/api/user-ui?take=5&skip=0');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(5);
      expect(res1.body.meta.total).toBe(15);

      // Page 2
      const res2 = await client.get('/api/user-ui?take=5&skip=5');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(5);
      expect(res2.body.data[0].id).not.toBe(res1.body.data[0].id);
    });

    it('should filter by name', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', {});

      const val1 = 'name_' + Date.now() + '_A';
      const val2 = 'name_' + Date.now() + '_B';

      const data1 = { ...baseData, name: val1 };
      const data2 = { ...baseData, name: val2 };

      await Factory.create('userUi', { ...data1 });
      await Factory.create('userUi', { ...data2 });

      const res = await client.get('/api/user-ui?name=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe(val1);
    });
  });
});
