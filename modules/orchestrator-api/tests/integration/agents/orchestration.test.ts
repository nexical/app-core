import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@tests/integration/lib/client';
import { TestServer } from '@tests/integration/lib/server';
import { AgentRunner } from '../lib/agent-runner';

describe('Orchestration Flow', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  it('should handle the full job lifecycle (Success)', async () => {
    // 1. Authenticate as Admin
    await client.as('user', { role: 'ADMIN' });

    // 2. Create a Job
    const createRes = await client.post('/api/job', {
      type: 'test.job',
      payload: { foo: 'bar' },
    });
    expect(createRes.status).toBe(201);
    const jobId = createRes.body.data.id;

    // 3. Poll for the Job
    const pollRes = await client.post('/api/orchestrator/poll', {
      capabilities: ['test.job'],
      agentId: 'test-agent',
    });
    expect(pollRes.status).toBe(200);
    expect(pollRes.body.data).toHaveLength(1);
    expect(pollRes.body.data[0].id).toBe(jobId);

    // 4. Complete the Job
    const completeRes = await client.post(`/api/job/${jobId}/complete`, {
      result: { success: true },
    });
    expect(completeRes.status).toBe(200);

    // 5. Verify Job Status
    const getRes = await client.get(`/api/job/${jobId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.status).toBe('COMPLETED');
    expect(getRes.body.data.result).toEqual({ success: true });
  });

  it('should handle the full job lifecycle (Failure)', async () => {
    // 1. Authenticate
    await client.as('user', { role: 'ADMIN' });

    // 2. Create a Job
    const createRes = await client.post('/api/job', {
      type: 'fail.job',
      payload: { secret: 42 },
      maxRetries: 0,
    });
    const jobId = createRes.body.data.id;

    // 3. Poll
    const pollRes = await client.post('/api/orchestrator/poll', {
      capabilities: ['fail.job'],
    });
    expect(pollRes.body.data[0].id).toBe(jobId);

    // 4. Fail the Job
    const failRes = await client.post(`/api/job/${jobId}/fail`, {
      error: { message: 'Boom' },
    });
    expect(failRes.status).toBe(200);

    // 5. Verify
    const getRes = await client.get(`/api/job/${jobId}`);
    expect(getRes.body.data.status).toBe('FAILED');
    expect(getRes.body.data.error).toEqual({ message: 'Boom' });
  });

  it('should work with AgentRunner utility', async () => {
    // This test demonstrates the usage of the ported AgentRunner
    await client.as('user', { role: 'ADMIN' });

    const createRes = await client.post('/api/job', {
      type: 'agent.run',
      payload: { x: 1 },
    });
    const jobId = createRes.body.data.id;

    const mockWorker = {
      jobType: 'agent.run',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async (job: any, context: any) => {
        // Emulate work
        await context.api.orchestrator.job.completeJob(job.id, { result: { y: 2 } });
      },
    };

    // Run the agent worker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AgentRunner.run(mockWorker as any, jobId, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      agentToken: (client as any).bearerToken,
      baseUrl: TestServer.getUrl() + '/api',
    });

    // Verify status
    const getRes = await client.get(`/api/job/${jobId}`);
    expect(getRes.body.data.status).toBe('COMPLETED');
    expect(getRes.body.data.result).toEqual({ y: 2 });
  });
});
