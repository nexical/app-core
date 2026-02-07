import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { db } from '@/lib/core/db';
import type { User } from '@prisma/client';

describe('Agent Operations (Worker Flow)', () => {
  let client: ApiClient;
  let agentUser: User; // The user entity acting as the agent (e.g. token holder)

  beforeEach(async () => {
    client = new ApiClient();
    agentUser = await Factory.create('user', { role: 'ADMIN' });

    // Register agent first (via API or DB? Service layer is safer for checks)
    // But let's assume the agent just needs a record to exist for capability matching
    await db.agent.create({
      data: {
        id: agentUser.id, // Use same ID for simplicity in locking checks if logic assumes strict ID match
        hostname: 'test-worker-1',
        capabilities: ['render', 'email'],
        status: 'ONLINE',
      },
    });
  });

  it('polls for jobs and acquires a lock', async () => {
    // Create a pending job
    const job = await db.job.create({
      data: {
        type: 'render',
        payload: { video: 'test.mp4' },
        actorId: 'some-customer-id',
        actorType: 'user',
        status: 'PENDING',
      },
    });

    // Agent polls
    await client.as('user', agentUser);
    const response = await client.post('/api/orchestrator/poll', {
      capabilities: ['render'],
      agentId: agentUser.id, // Passing explicit agentId (must match actor.id or use "me" logic)
    });

    expect(response.status).toBe(200);
    const jobs = response.body.data;
    expect(response.status).toBe(200);
    expect(jobs[0].id).toBe(job.id);

    // Verify Lock
    const lockedJob = await db.job.findUnique({ where: { id: job.id } });
    expect(lockedJob?.status).toBe('RUNNING');
    expect(lockedJob?.lockedBy).toBe(agentUser.id);
  });

  it('updates progress on a locked job', async () => {
    // Setup a job locked by this agent
    const job = await db.job.create({
      data: {
        type: 'render',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: agentUser.id,
        startedAt: new Date(),
      },
    });

    await client.as('user', agentUser);
    const response = await client.post(`/api/job/${job.id}/progress`, {
      progress: 50,
    });

    expect(response.status).toBe(200);

    const updated = await db.job.findUnique({ where: { id: job.id } });
    expect(updated?.progress).toBe(50);
  });

  it('completes a job', async () => {
    const job = await db.job.create({
      data: {
        type: 'email',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: agentUser.id,
      },
    });

    await client.as('user', agentUser);
    const response = await client.post(`/api/job/${job.id}/complete`, {
      result: { sent: true },
    });

    expect(response.status).toBe(200);

    const completed = await db.job.findUnique({ where: { id: job.id } });
    expect(completed?.status).toBe('COMPLETED');
    expect((completed?.result as Record<string, unknown>).sent).toBe(true);
  });

  it('fails a job (triggering retry)', async () => {
    const job = await db.job.create({
      data: {
        type: 'flaky-task',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: agentUser.id,
        retryCount: 0,
        maxRetries: 3,
      },
    });

    await client.as('user', agentUser);
    const response = await client.post(`/api/job/${job.id}/fail`, {
      error: { message: 'Network blip' },
    });

    expect(response.status).toBe(200);

    const retrying = await db.job.findUnique({ where: { id: job.id } });
    expect(retrying?.status).toBe('PENDING'); // Reset for retry
    expect(retrying?.retryCount).toBe(1);
    expect(retrying?.lockedBy).toBeNull(); // Released lock
    expect(retrying?.nextRetryAt).not.toBeNull();
  });

  it('fails a job permanently after max retries', async () => {
    const job = await db.job.create({
      data: {
        type: 'doomed-task',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: agentUser.id,
        retryCount: 3,
        maxRetries: 3,
      },
    });

    await client.as('user', agentUser);
    const response = await client.post(`/api/job/${job.id}/fail`, {
      error: { message: 'Final blow' },
    });

    expect(response.status).toBe(200);

    const failed = await db.job.findUnique({ where: { id: job.id } });
    expect(failed?.status).toBe('FAILED');
  });

  it('Admin CAN override Agent B locked job', async () => {
    const otherAgent = await Factory.create('user');
    const job = await db.job.create({
      data: {
        type: 'render',
        payload: {},
        actorId: 'customer',
        actorType: 'user',
        status: 'RUNNING',
        lockedBy: otherAgent.id, // Locked by SOMEONE ELSE
      },
    });

    await client.as('user', agentUser);
    const response = await client.post(`/api/job/${job.id}/complete`, {
      result: {},
    });

    expect(response.status).toBe(200);
  });
});
