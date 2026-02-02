// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('JobLog API - List', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/job-log
  describe('GET /api/job-log', () => {
    const baseData = {
      level: 'level_test',
      message: 'message_test',
      timestamp: new Date().toISOString(),
    };

    it('should allow job-owner to list jobLogs', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});

      // Cleanup first to ensure clean state
      await Factory.prisma.jobLog.deleteMany();

      // Seed data
      const _listSuffix = Date.now();
      await Factory.create('jobLog', { ...baseData });
      await Factory.create('jobLog', { ...baseData });

      const res = await client.get('/api/job-log');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
    });

    it('should verify pagination metadata', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});

      // Cleanup and seed specific count
      await Factory.prisma.jobLog.deleteMany();

      const _suffix = Date.now();
      const createdIds: string[] = [];
      const totalTarget = 15;

      // Check current count

      const _listSuffix = Date.now();
      const currentCount = 0;
      const toCreate = totalTarget - currentCount;

      for (let i = 0; i < toCreate; i++) {
        const rec = await Factory.create('jobLog', { ...baseData });
        createdIds.push(rec.id);
      }

      // Page 1
      const res1 = await client.get('/api/job-log?take=5&skip=0');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(5);
      expect(res1.body.meta.total).toBe(15);

      // Page 2
      const res2 = await client.get('/api/job-log?take=5&skip=5');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(5);
      expect(res2.body.data[0].id).not.toBe(res1.body.data[0].id);
    });

    it('should filter by level', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});

      const val1 = 'level_' + Date.now() + '_A';
      const val2 = 'level_' + Date.now() + '_B';

      const data1 = { ...baseData, level: val1 };
      const data2 = { ...baseData, level: val2 };

      await Factory.create('jobLog', { ...data1 });
      await Factory.create('jobLog', { ...data2 });

      const res = await client.get('/api/job-log?level=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].level).toBe(val1);
    });

    it('should filter by message', async () => {
      // Wait to avoid collisions
      await new Promise((r) => setTimeout(r, 10));
      // Reuse getActorStatement to ensure correct actor context
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});

      const val1 = 'message_' + Date.now() + '_A';
      const val2 = 'message_' + Date.now() + '_B';

      const data1 = { ...baseData, message: val1 };
      const data2 = { ...baseData, message: val2 };

      await Factory.create('jobLog', { ...data1 });
      await Factory.create('jobLog', { ...data2 });

      const res = await client.get('/api/job-log?message=' + val1);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].message).toBe(val1);
    });
  });
});
