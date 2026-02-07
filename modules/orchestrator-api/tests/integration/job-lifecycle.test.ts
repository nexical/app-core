import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { db } from '@/lib/core/db';
import type { User } from '@prisma/client';

describe('Job Lifecycle & State', () => {
  let client: ApiClient;
  let user: User;

  beforeEach(async () => {
    client = new ApiClient();
    user = await Factory.create('user');
  });

  it('creates a job with valid payload', async () => {
    await client.as('user', user);
    const response = await client.post('/api/job', {
      type: 'render-video',
      payload: { frame: 1 },
      actorId: user.id, // Explicitly sending, middleware should validate
      actorType: 'user',
    });

    // Check if creation endpoint exists OR if we rely on generic create.
    // api.yaml didn't explicity show a "create job" endpoint in the provided snippets?
    // Let's check api.yaml again. I missed checking strictly if there IS a create endpoint.
    // If not, I'll assume we're testing the "Orchestrator" or "Job" endpoints that might support creation.
    // Wait, the client usage in the provided `AgentClient` used `client.orchestrator.job.create`.
    // So the endpoint MUST exist.

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.status).toBe('PENDING');
    expect(response.body.data.actorId).toBe(user.id);
  });

  it('prevents acting as another user during creation', async () => {
    const otherUser = await Factory.create('user');
    await client.as('user', user);
    const response = await client.post('/api/job', {
      type: 'hack',
      payload: {},
      actorId: otherUser.id, // Try to create for someone else
      actorType: 'user',
    });

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(201);
    expect(response.body.error).toMatch(/Forbidden/);
  });

  it('cancels a pending job', async () => {
    const job = await db.job.create({
      data: {
        type: 'cancel-me',
        payload: {},
        actorId: user.id,
        actorType: 'user',
        status: 'PENDING',
      },
    });

    await client.as('user', user);
    const response = await client.post(`/api/job/${job.id}/cancel`, {});
    expect(response.status).toBe(200);

    const refreshed = await db.job.findUnique({ where: { id: job.id } });
    expect(refreshed?.status).toBe('CANCELLED');
  });

  it('cannot cancel a completed job', async () => {
    const job = await db.job.create({
      data: {
        type: 'done-job',
        payload: {},
        actorId: user.id,
        actorType: 'user',
        status: 'COMPLETED',
      },
    });

    await client.as('user', user);
    const response = await client.post(`/api/job/${job.id}/cancel`, {});
    expect(response.status).not.toBe(200);
    // Service layer should error: 'orchestrator.service.error.job_not_cancellable'
  });
});
