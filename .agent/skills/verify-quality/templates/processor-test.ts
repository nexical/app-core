import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyProcessor } from ' @modules/my-module/src/agent/my-processor';
import { MyService } from ' @modules/my-module/src/services/my-service';
import type { AgentJob, AgentContext } from ' @nexical/agent';

// Mock Dependencies - Agents MUST use Services, NEVER 'db'
vi.mock(' @modules/my-module/src/services/my-service', () => ({
  MyService: {
    processItem: vi.fn(),
  },
}));

describe('MyProcessor', () => {
  let processor: MyProcessor;
  let mockContext: AgentContext;

  beforeEach(() => {
    processor = new MyProcessor();
    mockContext = {
      log: vi.fn(),
      updateProgress: vi.fn(),
      signal: new AbortController().signal,
    } as unknown as AgentContext;
    vi.clearAllMocks();
  });

  it('should process job successfully using ServiceResponse', async () => {
    // Arrange
    const jobData = { itemId: '123', action: 'SYNC' };
    const mockJob = {
      id: 'job-1',
      data: jobData,
    } as unknown as AgentJob;

    (MyService.processItem as any).mockResolvedValue({
      success: true,
      data: { processed: true },
    });

    // Act - Codebase uses process(job, context)
    const result = await processor.process(mockJob, mockContext);

    // Assert
    expect(MyService.processItem).toHaveBeenCalledWith('123');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ processed: true });
  });

  it('should handle service failures gracefully', async () => {
    // Arrange
    const mockJob = {
      id: 'job-2',
      data: { itemId: 'error-id' },
    } as unknown as AgentJob;

    (MyService.processItem as any).mockResolvedValue({
      success: false,
      error: { message: 'Processing failed' },
    });

    // Act
    const result = await processor.process(mockJob, mockContext);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Processing failed');
  });
});
