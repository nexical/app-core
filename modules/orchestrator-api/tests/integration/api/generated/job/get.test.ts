// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Job API - Get', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/job/[id]
  describe('GET /api/job/[id]', () => {
    it('should retrieve a specific job', async () => {
      const actor = await client.as('team', {});

      const target = await Factory.create('job', {
        ...{ type: 'type_test', progress: 10 },
        actorId: actor.id,
      });

      const res = await client.get(`/api/job/${target.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(target.id);
    });

    it('should return 404 for missing id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});
      const res = await client.get('/api/job/missing-id-123');
      expect(res.status).toBe(404);
    });
  });
});
