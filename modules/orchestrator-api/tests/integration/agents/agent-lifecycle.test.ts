import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import { AgentSpawner } from '../lib/agent-test-kit';
import { ApiClient } from '@tests/integration/lib/client';
import { db } from '@/lib/core/db';
import { TestServer } from '@tests/integration/lib/server';
import { Factory } from '@tests/integration/lib/factory';

describe('Agent Lifecycle Integration', () => {
  let spawner: AgentSpawner;
  let client: ApiClient;

  beforeAll(async () => {
    await TestServer.start();
    client = new ApiClient();
    // await client.as('team'); // Moved to test body

    // Ensure we have a clean state or at least known agent
    spawner = new AgentSpawner();
  }, 60000);

  afterAll(async () => {
    await spawner.stop();
    await TestServer.stop();
  });

  test('Agent spawned, polls, and completes a job', async () => {
    // Setup Client & Token (Moved here to survive global beforeEach clean)
    // Use ADMIN role for Agent execution to bypass job status/lock restrictions in hooks
    // (Since we are simulating an agent with a User token)
    await client.as('user', { role: 'ADMIN' });

    // Start Agent
    // Pass env vars to point to OUR test server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (client as any).bearerToken || 'test-secret';
    console.info('[DEBUG Test] Token sent to Agent:', token);

    // Wait for DB consistency/middleware availability
    await new Promise((r) => setTimeout(r, 1000));

    await spawner.start({
      env: {
        AGENT_API_URL: TestServer.getUrl() + '/api',
        AGENT_API_TOKEN: token,
        AGENT_CAPABILITIES: 'test.echo', // Force capability if supported
        AGENT_ID: 'test-agent-1',
      },
    });

    // Pre-seed agent to avoid DB visibility lag
    await Factory.create('agent', {
      id: 'test-agent-1',
      status: 'OFFLINE',
      lastHeartbeat: new Date(0),
    });

    // 2. Wait for Agent to come online
    let agentOnline = false;
    // Increase timeout to 15s (30 * 500ms) as ts-node startup can be slow
    for (let i = 0; i < 30; i++) {
      const agent = await db.agent.findUnique({ where: { id: 'test-agent-1' } });
      if (agent && agent.status === 'ONLINE') {
        agentOnline = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    expect(agentOnline).toBe(true);

    // 3. Create a Job
    const res = await client.post('/api/job', {
      type: 'test.echo', // Must match agent capability
      payload: { message: 'Hello World' },
      status: 'PENDING',
    });

    const job = res.body.data;
    expect(job.status).toBe('PENDING');

    // 4. Wait for Completion
    let jobCompleted = false;
    for (let i = 0; i < 20; i++) {
      const updated = await db.job.findUnique({ where: { id: job.id } });
      if (updated?.status === 'COMPLETED') {
        jobCompleted = true;
        break;
      }
      if (updated?.status === 'FAILED') {
        throw new Error(`Job failed: ${JSON.stringify(updated.error)}`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    expect(jobCompleted).toBe(true);
  }, 45000);
});
