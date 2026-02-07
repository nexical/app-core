import { HookSystem } from '@/lib/modules/hooks';
import { db } from '@/lib/core/db';

export async function init() {
  HookSystem.on('jobLog.created', async (payload: { id: string; actorId: string }) => {
    // We need to fetch the log details to check the level,
    // OR rely on the fact that this hook might receive the full object if configured.
    // The service dispatch passes { id, actorId }.
    // Ideally, we should update the service to pass the full object or fetch it.
    // However, looking at the service:
    // await HookSystem.dispatch('jobLog.created', { id: created.id, actorId: 'system' });

    // Wait, the legacy service implementation was:
    // if (data.level === 'ERROR') { await HookSystem.dispatch('job.log.error', log); }

    // The new service dispatches 'jobLog.created' generally.
    // We will need to fetch the log here.

    const log = await db.jobLog.findUnique({ where: { id: payload.id } });

    if (log && log.level === 'ERROR') {
      // Dispatch the legacy hook
      await HookSystem.dispatch('job.log.error', log);
    }
  });

  // Also listen for detailed event if available, or just use the generic one.
}
