// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('DeadLetterJob API - List', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/dead-letter-job
  describe('GET /api/dead-letter-job', () => {
    const baseData = {
      originalJobId: 'originalJobId_test',
      type: 'type_test',
      failedAt: new Date().toISOString(),
      retryCount: 10,
    };

    it('should allow admin to list deadLetterJobs', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      // Cleanup first to ensure clean state
      await Factory.prisma.deadLetterJob.deleteMany();

      // Seed data
      const _listSuffix = Date.now();
      await Factory.create('deadLetterJob', { ...baseData, actorId: actor.id, actorType: 'user' });
      await Factory.create('deadLetterJob', { ...baseData, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/dead-letter-job');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
    });

    it('should verify pagination metadata', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      // Cleanup and seed specific count
      await Factory.prisma.deadLetterJob.deleteMany();

      const _suffix = Date.now();
      const createdIds: string[] = [];
      const totalTarget = 15;

      // Check current count

      const _listSuffix = Date.now();
      const currentCount = 0;
      const toCreate = totalTarget - currentCount;

      for (let i = 0; i < toCreate; i++) {
        const rec = await Factory.create('deadLetterJob', {
          ...baseData,
          actorId: actor.id,
          actorType: 'user',
        });
        createdIds.push(rec.id);
      }

      // Page 1
      const res1 = await client.get('/api/dead-letter-job?take=5&skip=0');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(5);
      expect(res1.body.meta.total).toBe(15);

      // Page 2
      const res2 = await client.get('/api/dead-letter-job?take=5&skip=5');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(5);
      expect(res2.body.data[0].id).not.toBe(res1.body.data[0].id);
    });

    it('should filter by originalJobId', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      const actor = await client.as('user', { role: 'ADMIN' });

      const val1 = 'originalJobId_' + Date.now() + '_A';
      const val2 = 'originalJobId_' + Date.now() + '_B';

      const data1 = { ...baseData, originalJobId: val1 };
      const data2 = { ...baseData, originalJobId: val2 };

      await Factory.create('deadLetterJob', { ...data1, actorId: actor.id, actorType: 'user' });
      await Factory.create('deadLetterJob', { ...data2, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/dead-letter-job?originalJobId=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].originalJobId).toBe(val1);
    });

    it('should filter by type', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      const actor = await client.as('user', { role: 'ADMIN' });

      const val1 = 'type_' + Date.now() + '_A';
      const val2 = 'type_' + Date.now() + '_B';

      const data1 = { ...baseData, type: val1 };
      const data2 = { ...baseData, type: val2 };

      await Factory.create('deadLetterJob', { ...data1, actorId: actor.id, actorType: 'user' });
      await Factory.create('deadLetterJob', { ...data2, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/dead-letter-job?type=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe(val1);
    });

    it('should filter by reason', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      const actor = await client.as('user', { role: 'ADMIN' });

      const val1 = 'reason_' + Date.now() + '_A';
      const val2 = 'reason_' + Date.now() + '_B';

      const data1 = { ...baseData, reason: val1 };
      const data2 = { ...baseData, reason: val2 };

      await Factory.create('deadLetterJob', { ...data1, actorId: actor.id, actorType: 'user' });
      await Factory.create('deadLetterJob', { ...data2, actorId: actor.id, actorType: 'user' });

      const res = await client.get('/api/dead-letter-job?reason=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].reason).toBe(val1);
    });
  });
});
