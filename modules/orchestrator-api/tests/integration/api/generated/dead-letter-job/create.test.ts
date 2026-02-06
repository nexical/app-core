// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('DeadLetterJob API - Create', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/dead-letter-job
  describe('POST /api/dead-letter-job', () => {
    it('should allow admin to create deadLetterJob', async () => {
      const actor = await client.as('user', { role: 'ADMIN' });

      const payload = {
        ...{
          originalJobId: 'originalJobId_test',
          type: 'type_test',
          failedAt: new Date().toISOString(),
          retryCount: 10,
        },
        actorId: actor ? (actor as { id: string }).id : undefined,
      };

      const res = await client.post('/api/dead-letter-job', payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();

      expect(res.body.data.originalJobId).toBe(payload.originalJobId);
      expect(res.body.data.type).toBe(payload.type);
      expect(res.body.data.failedAt).toBe(payload.failedAt); // API returns ISO string
      expect(res.body.data.retryCount).toBe(payload.retryCount);

      const created = await Factory.prisma.deadLetterJob.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it('should forbid non-admin/unauthorized users', async () => {
      client.useToken('invalid-token');

      const actor = undefined as unknown;

      const payload = {
        ...{
          originalJobId: 'originalJobId_test',
          type: 'type_test',
          failedAt: new Date().toISOString(),
          retryCount: 10,
        },
        actorId: actor ? (actor as { id: string }).id : undefined,
      };
      const res = await client.post('/api/dead-letter-job', payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
