import { describe, it, expect, vi } from 'vitest';

vi.mock('node:async_hooks', () => {
  throw new Error('No async hooks');
});

describe('Logger Fallback', () => {
  it('should fallback to plain execution if AsyncLocalStorage fails (line 51)', async () => {
    // This will trigger the catch block in init() and leave this.instance as null
    const { withLogContext } = await import('../../../../src/lib/core/logger');

    let executed = false;
    withLogContext({ val: 1 }, () => {
      executed = true;
    });

    expect(executed).toBe(true);
  });
});
