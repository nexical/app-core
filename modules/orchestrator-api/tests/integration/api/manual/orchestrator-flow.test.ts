import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '../../../../../../tests/integration/lib/client';
import { Factory } from '../../../../../../tests/integration/lib/factory';
import { TestServer } from '../../../../../../tests/integration/lib/server';

describe('Orchestrator Flow Integration', () => {
  let client: ApiClient;

  beforeEach(async () => {
    client = new ApiClient(TestServer.getUrl());
  });

  it('should handle the full agent-orchestrator lifecycle', async () => {
    // 1. Register an Agent
    const registerRes = await client.post('/api/agent/register', {
      hostname: 'test-agent-flow',
      capabilities: ['test.task'],
    });
    if (registerRes.status !== 200) {
      console.error('Register failed:', JSON.stringify(registerRes.body, null, 2));
    }
    expect(registerRes.status).toBe(200);
    const agent = registerRes.body.data;
    expect(agent.id).toBeDefined();
    expect(agent.hostname).toBe('test-agent-flow');

    // 2. Heartbeat
    const heartbeatRes = await client.post(`/api/agent/${agent.id}/heartbeat`, {});
    expect(heartbeatRes.status).toBe(200);

    // 3. Create a Job (as a user)
    const userClient = new ApiClient(TestServer.getUrl());
    await userClient.as('user');
    const jobRes = await userClient.post('/api/job', {
      type: 'test.task',
      payload: { input: 'hello' },
    });
    expect(jobRes.status).toBe(201);
    const job = jobRes.body.data;
    console.info(`[Test DEBUG] Created job: ${job.id}`);

    // Wait for DB consistency (small delay)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Poll for Jobs (as an agent)
    await client.as('agent', { id: agent.id });
    console.info(`[Test DEBUG] Polling as agent: ${agent.id}`);
    const pollRes = await client.post('/api/orchestrator/poll', {
      agentId: agent.id,
      capabilities: ['test.task'],
    });
    console.info(
      `[Test DEBUG] Poll response status: ${pollRes.status}, data: ${JSON.stringify(pollRes.body.data)}`,
    );
    expect(pollRes.status).toBe(200);
    expect(pollRes.body.data).toHaveLength(1);
    expect(pollRes.body.data[0].id).toBe(job.id);
    expect(pollRes.body.data[0].status).toBe('RUNNING');

    // 5. Update Progress
    const progressRes = await client.post(`/api/job/${job.id}/progress`, {
      id: job.id,
      progress: 50,
    });
    expect(progressRes.status).toBe(200);

    // 6. Complete Job
    const completeRes = await client.post(`/api/job/${job.id}/complete`, {
      id: job.id,
      result: { output: 'world' },
    });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('COMPLETED');
    expect(completeRes.body.data.result).toEqual({ output: 'world' });
  });

  it('should handle job failure and retry', async () => {
    await client.as('agent');
    const agent = await client.as('agent');

    // Create a job with 1 max retry
    const job = await Factory.create('job', {
      type: 'test.retry',
      maxRetries: 1,
      retryCount: 0,
      status: 'PENDING',
      lockedBy: null,
      nextRetryAt: null,
    });

    // Poll for it
    const pollRes = await client.post('/api/orchestrator/poll', {
      agentId: agent.id,
      capabilities: ['test.retry'],
    });
    expect(pollRes.body.data[0].id).toBe(job.id);

    // Fail it
    const failRes = await client.post(`/api/job/${job.id}/fail`, {
      id: job.id,
      error: { message: 'first failure' },
    });
    expect(failRes.status).toBe(200);
    expect(failRes.body.data.status).toBe('PENDING'); // Should be back to PENDING for retry
    expect(failRes.body.data.retryCount).toBe(1);

    // Fail it again (exceed retries)
    // First must poll again because status was reset to PENDING
    // Wait for backoff (1s)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await client.post('/api/orchestrator/poll', {
      agentId: agent.id,
      capabilities: ['test.retry'],
    });

    const failRes2 = await client.post(`/api/job/${job.id}/fail`, {
      id: job.id,
      error: { message: 'second failure' },
    });
    expect(failRes2.status).toBe(200);
    expect(failRes2.body.data.status).toBe('FAILED');
    expect(failRes2.body.data.retryCount).toBe(2);
  });
});
