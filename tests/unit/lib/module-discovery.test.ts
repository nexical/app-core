
import { describe, it, expect } from 'vitest';
import { ModuleDiscovery } from '@/lib/modules/module-discovery';

describe('ModuleDiscovery Integration', () => {
    it('should load modules from the filesystem', async () => {
        const modules = await ModuleDiscovery.loadModules();
        expect(modules.length).toBeGreaterThan(0);

        // Verify User module is present and correctly typed
        const userModule = modules.find(m => m.name === 'user-api');
        expect(userModule).toBeDefined();
        expect(userModule?.config.type).toBe('feature');
        expect(userModule?.config.order).toBe(50);
    });

    it('should have basic valid structure for all loaded modules', async () => {
        const modules = await ModuleDiscovery.loadModules();
        for (const mod of modules) {
            expect(mod.name).toBeDefined();
            expect(mod.path).toContain(mod.name);
            expect(mod.config).toBeDefined();
            expect(mod.config.type).toBeDefined(); // Defaults to feature
            expect(typeof mod.config.order).toBe('number'); // Defaults to 50
        }
    });
});
