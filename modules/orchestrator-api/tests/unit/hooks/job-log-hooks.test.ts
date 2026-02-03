import { vi, describe, it, expect, beforeEach } from 'vitest';
import { init } from '../../../src/hooks/job-log-hooks';
import { HookSystem } from '@/lib/modules/hooks';
import { db } from '@/lib/core/db';

vi.mock('@/lib/core/db', () => ({
  db: {
    jobLog: {
      findUnique: vi.fn(),
    },
  },
}));

describe('job log hooks', () => {
  beforeEach(async () => {
    (HookSystem as unknown).listeners.clear();
    await init();
    vi.clearAllMocks();
  });

  it('should dispatch job.log.error if fetched log level is ERROR', async () => {
    (db.jobLog.findUnique as unknown).mockResolvedValue({
      id: 'l1',
      level: 'ERROR',
      message: 'fail',
    });
    const dispatchSpy = vi.spyOn(HookSystem, 'dispatch');

    await HookSystem.dispatch('jobLog.created', { id: 'l1', actorId: 'system' });

    // We need to wait for the async listener to finish.
    // Since HookSystem.dispatch doesn't wait for all async listeners if they aren't awaited in its loop (it usually is)
    // Actually, HookSystem.dispatch in nexical usually awaits.

    expect(db.jobLog.findUnique).toHaveBeenCalledWith({ where: { id: 'l1' } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      'job.log.error',
      expect.objectContaining({ level: 'ERROR' }),
    );
  });

  it('should NOT dispatch job.log.error if fetched log level is NOT ERROR', async () => {
    (db.jobLog.findUnique as unknown).mockResolvedValue({ id: 'l1', level: 'INFO' });
    const dispatchSpy = vi.spyOn(HookSystem, 'dispatch');

    await HookSystem.dispatch('jobLog.created', { id: 'l1' });

    expect(dispatchSpy).not.toHaveBeenCalledWith('job.log.error', expect.anything());
  });

  it('should handle log not found', async () => {
    (db.jobLog.findUnique as unknown).mockResolvedValue(null);
    const dispatchSpy = vi.spyOn(HookSystem, 'dispatch');

    await HookSystem.dispatch('jobLog.created', { id: 'l1' });

    expect(dispatchSpy).not.toHaveBeenCalledWith('job.log.error', expect.anything());
  });
});
