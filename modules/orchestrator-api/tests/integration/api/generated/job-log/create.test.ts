// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('JobLog API - Create', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/job-log
  describe('POST /api/job-log', () => {
    it('should allow job-owner to create jobLog', async () => {
      const actor = await client.as('user', {});

      const job_0 = await Factory.create('job', {
        actorId: typeof actor !== 'undefined' ? actor.id : undefined,
        actorType: 'user',
      });
      const payload = {
        ...{ level: 'level_test', message: 'message_test', timestamp: new Date().toISOString() },
        jobId: job_0.id,
      };

      const res = await client.post('/api/job-log', payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();

      expect(res.body.data.level).toBe(payload.level);
      expect(res.body.data.message).toBe(payload.message);
      expect(res.body.data.timestamp).toBe(payload.timestamp); // API returns ISO string

      const created = await Factory.prisma.jobLog.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it('should forbid non-admin/unauthorized users', async () => {
      client.useToken('invalid-token');

      const actor = undefined as unknown;
      const job_0 = await Factory.create('job', {
        actorId: typeof actor !== 'undefined' ? actor.id : undefined,
        actorType: 'user',
      });
      const payload = {
        ...{ level: 'level_test', message: 'message_test', timestamp: new Date().toISOString() },
        jobId: job_0.id,
      };
      const res = await client.post('/api/job-log', payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
