/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShellContext } from '@/hooks/use-shell-context';

describe('useShellContext', () => {
  const initialNavData = { projectId: 'test-p' };

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1200);
    vi.stubGlobal('innerHeight', 800);
    // Explicitly set location for URL consistency
    vi.stubGlobal('location', { href: 'http://localhost/' });
  });

  it('should initialize with window values on client', () => {
    const { result } = renderHook(() => useShellContext(initialNavData));

    expect(result.current.navData).toEqual(initialNavData);
    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(800);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.url.href).toBe('http://localhost/');
  });

  it('should update context on window resize', () => {
    const { result } = renderHook(() => useShellContext(initialNavData));

    act(() => {
      vi.stubGlobal('innerWidth', 800);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(800);
    expect(result.current.isMobile).toBe(true); // < 1024
  });

  it('should update context on popstate', () => {
    const { result } = renderHook(() => useShellContext(initialNavData));

    act(() => {
      vi.stubGlobal('location', { href: 'http://localhost/new-page' });
      window.dispatchEvent(new Event('popstate'));
    });

    expect(result.current.url.href).toBe('http://localhost/new-page');
  });

  it('should cleanup listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useShellContext(initialNavData));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });
});
