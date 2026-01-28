import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('HookSystem', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('should manage listeners correctly', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        const handler = vi.fn();

        HookSystem.on('test.event', handler);
        await HookSystem.dispatch('test.event', { foo: 'bar' });

        expect(handler).toHaveBeenCalledWith({ foo: 'bar' }, undefined);
    });

    it('should handle context in dispatch', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        const handler = vi.fn();

        HookSystem.on('test.event', handler);
        await HookSystem.dispatch('test.event', { data: 1 }, { ctx: 2 });

        expect(handler).toHaveBeenCalledWith({ data: 1 }, { ctx: 2 });
    });

    it('should handle errors in listeners during dispatch', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const goodHandler = vi.fn();
        const badHandler = () => { throw new Error('Boom'); };

        HookSystem.on('err.event', badHandler);
        HookSystem.on('err.event', goodHandler);

        await HookSystem.dispatch('err.event', {});

        expect(errorSpy).toHaveBeenCalled();
        expect(goodHandler).toHaveBeenCalled();
    });

    it('should support filters that modify data', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        HookSystem.on<number>('math.filter', (val) => val + 1);
        HookSystem.on<number>('math.filter', (val) => val * 2);

        const result = await HookSystem.filter('math.filter', 10);

        // (10 + 1) * 2 = 22
        expect(result).toBe(22);
    });

    it('should handle errors in filters', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        HookSystem.on<string>('text.filter', () => { throw new Error('Filter Fail'); });
        HookSystem.on<string>('text.filter', (val) => val + '!');

        const result = await HookSystem.filter('text.filter', 'hello');

        expect(errorSpy).toHaveBeenCalled();
        expect(result).toBe('hello!');
    });

    it('should return initial data if no filter listeners', async () => {
        const { HookSystem } = await import('@/lib/modules/hooks');
        const result = await HookSystem.filter('empty.filter', 'original');
        expect(result).toBe('original');
    });
});
