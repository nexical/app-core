// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('DeadLetterJob API - Get', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // GET /api/dead-letter-job/[id]
  describe('GET /api/dead-letter-job/[id]', () => {
    it('should retrieve a specific deadLetterJob', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const target = await Factory.create('deadLetterJob', {
        ...{
          originalJobId: 'originalJobId_test',
          type: 'type_test',
          failedAt: new Date().toISOString(),
          retryCount: 10,
        },
        actorId: actor.id,
        actorType: 'user',
      });

      const res = await client.get(`/api/dead-letter-job/${target.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(target.id);
    });

    it('should return 404 for missing id', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('user', { role: 'ADMIN' });
      const res = await client.get('/api/dead-letter-job/missing-id-123');
      expect(res.status).toBe(404);
    });
  });
});
