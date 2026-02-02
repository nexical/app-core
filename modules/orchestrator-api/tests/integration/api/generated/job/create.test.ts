// GENERATED CODE - DO NOT MODIFY
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Job API - Create', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/job
  describe('POST /api/job', () => {
    it('should allow job-owner to create job', async () => {
      const actor = await client.as('team', {});

      const payload = {
        ...{ type: 'type_test', progress: 10 },
        actorId: actor ? actor.id : undefined,
      };

      const res = await client.post('/api/job', payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();

      expect(res.body.data.type).toBe(payload.type);
      expect(res.body.data.progress).toBe(payload.progress);

      const created = await Factory.prisma.job.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it('should forbid non-admin/unauthorized users', async () => {
      client.useToken('invalid-token');

      const actor = undefined as unknown;

      const payload = {
        ...{ type: 'type_test', progress: 10 },
        actorId: actor ? actor.id : undefined,
      };
      const res = await client.post('/api/job', payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
