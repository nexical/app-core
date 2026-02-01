import { useState, useEffect } from 'react';
import { api } from '@/lib/api/api';
import type { Job } from '@modules/orchestrator-api/src/sdk/types';

export function useJobPoller<T = unknown>(
  jobId: string | null,
  options: { interval?: number } = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Job['status'] | 'LOADING'>('LOADING');
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    const intervalMs = options.interval || 2000;

    const fetchStatus = async () => {
      try {
        // Use the new SDK method from orchestrator-api
        const job = await api.orchestrator.job.get(jobId);

        if (!isMounted) return;

        if (job) {
          setStatus(job.status);

          if (job.status === 'COMPLETED') {
            setData(job.result as T);
          } else if (job.status === 'FAILED') {
            setError(job.error);
          }
        } else {
          setError('Job not found');
          setStatus('FAILED');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err);
        setStatus('FAILED');
      }
    };

    // Initial fetch
    fetchStatus();

    const intervalId = setInterval(() => {
      // Stop polling if done
      // Note: We check 'status' from closure state, which is stale in setInterval if not careful.
      // But React's dependency array includes [status], so this effect re-runs when status changes.
      // Wait, if effect re-runs, interval is reset. That is inefficient but correct for stopping.
      // Actually, we should check the LATEST status.
      // Better pattern: Check inside the fetch or use a ref.
      // But adhering to the previous implementation structure:
      if (status === 'COMPLETED' || status === 'FAILED') {
        clearInterval(intervalId);
        return;
      }
      fetchStatus();
    }, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [jobId, options.interval, status]);

  return { data, status, error };
}
