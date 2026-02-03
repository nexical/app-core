import { vi, describe, it, expect, beforeEach } from 'vitest';
import { init } from '../../../src/hooks/job-hooks';
import { HookSystem } from '@/lib/modules/hooks';

describe('job hooks', () => {
  beforeEach(async () => {
    // We don't clear listeners if not possible,
    // instead we will capture the handlers by re-initializing and using spy
    // Actually, simpler: we check the behavior by triggering events.
    await init();
  });

  describe('jobLog.created', () => {
    it('should dispatch job.log.error if level is ERROR', async () => {
      const dispatchSpy = vi.spyOn(HookSystem, 'dispatch');
      // Trigger the actual handler
      await HookSystem.dispatch('jobLog.created', { level: 'ERROR', message: 'fail' });

      // Look for the specific call we want
      const hasEscalated = dispatchSpy.mock.calls.some((call) => call[0] === 'job.log.error');
      expect(hasEscalated).toBe(true);
    });
  });

  describe('job.beforeCreate', () => {
    it('should sanitize input and set defaults', async () => {
      const input = { type: 'TEST', result: 'hacked', error: 'hacked', lockedBy: 'me' };
      const result = await HookSystem.filter('job.beforeCreate', input);

      expect(result.status).toBe('PENDING');
      expect(result.progress).toBe(0);
      expect(result.result).toBeUndefined();
    });

    it('should assign ownership from actor', async () => {
      const input = { type: 'TEST' };
      const actor = { id: 'u1', type: 'user' };
      const result = await HookSystem.filter('job.beforeCreate', input, { actor });

      expect(result.actorId).toBe('u1');
      expect(result.actorType).toBe('user');
    });
  });

  describe('job.beforeList', () => {
    it('should filter by actorId for non-admins', async () => {
      const params = { where: {} };
      const context = { actor: { id: 'u1', role: 'USER' } };
      const result = await HookSystem.filter('job.beforeList', params, context);

      expect(result.where.OR).toBeDefined();
    });
  });

  describe('job.beforeUpdate', () => {
    it('should protect critical fields', async () => {
      const input = { id: 'hack', status: 'COMPLETED' };
      const result = await HookSystem.filter('job.beforeUpdate', input);

      expect(result.id).toBeUndefined();
      expect(result.status).toBeUndefined();
    });
  });

  describe('job.read', () => {
    it('should return the job as is', async () => {
      const job = { id: 'j1' };
      const result = await HookSystem.filter('job.read', job);
      expect(result).toEqual(job);
    });
  });
});
