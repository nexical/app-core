/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceLocator } from '@/lib/modules/service-locator';
import { HookSystem } from '@/lib/modules/hooks';

vi.mock('@/lib/modules/hooks', () => ({
    HookSystem: {
        dispatch: vi.fn(),
    },
}));

describe('ServiceLocator', () => {
    beforeEach(() => {
        // Clear private static services if possible, or just use different names
        // Since it's a static class, we can't easily reset it without a helper method.
        // But we can test it by using unique names.
        vi.clearAllMocks();
    });

    it('should provide and consume a service', () => {
        const mockService = { id: 1 };
        ServiceLocator.provide('TestService', mockService);

        expect(ServiceLocator.consume('TestService')).toBe(mockService);
        expect(ServiceLocator.tryConsume('TestService')).toBe(mockService);
        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.service.provided', { name: 'TestService' });
    });

    it('should warn when overwriting a service', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        ServiceLocator.provide('OverwriteService', { a: 1 });
        ServiceLocator.provide('OverwriteService', { a: 2 });

        expect(spy).toHaveBeenCalled();
        expect(ServiceLocator.consume('OverwriteService')).toEqual({ a: 2 });
        spy.mockRestore();
    });

    it('should throw error when consuming non-existent service', () => {
        expect(() => ServiceLocator.consume('NonExistent')).toThrow();
    });

    it('should return undefined when tryConsume non-existent service', () => {
        expect(ServiceLocator.tryConsume('MaybeService')).toBeUndefined();
    });

    it('should return all service names via debug', () => {
        ServiceLocator.provide('Debug1', {});
        ServiceLocator.provide('Debug2', {});
        const keys = ServiceLocator.debug();
        expect(keys).toContain('Debug1');
        expect(keys).toContain('Debug2');
    });
});
