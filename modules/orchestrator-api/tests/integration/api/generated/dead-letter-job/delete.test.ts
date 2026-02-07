// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('DeadLetterJob API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/dead-letter-job/[id]
  describe('DELETE /api/dead-letter-job/[id]', () => {
    it('should delete deadLetterJob', async () => {
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

      const res = await client.delete(`/api/dead-letter-job/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.deadLetterJob.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
