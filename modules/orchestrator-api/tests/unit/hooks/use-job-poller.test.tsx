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
    (api.orchestrator.job.get as unknown).mockResolvedValue({ status: 'COMPLETED', result: 'ok' });

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('COMPLETED'), { timeout: 3000 });
    expect(result.current.data).toBe('ok');
  });

  it('should handle FAILED status', async () => {
    (api.orchestrator.job.get as unknown).mockResolvedValue({ status: 'FAILED', error: 'boom' });

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('FAILED'), { timeout: 3000 });
    expect(result.current.error).toBe('boom');
  });

  it('should handle fetch errors', async () => {
    (api.orchestrator.job.get as unknown).mockRejectedValue(new Error('api fail'));

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
    (api.orchestrator.job.get as unknown).mockResolvedValue(null);

    const { result } = renderHook(() => useJobPoller('j1'));

    await waitFor(() => expect(result.current.status).toBe('FAILED'), { timeout: 3000 });
    expect(result.current.error).toBe('Job not found');
  });
});
