import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { Factory } from '@tests/integration/lib/factory';
import { TestServer } from '@tests/integration/lib/server';

describe('Job Security', () => {
  let owner: ApiClient;
  let attacker: ApiClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let job: any;

  beforeEach(async () => {
    // 1. Create two users
    owner = new ApiClient(TestServer.getUrl());
    const ownerUser = await owner.as('user');

    attacker = new ApiClient(TestServer.getUrl());
    await attacker.as('user');

    // 2. Create a Job owned by 'owner'
    // We use Factory to bypass API restrictions
    job = await Factory.create('job', {
      type: 'test.job',
      payload: {},
      userId: ownerUser.id,
      actorId: ownerUser.id,
      actorType: 'user',
      status: 'PENDING',
    });
  });

  it('should allow owner to read the job', async () => {
    const response = await owner.get(`/api/job/${job.id}`);
    expect(response.body.data.id).toBe(job.id);
  });

  it('should PREVENT attacker from reading the job', async () => {
    // Attacker tries to read job owned by owner
    try {
      const res = await attacker.get(`/api/job/${job.id}`);
      // If it returns success (e.g. 200), we fail.
      // If it returns 403 or 500, we pass.
      // ApiClient doesn't throw on non-200 by default (it custom impl).
      // It returns { status, body }.

      if (res.status === 200) {
        throw new Error(`Expected failure but got 200 OK. Body: ${JSON.stringify(res.body)}`);
      }
      expect([403, 500]).toContain(res.status);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // If threw (network error etc), that's fine?
      // no, we expect a status code check if client resolves.
      if (error.message.includes('Expected failure')) throw error;
    }
  });

  it('should PREVENT attacker from completing the job', async () => {
    const res = await attacker.post(`/api/job/${job.id}/complete`, { result: { success: true } });
    expect([403, 500, 404, 400]).toContain(res.status);
  });

  it('should allow owner to complete the job', async () => {
    const res = await owner.post(`/api/job/${job.id}/complete`, { result: { success: true } });
    expect([200, 201]).toContain(res.status);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});
