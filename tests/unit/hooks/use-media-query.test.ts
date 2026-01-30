/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaQuery } from '@/hooks/use-media-query';

describe('useMediaQuery', () => {
  const mockMatchMedia = (matches: boolean) => {
    const listeners = new Set<(ev: MediaQueryListEvent) => void>();
    return {
      matches,
      media: '',
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn((type, listener) => {
        if (type === 'change') listeners.add(listener);
      }),
      removeEventListener: vi.fn((type, listener) => {
        if (type === 'change') listeners.delete(listener);
      }),
      dispatchEvent: vi.fn((event) => {
        listeners.forEach((l) => l(event));
        return true;
      }),
    };
  };

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn());
  });

  it('should return the initial value from matchMedia', () => {
    vi.mocked(matchMedia).mockReturnValue(mockMatchMedia(true) as any);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('should update value when media query changes', () => {
    const mml = mockMatchMedia(false);
    vi.mocked(matchMedia).mockReturnValue(mml as any);

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    act(() => {
      mml.matches = true;
      mml.dispatchEvent({ matches: true } as any);
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup listener on unmount', () => {
    const mml = mockMatchMedia(false);
    vi.mocked(matchMedia).mockReturnValue(mml as any);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(mml.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mml.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
