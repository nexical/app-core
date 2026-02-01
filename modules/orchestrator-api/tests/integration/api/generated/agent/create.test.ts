import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

// GENERATED CODE - DO NOT MODIFY
describe('Agent API - Create', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  // POST /api/agent
  describe('POST /api/agent', () => {
    it('should allow member to create agent', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = await client.as('team', {});

      const payload = {
        hostname: 'hostname_test',
        capabilities: ['capabilities_test'],
        lastHeartbeat: new Date().toISOString(),
      };

      const res = await client.post('/api/agent', payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();

      expect(res.body.data.hostname).toBe(payload.hostname);
      expect(res.body.data.capabilities).toStrictEqual(payload.capabilities);
      expect(res.body.data.lastHeartbeat).toBe(payload.lastHeartbeat); // API returns ISO string

      const created = await Factory.prisma.agent.findUnique({
        where: { id: res.body.data.id },
      });
      expect(created).toBeDefined();
    });

    it('should forbid non-admin/unauthorized users', async () => {
      client.useToken('invalid-token');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const actor = undefined as unknown;

      const payload = {
        hostname: 'hostname_test',
        capabilities: ['capabilities_test'],
        lastHeartbeat: new Date().toISOString(),
      };
      const res = await client.post('/api/agent', payload);
      expect([401, 403, 404]).toContain(res.status);
    });
  });
});
