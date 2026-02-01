import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Job API - Update', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // PUT /api/job/[id]
  describe('PUT /api/job/[id]', () => {
    it('should update job', async () => {
      const actor = await client.as('team', {});

      const target = await Factory.create('job', {
        ...{ type: 'type_test', progress: 10 },
        actorId: actor.id,
      });

      const updatePayload = {
        type: 'type_updated',
        progress: 20,
      };

      const res = await client.put(`/api/job/${target.id}`, updatePayload);

      expect(res.status).toBe(200);

      const updated = await Factory.prisma.job.findUnique({ where: { id: target.id } });
      expect(updated?.type).toBe(updatePayload.type);
      expect(updated?.progress).toBe(updatePayload.progress);
    });
  });
});
