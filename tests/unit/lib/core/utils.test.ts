import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/core/utils';

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
    });

    it('should handle conditional class names', () => {
        expect(cn('btn', true && 'active', false && 'hidden')).toBe('btn active');
    });

    it('should merge tailwind classes using twMerge', () => {
        // twMerge should resolve 'px-2 px-4' to 'px-4'
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle arrays and objects', () => {
        expect(cn(['btn', 'active'], { 'hidden': false, 'visible': true })).toBe('btn active visible');
    });

    it('should handle undefined and null', () => {
        expect(cn('btn', undefined, null)).toBe('btn');
    });
});
