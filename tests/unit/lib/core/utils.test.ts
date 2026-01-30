import { describe, it, expect } from 'vitest';
import { cn } from '../../../../src/lib/core/utils';

describe('Core Utils: cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('should handle conditional classes', () => {
    const isTrue = !!1;
    const isFalse = !!0;
    expect(cn('a', isTrue && 'b', isFalse && 'c')).toBe('a b');
  });

  it('should handle tailwind conflict resolution', () => {
    // twMerge should prefer the later class
    expect(cn('p-2 p-4')).toBe('p-4');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  it('should handle undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });
});
