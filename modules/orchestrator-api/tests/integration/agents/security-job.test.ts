import { describe, beforeEach, beforeAll, afterAll, test, expect } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';

describe('Job Security Integration', () => {
  let clientA: ApiClient;
  let clientB: ApiClient;

  beforeAll(async () => {
    await TestServer.start();
  });

  beforeEach(async () => {
    clientA = new ApiClient();
    await clientA.as('user', { name: 'Team A' }); // User setup required if not autogen

    clientB = new ApiClient();
    await clientB.as('user', { name: 'Team B' });
  });

  afterAll(async () => {
    await TestServer.stop();
  });

  test('User can only see their own jobs (Validation of job.beforeList)', async () => {
    // Create Job for A
    const resA = await clientA.post('/api/job', {
      type: 'test.job',
      payload: { user: 'A' },
      status: 'PENDING',
    });
    const jobA = resA.body.data;

    // Create Job for B
    const resB = await clientB.post('/api/job', {
      type: 'test.job',
      payload: { user: 'B' },
      status: 'PENDING',
    });
    const jobB = resB.body.data;

    // List A
    const listA = await clientA.get('/api/job');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idsA = listA.body.data.map((j: any) => j.id);
    expect(idsA).toContain(jobA.id);
    expect(idsA).not.toContain(jobB.id);

    // List B
    const listB = await clientB.get('/api/job');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idsB = listB.body.data.map((j: any) => j.id);
    expect(idsB).toContain(jobB.id);
    expect(idsB).not.toContain(jobA.id);
  });

  test('User cannot spoof job status (Validation of job.beforeCreate)', async () => {
    const res = await clientA.post('/api/job', {
      type: 'test.hack',
      payload: {},
      status: 'COMPLETED', // Attempt to spoof
      result: { hacked: true },
    });

    const job = res.body.data;
    expect(job.status).toBe('PENDING'); // Hook should force PENDING
    expect(job.result).toBeNull(); // Hook should strip result
  });

  test('User cannot hijack job via update (Validation of job.beforeUpdate)', async () => {
    // Create honest job
    const res = await clientA.post('/api/job', {
      type: 'test.job',
      payload: {},
      status: 'PENDING',
    });
    const job = res.body.data;

    // Attempt to update status to COMPLETED
    await clientA.put(`/api/job/${job.id}`, {
      status: 'COMPLETED',
      result: { hacked: true },
    });

    // Hook should strip status update. Status remains PENDING.
    // Hook should strip status update. Status remains PENDING.
    const refetched = await clientA.get(`/api/job/${job.id}`);
    expect(refetched.body.data.status).toBe('PENDING');
  });
});
