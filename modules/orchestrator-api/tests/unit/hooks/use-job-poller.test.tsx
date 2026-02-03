import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJobPoller } from '../../../src/hooks/use-job-poller';
import { api } from '@/lib/api/api';

vi.mock('@/lib/api/api', () => ({
  api: {
    orchestrator: {
      job: {
        get: vi.fn(),
      },
    },
  },
}));

describe('useJobPoller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should start with LOADING status', () => {
    const { result } = renderHook(() => useJobPoller('j1'));
    expect(result.current.status).toBe('LOADING');
  });

  it('should fetch and update status to COMPLETED', async () => {
    vi.mocked(api.orchestrator.job.get).mockResolvedValue({
      status: 'COMPLETED',
      result: 'ok',
    } as never);

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('COMPLETED'), { timeout: 3000 });
    expect(result.current.data).toBe('ok');
  });

  it('should handle FAILED status', async () => {
    vi.mocked(api.orchestrator.job.get).mockResolvedValue({
      status: 'FAILED',
      error: 'boom',
    } as never);

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('FAILED'), { timeout: 3000 });
    expect(result.current.error).toBe('boom');
  });

  it('should handle fetch errors', async () => {
    vi.mocked(api.orchestrator.job.get).mockRejectedValue(new Error('api fail'));

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('FAILED'), { timeout: 3000 });
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should handle null jobId', () => {
    const { result } = renderHook(() => useJobPoller(null));
    expect(result.current.status).toBe('LOADING');
    expect(api.orchestrator.job.get).not.toHaveBeenCalled();
  });

  it('should handle job not found', async () => {
    vi.mocked(api.orchestrator.job.get).mockResolvedValue(null as never);

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('FAILED'), { timeout: 3000 });
    expect(result.current.error).toBe('Job not found');
  });
});
