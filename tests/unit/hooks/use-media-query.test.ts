/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaQuery } from '@/hooks/use-media-query';

describe('useMediaQuery', () => {
  const mockMatchMedia = (matches: boolean): MediaQueryList => {
    const listeners = new Set<(ev: MediaQueryListEvent) => void>();
    return {
      matches,
      media: '',
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn((type: string, listener: any) => {
        if (type === 'change') listeners.add(listener);
      }),
      removeEventListener: vi.fn((type: string, listener: any) => {
        if (type === 'change') listeners.delete(listener);
      }),
      dispatchEvent: vi.fn((event: Event) => {
        listeners.forEach((l) => l(event as MediaQueryListEvent));
        return true;
      }),
    } as unknown as MediaQueryList;
  };

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn());
  });

  it('should return the initial value from matchMedia', () => {
    vi.mocked(matchMedia).mockReturnValue(mockMatchMedia(true));
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('should update value when media query changes', () => {
    const mml = mockMatchMedia(false);
    vi.mocked(matchMedia).mockReturnValue(mml);

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    act(() => {
      (mml as any).matches = true;
      mml.dispatchEvent({ matches: true } as unknown as Event);
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup listener on unmount', () => {
    const mml = mockMatchMedia(false);
    vi.mocked(matchMedia).mockReturnValue(mml);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(mml.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mml.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
