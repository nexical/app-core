import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { db } from '@/lib/core/db';
import type { User } from '@prisma/client';

describe('System Maintenance & Admin', () => {
  let client: ApiClient;
  let admin: User;
  let user: User;

  beforeEach(async () => {
    client = new ApiClient();
    admin = await Factory.create('user', { role: 'ADMIN' });
    user = await Factory.create('user', { role: 'EMPLOYEE' });
  });

  it('Admin can check stale agents', async () => {
    // Setup a stale agent
    const staleDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const staleAgent = await db.agent.create({
      data: {
        id: 'stale-one',
        hostname: 'ghost',
        status: 'ONLINE',
        lastHeartbeat: staleDate,
        capabilities: [],
      },
    });

    // Lock a job to this agent
    const lockedJob = await db.job.create({
      data: {
        type: 'job',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: staleAgent.id,
      },
    });

    await client.as('user', admin);
    const response = await client.post('/api/orchestrator/check-stale', {});
    expect(response.status).toBe(200);
    expect(response.body.data.offlineAgents).toBeGreaterThanOrEqual(1);
    expect(response.body.data.releasedJobs).toBeGreaterThanOrEqual(1);

    // Verify DB
    const refreshedAgent = await db.agent.findUnique({ where: { id: staleAgent.id } });
    expect(refreshedAgent?.status).toBe('OFFLINE');

    const refreshedJob = await db.job.findUnique({ where: { id: lockedJob.id } });
    expect(refreshedJob?.status).toBe('PENDING'); // Released
    expect(refreshedJob?.lockedBy).toBeNull();
  });

  it('Non-admin CANNOT check stale agents', async () => {
    await client.as('user', user);
    const response = await client.post('/api/orchestrator/check-stale', {});
    expect(response.status).not.toBe(200); // 403 or 500
  });

  it('Admin can view agent metrics', async () => {
    await client.as('user', admin);
    const response = await client.get('/api/metrics/agents');
    expect(response.status).toBe(200);
    // Expect basic metrics structure
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('online');
  });

  it('heartbeat updates agent status', async () => {
    // Setup an existing agent record for the 'user' acting as agent
    // Assuming user ID maps to agent ID for this test context or using a public endpoint
    const agentId = 'heartbeat-tester';
    await db.agent.create({
      data: {
        id: agentId,
        hostname: 'beater',
        status: 'OFFLINE',
        lastHeartbeat: new Date('2000-01-01'),
        capabilities: [],
      },
    });

    // Assuming heartbeat endpoint is public or token-based.
    // api.yaml says `role: public` for heartbeat.
    // It takes `input: HeartbeatDTO` which likely has `id` or infers from auth?
    // api.yaml: `path: /[id]/heartbeat`

    const response = await client.post(`/api/agent/${agentId}/heartbeat`, {});
    expect(response.status).toBe(200);

    const agent = await db.agent.findUnique({ where: { id: agentId } });
    expect(agent?.status).toBe('ONLINE');
    expect(agent?.lastHeartbeat.getTime()).toBeGreaterThan(Date.now() - 5000);
  });
});
