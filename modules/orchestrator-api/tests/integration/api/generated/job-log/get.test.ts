import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('JobLog API - Get', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/job-log/[id]
  describe('GET /api/job-log/[id]', () => {
    it('should retrieve a specific jobLog', async () => {
      const actor = await client.as('team', {});

      const job_0 = await Factory.create('job', {
        actorId: typeof actor !== 'undefined' ? actor.id : undefined,
      });
      const target = await Factory.create('jobLog', {
        ...{ level: 'level_test', message: 'message_test', timestamp: new Date().toISOString() },
        job: { connect: { id: job_0.id } },
      });

      const res = await client.get(`/api/job-log/${target.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(target.id);
    });

    it('should return 404 for missing id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});
      const res = await client.get('/api/job-log/missing-id-123');
      expect(res.status).toBe(404);
    });
  });
});
