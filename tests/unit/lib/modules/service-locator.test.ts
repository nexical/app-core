import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/modules/hooks', () => ({
    HookSystem: {
        dispatch: vi.fn()
    }
}));

describe('ServiceLocator', () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    const getServiceLocator = async () => {
        const { ServiceLocator } = await import('@/lib/modules/service-locator');
        return ServiceLocator;
    };

    it('should provide and consume a service', async () => {
        const ServiceLocator = await getServiceLocator();
        const { HookSystem } = await import('@/lib/modules/hooks');

        const mockService = { id: 1 };
        ServiceLocator.provide('TestService', mockService);

        const retrieved = ServiceLocator.consume('TestService');
        expect(retrieved).toBe(mockService);
        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.service.provided', { name: 'TestService' });
    });

    it('should throw if service not found', async () => {
        const ServiceLocator = await getServiceLocator();
        expect(() => ServiceLocator.consume('MissingService')).toThrow('[ServiceLocator] Service \'MissingService\' not found');
    });

    it('should return undefined for tryConsume if not found', async () => {
        const ServiceLocator = await getServiceLocator();
        expect(ServiceLocator.tryConsume('MissingService')).toBeUndefined();
    });

    it('should return service for tryConsume if found', async () => {
        const ServiceLocator = await getServiceLocator();
        const mockService = { id: 2 };
        ServiceLocator.provide('TryService', mockService);
        expect(ServiceLocator.tryConsume('TryService')).toBe(mockService);
    });

    it('should list services in debug', async () => {
        const ServiceLocator = await getServiceLocator();
        ServiceLocator.provide('D1', {});
        ServiceLocator.provide('D2', {});
        const list = ServiceLocator.debug();
        expect(list).toContain('D1');
        expect(list).toContain('D2');
    });

    it('should warn when overwriting a service', async () => {
        const ServiceLocator = await getServiceLocator();
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        ServiceLocator.provide('OverwriteService', { v: 1 });
        ServiceLocator.provide('OverwriteService', { v: 2 });
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Service \'OverwriteService\' is being overwritten'));
    });
});
