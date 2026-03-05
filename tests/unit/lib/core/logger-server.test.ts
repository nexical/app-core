/** @vitest-environment node */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { withLogContext, getLogContext, Logger } from '@/lib/core/logger';

describe('Logger (Node/Server)', () => {
  beforeAll(async () => {
    // In node environment, window should be undefined
    expect(typeof window).toBe('undefined');
  });

  it('should use AsyncLocalStorage for context propagation on server', async () => {
    const context = { correlationId: 'node-cor' };

    vi.spyOn(console, 'info').mockImplementation(() => {});

    await withLogContext(context, async () => {
      const store = getLogContext();
      expect(store).toEqual(context);

      Logger.info('node message');
      const call = vi.mocked(console.info).mock.calls[0][0] as string;
      expect(JSON.parse(call)).toMatchObject(context);
    });
  });

  it('should handle nested contexts on server', async () => {
    await withLogContext({ a: 1 }, () => {
      expect(getLogContext()).toEqual({ a: 1 });
      withLogContext({ b: 2 }, () => {
        expect(getLogContext()).toEqual({ a: 1, b: 2 });
      });
      expect(getLogContext()).toEqual({ a: 1 });
    });
  });
});
