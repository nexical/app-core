// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Job API - List', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/job
  describe('GET /api/job', () => {
    const baseData = { type: 'type_test', progress: 10, retryCount: 10, maxRetries: 10 };

    it('should allow job-owner to list jobs', async () => {
      const actor = await client.as('user', {});

      // Seed data
      const _listSuffix = Date.now();
      await Factory.create('job', { ...baseData, actorId: actor.id, actorType: 'user' });
      await Factory.create('job', { ...baseData, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/job');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
    });

    it('should verify pagination metadata', async () => {
      const actor = await client.as('user', {});

      const _suffix = Date.now();
      const createdIds: string[] = [];
      const toCreate = 15;

      for (let i = 0; i < toCreate; i++) {
        const rec = await Factory.create('job', {
          ...baseData,
          actorId: actor.id,
          actorType: 'user',
        });
        createdIds.push(rec.id);
      }

      // Page 1
      const res1 = await client.get('/api/job?take=5&skip=0');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(5);
      expect(res1.body.meta.total).toBeGreaterThanOrEqual(15);

      // Page 2
      const res2 = await client.get('/api/job?take=5&skip=5');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(5);
      expect(res2.body.data[0].id).not.toBe(res1.body.data[0].id);
    });

    it('should filter by type', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      const actor = await client.as('user', {});

      const val1 = 'type_' + Date.now() + '_A';
      const val2 = 'type_' + Date.now() + '_B';

      const data1 = { ...baseData, type: val1 };
      const data2 = { ...baseData, type: val2 };

      await Factory.create('job', { ...data1, actorId: actor.id, actorType: 'user' });
      await Factory.create('job', { ...data2, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/job?type=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe(val1);
    });

    it('should filter by lockedBy', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      const actor = await client.as('user', {});

      const val1 = 'lockedBy_' + Date.now() + '_A';
      const val2 = 'lockedBy_' + Date.now() + '_B';

      const data1 = { ...baseData, lockedBy: val1 };
      const data2 = { ...baseData, lockedBy: val2 };

      await Factory.create('job', { ...data1, actorId: actor.id, actorType: 'user' });
      await Factory.create('job', { ...data2, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/job?lockedBy=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].lockedBy).toBe(val1);
    });
  });
});
