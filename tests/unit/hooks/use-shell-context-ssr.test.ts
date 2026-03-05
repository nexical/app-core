/** @vitest-environment node */
import { describe, it, expect, vi } from 'vitest';
import { useShellContext } from '@/hooks/use-shell-context';

// Mock React hooks since we're in node environment and can't use renderHook easily
vi.mock('react', () => ({
  useState: (init: unknown) => [typeof init === 'function' ? init() : init, vi.fn()],
  useEffect: vi.fn(),
}));

describe('useShellContext (SSR)', () => {
  const initialNavData = { projectId: 'test-p' };

  it('should initialize with SSR defaults when window is undefined', () => {
    // In node environment, window should be undefined
    expect(typeof window).toBe('undefined');

    const result = useShellContext(initialNavData);

    expect(result.navData).toEqual(initialNavData);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
    expect(result.isMobile).toBe(false);
    expect(result.url.hostname).toBe('localhost');
  });
});
