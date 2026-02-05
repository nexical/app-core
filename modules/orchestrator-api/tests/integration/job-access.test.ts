import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { TestServer } from '@tests/integration/lib/server';
import { db } from '@/lib/core/db';
import type { User, Job } from '@prisma/client';

describe('Job Access Control (RBAC)', () => {
  let client: ApiClient;
  let userA: User;
  let userB: User;
  let jobA: Job;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
    // Create two distinct users
    userA = await Factory.create('user');
    userB = await Factory.create('user');

    // Create job before each test to ensure fresh data
    jobA = await db.job.create({
      data: {
        type: 'test-job',
        payload: { foo: 'bar' },
        actorId: userA.id,
        actorType: 'user',
        status: 'PENDING',
      },
    });
  });

  it('User A can read their own job', async () => {
    await client.as('user', userA);
    const response = await client.get(`/api/job/${jobA.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(jobA.id);
  });

  it('User B CANNOT read User A job', async () => {
    await client.as('user', userB);
    const response = await client.get(`/api/job/${jobA.id}`);
    expect(response.status).toBe(403); // The policy throws Forbidden
    expect(response.body.error).toMatch(/Forbidden|Unauthorized/);
  });

  it('User B CANNOT cancel User A job', async () => {
    await client.as('user', userB);
    const response = await client.post(`/api/job/${jobA.id}/cancel`, {});
    expect(response.status).not.toBe(200);
    expect(response.body.error).toMatch(/Forbidden|Unauthorized/);
  });

  it('User B CANNOT complete User A job', async () => {
    await client.as('user', userB);
    const response = await client.post(`/api/job/${jobA.id}/complete`, {
      result: { success: true },
    });
    expect(response.status).not.toBe(200);
  });

  it('Admin can read User A job', async () => {
    const admin = await Factory.create('user', { role: 'ADMIN' });
    await client.as('user', admin);
    const response = await client.get(`/api/job/${jobA.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(jobA.id);
  });
});
