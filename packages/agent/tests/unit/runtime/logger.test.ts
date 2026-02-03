import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobRemoteLogger } from '../../../src/runtime/logger.js';

const mockCreateLog = vi.fn();

vi.mock('@nexical/sdk', () => ({
  NexicalClient: vi.fn().mockImplementation(function (this: any) {
    this.orchestrator = {
      jobLog: {
        create: mockCreateLog,
      },
    };
  }),
}));

describe('JobRemoteLogger', () => {
  let logger: JobRemoteLogger;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      orchestrator: {
        jobLog: {
          create: mockCreateLog,
        },
      },
    } as any;
    logger = new JobRemoteLogger(mockClient, 'job-1');
  });

  it('should log info level', async () => {
    mockCreateLog.mockResolvedValue({});
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await logger.info('Hello', { key: 'val' });

    expect(consoleSpy).toHaveBeenCalledWith('[Job job-1] [INFO] Hello {"key":"val"}');
    expect(mockCreateLog).toHaveBeenCalledWith({
      jobId: 'job-1',
      level: 'INFO',
      message: 'Hello {"key":"val"}',
    });
  });

  it('should log warn level', async () => {
    mockCreateLog.mockResolvedValue({});
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await logger.warn('Be careful');

    expect(consoleSpy).toHaveBeenCalledWith('[Job job-1] [WARN] Be careful');
    expect(mockCreateLog).toHaveBeenCalledWith({
      jobId: 'job-1',
      level: 'WARN',
      message: 'Be careful',
    });
  });

  it('should log error level', async () => {
    mockCreateLog.mockResolvedValue({});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await logger.error('Boom');

    expect(consoleSpy).toHaveBeenCalledWith('[Job job-1] [ERROR] Boom');
    expect(mockCreateLog).toHaveBeenCalledWith({
      jobId: 'job-1',
      level: 'ERROR',
      message: 'Boom',
    });
  });

  it('should handle transmission failure', async () => {
    mockCreateLog.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await logger.info('Message');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[JobRemoteLogger] Failed to transmit log:',
      expect.any(Error),
    );
  });
});
