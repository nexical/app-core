import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobExecutor } from '../../../src/runtime/executor.js';
import { z } from 'zod';
import { JobProcessor } from '../../../src/core/processor.js';

// Mock NexicalClient and AgentAuthStrategy
vi.mock('@nexical/sdk', () => ({
  NexicalClient: vi.fn().mockImplementation(class {}),
}));

vi.mock('../networking/auth.js', () => ({
  AgentAuthStrategy: vi.fn(),
}));

vi.mock('./logger.js', () => ({
  JobRemoteLogger: vi.fn(),
}));

class TestProcessor extends JobProcessor<any> {
  jobType = 'test.job';
  schema = z.object({ foo: z.string() });
  async process(job: any, context: any) {
    return { success: true, processed: job.payload.foo };
  }
}

describe('JobExecutor', () => {
  let executor: JobExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new JobExecutor({
      apiUrl: 'http://test-api',
      apiToken: 'test-token',
    });
  });

  it('should execute processor with validated payload', async () => {
    const processor = new TestProcessor({ apiUrl: 'http://test-api', apiToken: 'test-token' });
    const job = { id: 'job-1', type: 'test.job', payload: { foo: 'bar' } } as any;

    const result = await executor.execute(processor, job);

    expect(result).toEqual({ success: true, processed: 'bar' });
  });

  it('should throw error if payload validation fails', async () => {
    const processor = new TestProcessor({ apiUrl: 'http://test-api', apiToken: 'test-token' });
    const job = { id: 'job-1', type: 'test.job', payload: { foo: 123 } } as any;

    await expect(executor.execute(processor, job)).rejects.toThrow();
  });

  it('should return default success if processor returns nothing', async () => {
    class NoResultProcessor extends TestProcessor {
      async process() {
        return undefined as any;
      }
    }
    const processor = new NoResultProcessor({ apiUrl: 'http://test-api', apiToken: 'test-token' });
    const job = { id: 'job-1', type: 'test.job', payload: { foo: 'bar' } } as any;

    const result = await executor.execute(processor, job);
    expect(result).toEqual({ success: true });
  });
});
