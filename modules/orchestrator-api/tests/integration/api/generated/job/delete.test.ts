// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Job API - Delete', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // DELETE /api/job/[id]
  describe('DELETE /api/job/[id]', () => {
    it('should delete job', async () => {
      const actor = await client.as('user', {});

      const target = await Factory.create('job', {
        ...{ type: 'type_test', progress: 10, retryCount: 10, maxRetries: 10 },
        actorId: actor.id,
        actorType: 'user',
      });

      const res = await client.delete(`/api/job/${target.id}`);

      expect(res.status).toBe(200);

      const check = await Factory.prisma.job.findUnique({ where: { id: target.id } });
      expect(check).toBeNull();
    });
  });
});
